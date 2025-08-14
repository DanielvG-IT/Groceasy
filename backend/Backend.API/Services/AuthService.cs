using Backend.API.Data;
using Backend.API.Models;
using Backend.API.Helpers;
using Backend.API.Interfaces;
using Backend.API.Models.Auth;
using Backend.API.Models.Errors;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace Backend.API.Services
{
    public class AuthService(
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        ILogger<AuthService> logger,
        ApplicationDbContext dbContext,
        IConfiguration configuration) : IAuthService
    {
        private readonly UserManager<AppUser> _userManager = userManager;
        private readonly SignInManager<AppUser> _signInManager = signInManager;
        private readonly ILogger<AuthService> _logger = logger;
        private readonly ApplicationDbContext _dbContext = dbContext;
        private readonly IConfiguration _configuration = configuration;

        private const int TokenExpiryTimeMin = 15;// 15 minutes
        private const int RefreshTokenExpiryTimeDays = 7; // 7 Days
        private const int RefreshTokenLength = 64;

        public async Task<IOperationResult> RegisterAsync(RegisterModel model)
        {
            if (model is null)
            {
                _logger.LogError("Registration failed: Model is null.");
                return OperationResult.Failed(new ApiErrorDto
                {
                    Title = "Input is invalid.",
                    ErrorCode = "InvalidModel",
                });
            }

            if (string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.Password))
            {
                _logger.LogError("Registration failed: Email or Password is empty.");
                return OperationResult.Failed(new ApiErrorDto
                {
                    Title = "Email and Password are required.",
                    ErrorCode = "InvalidInput",
                });
            }

            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser is not null)
            {
                _logger.LogWarning("Registration failed: Email is already in use.");
                return OperationResult.Failed(new ApiErrorDto
                {
                    Title = "Email is already in use.",
                    ErrorCode = "DuplicateEmail",
                });
            }

            var user = new AppUser
            {
                UserName = model.Email,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName
            };

            try
            {
                var result = await _userManager.CreateAsync(user, model.Password);
                if (!result.Succeeded)
                {
                    _logger.LogError("Registration failed: {Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
                    return OperationResult.Failed(new ApiErrorDto
                    {
                        Title = result.Errors.First().Description,
                        ErrorCode = result.Errors.First().Code,
                    });
                }

                return OperationResult.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unexpected error occurred during registration.");
                return OperationResult.Failed(new ApiErrorDto
                {
                    Title = "An unexpected error occurred. Please try again later.",
                    ErrorCode = "UnexpectedError",
                });
            }
        }

        public async Task<IOperationResult<TokenResponseDto?>> LoginAsync(LoginModel model, string clientIp)
        {
            if (model is null)
            {
                _logger.LogError("Login failed: Model is null.");
                return OperationResult<TokenResponseDto?>.Failed(new ApiErrorDto
                {
                    Title = "Input is invalid.",
                    ErrorCode = "InvalidModel",
                });
            }

            if (string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.Password))
            {
                _logger.LogError("Login failed: Email or Password is empty.");
                return OperationResult<TokenResponseDto?>.Failed(new ApiErrorDto
                {
                    Title = "Email and Password are required.",
                    ErrorCode = "InvalidInput",
                });
            }

            var appUser = await _userManager.FindByEmailAsync(model.Email);
            if (appUser is null)
            {
                _logger.LogWarning("Login failed: User not found for Email {Email}.", model.Email);
                return OperationResult<TokenResponseDto?>.Failed(new ApiErrorDto
                {
                    Title = "Invalid credentials.",
                    ErrorCode = "InvalidCredentials",
                });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(appUser, model.Password, false);
            if (!result.Succeeded)
            {
                _logger.LogWarning("Login failed: Invalid credentials for Email {Email}.", model.Email);
                return OperationResult<TokenResponseDto?>.Failed(new ApiErrorDto
                {
                    Title = "Invalid credentials.",
                    ErrorCode = "InvalidCredentials",
                });
            }

            // TODO Add 2FA support

            // TODO Add Email Verification
            // if (!appUser.EmailConfirmed)
            // {
            //     _logger.LogWarning("Login failed: Email {Email} is not confirmed.", model.Email);
            //     return OperationResult.Failed(new ApiErrorDto
            //     {
            //         Title = "Email is not confirmed.",
            //         ErrorCode = "EmailNotConfirmed",
            //     });
            // }

            var token = GenerateToken(appUser);
            if (string.IsNullOrEmpty(token))
            {
                _logger.LogError("Login failed: Token generation failed for Email {Email}.", model.Email);
                return OperationResult<TokenResponseDto?>.Failed(new ApiErrorDto
                {
                    Title = "Token generation failed.",
                    ErrorCode = "TokenGenerationFailed",
                });
            }

            var refreshToken = await CreateRefreshToken(appUser, clientIp);
            if (string.IsNullOrEmpty(refreshToken))
            {
                _logger.LogError("Login failed: Refresh token generation failed for Email {Email}.", model.Email);
                return OperationResult<TokenResponseDto?>.Failed(new ApiErrorDto
                {
                    Title = "Refresh token generation failed.",
                    ErrorCode = "RefreshTokenGenerationFailed",
                });
            }

            return OperationResult<TokenResponseDto?>.Success(new TokenResponseDto
            {
                AccessToken = token,
                AccessTokenExpiry = DateTime.UtcNow.AddMinutes(TokenExpiryTimeMin),
                RefreshToken = refreshToken,
                RefreshTokenExpiry = DateTime.UtcNow.AddDays(RefreshTokenExpiryTimeDays)
            });
        }

        public async Task<IOperationResult<TokenResponseDto?>> RefreshAccessToken(string refToken, string clientIp)
        {
            var refTokenHashed = TokenHelper.HashToken(refToken);
            var existingToken = await _dbContext.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.TokenHash == refTokenHashed);

            if (existingToken is null)
            {
                _logger.LogError("Refresh token failed: Invalid refresh token.");
                return OperationResult<TokenResponseDto?>.Failed(new ApiErrorDto
                {
                    Title = "Invalid refresh token.",
                    ErrorCode = "InvalidRefreshToken",
                });
            }

            if (!existingToken.IsActive)
            {
                // If a revoked token is used, revoke ALL user's refresh tokens
                await RevokeAllUserRefreshTokens(existingToken.UserId, clientIp, "Detected use of revoked token");
                return OperationResult<TokenResponseDto?>.Failed(new ApiErrorDto
                {
                    Title = "Refresh token is no longer valid.",
                    ErrorCode = "InvalidRefreshToken",
                });
            }

            var appUser = await _userManager.FindByIdAsync(existingToken.UserId);
            if (appUser is null)
            {
                return OperationResult<TokenResponseDto?>.Failed(new ApiErrorDto
                {
                    Title = "User not found.",
                    ErrorCode = "UserNotFound",
                });
            }

            // Revoke the current refresh token
            existingToken.Revoked = DateTime.UtcNow;
            existingToken.RevokedByIp = clientIp;

            // Create new refresh token
            var newRefreshTokenPlain = TokenHelper.RandomTokenUrlSafe(64);
            var newRefreshTokenHash = TokenHelper.HashToken(newRefreshTokenPlain);

            var newRefreshToken = new RefreshToken
            {
                UserId = appUser.Id,
                TokenHash = newRefreshTokenHash,
                Expires = DateTime.UtcNow.AddDays(RefreshTokenExpiryTimeDays),
                Created = DateTime.UtcNow,
                CreatedByIp = clientIp
            };

            existingToken.ReplacedByTokenHash = newRefreshTokenHash;

            _dbContext.RefreshTokens.Add(newRefreshToken);
            await _dbContext.SaveChangesAsync();

            // Create new access token
            var newAccessToken = GenerateToken(appUser);

            if (string.IsNullOrEmpty(newAccessToken))
            {
                _logger.LogError("Failed to refresh access token: Token generation failed for UserId {UserId}.", appUser.Id);
                return OperationResult<TokenResponseDto?>.Failed(new ApiErrorDto
                {
                    Title = "Token generation failed.",
                    ErrorCode = "TokenGenerationFailed",
                });
            }

            return OperationResult<TokenResponseDto?>.Success(new TokenResponseDto
            {
                AccessToken = newAccessToken,
                AccessTokenExpiry = DateTime.UtcNow.AddMinutes(TokenExpiryTimeMin),
                RefreshToken = newRefreshTokenPlain,
                RefreshTokenExpiry = newRefreshToken.Expires
            });
        }

        private string? GenerateToken(AppUser appUser)
        {
            if (appUser is null || string.IsNullOrEmpty(appUser.Email))
            {
                _logger.LogError("Failed to generate token: AppUser is null or has an invalid Email.");
                return null;
            }

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, appUser.Id),
                new(ClaimTypes.Name, appUser.Email)
            };

            var secretKey = _configuration.GetValue<string>("JwtSettings:SecretKey");
            var issuer = _configuration.GetValue<string>("JwtSettings:Issuer");
            var audience = _configuration.GetValue<string>("JwtSettings:Audience");
            if (string.IsNullOrWhiteSpace(secretKey) || string.IsNullOrWhiteSpace(issuer) || string.IsNullOrWhiteSpace(audience))
            {
                _logger.LogError("Failed to generate token: Missing or invalid JwtSettings in configuration.");
                return null;
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);
            var tokenDescriptor = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(TokenExpiryTimeMin),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }

        private async Task<string> CreateRefreshToken(AppUser user, string createdByIp)
        {
            var plain = TokenHelper.RandomTokenUrlSafe(64);
            var hash = TokenHelper.HashToken(plain);

            var refresh = new RefreshToken
            {
                UserId = user.Id,
                TokenHash = hash,
                Expires = DateTime.UtcNow.AddDays(7),
                Created = DateTime.UtcNow,
                CreatedByIp = createdByIp
            };

            _dbContext.RefreshTokens.Add(refresh);
            await _dbContext.SaveChangesAsync();

            return plain; // return plain to be sent to client (store only hash in DB)
        }

        public async Task<IOperationResult> LogoutWithRefreshTokenAsync(string refreshToken, string requestIp, string reason)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                _logger.LogError("Revoke failed: RefreshToken is null or empty.");
                return OperationResult.Failed(new ApiErrorDto
                {
                    Title = "RefreshToken is required.",
                    ErrorCode = "InvalidRefreshToken",
                });
            }

            await RevokeToken(refreshToken, requestIp, reason);

            return OperationResult.Success();
        }

        public async Task<IOperationResult> LogoutWithAccessTokenAsync(string accessToken, string requestIp, string reason)
        {
            if (string.IsNullOrWhiteSpace(accessToken))
            {
                _logger.LogError("Revoke failed: AccessToken is null or empty.");
                return OperationResult.Failed(new ApiErrorDto
                {
                    Title = "AccessToken is required.",
                    ErrorCode = "InvalidAccessToken",
                });
            }

            var principal = TokenHelper.GetPrincipalFromExpiredToken(accessToken, _configuration);
            if (principal is null)
            {
                _logger.LogError("Revoke failed: Invalid access token.");
                return OperationResult.Failed(new ApiErrorDto
                {
                    Title = "Invalid access token.",
                    ErrorCode = "InvalidAccessToken",
                });
            }

            var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogError("Revoke failed: UserId not found in access token.");
                return OperationResult.Failed(new ApiErrorDto
                {
                    Title = "UserId not found in access token.",
                    ErrorCode = "UserIdNotFound",
                });
            }

            await RevokeAllUserRefreshTokens(userId, requestIp, reason);

            return OperationResult.Success();
        }

        private async Task RevokeToken(string refreshToken, string revokedByIp, string reason)
        {
            var hashedToken = TokenHelper.HashToken(refreshToken);
            var token = await _dbContext.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == hashedToken && rt.IsActive);

            if (token is null)
            {
                _logger.LogWarning("Attempted to revoke a non-existent or inactive refresh token.");
                return;
            }

            token.Revoked = DateTime.UtcNow;
            token.RevokedByIp = revokedByIp;
            token.ReplacedByTokenHash = null;

            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Revoked refresh token for user {UserId}: {Reason}", token.UserId, reason);
        }

        private async Task RevokeAllUserRefreshTokens(string userId, string revokedByIp, string reason)
        {
            var tokens = await _dbContext.RefreshTokens
                .Where(rt => rt.UserId == userId && rt.IsActive)
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.Revoked = DateTime.UtcNow;
                token.RevokedByIp = revokedByIp;
                token.ReplacedByTokenHash = null;
            }

            await _dbContext.SaveChangesAsync();

            _logger.LogWarning("Revoked all refresh tokens for user {UserId}: {Reason}", userId, reason);
        }
    }
}