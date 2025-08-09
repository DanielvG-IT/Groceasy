using Backend.API.Models;
using Backend.API.Interfaces;
using Backend.API.Models.Auth;
using Backend.API.Models.Errors;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.Security.Cryptography;
using System.IdentityModel.Tokens.Jwt;

namespace Backend.API.Services
{
    public class AuthService(
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        ILogger<AuthService> logger,
        IConfiguration configuration) : IAuthService
    {
        private readonly UserManager<AppUser> _userManager = userManager;
        private readonly SignInManager<AppUser> _signInManager = signInManager;
        private readonly ILogger<AuthService> _logger = logger;
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

        public async Task<IOperationResult<TokenResponseDto?>> LoginAsync(LoginModel model)
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

            try
            {
                var result = await _signInManager.PasswordSignInAsync(model.Email, model.Password, model.RememberMe, false);
                if (!result.Succeeded)
                {
                    _logger.LogWarning("Login failed: Invalid credentials for Email {Email}.", model.Email);
                    return OperationResult<TokenResponseDto?>.Failed(new ApiErrorDto
                    {
                        Title = "Invalid credentials.",
                        ErrorCode = "InvalidCredentials",
                    });
                }

                var appUser = await _userManager.FindByEmailAsync(model.Email);
                if (appUser is null)
                {
                    _logger.LogError("Login failed: User not found for Email {Email}.", model.Email);
                    return OperationResult<TokenResponseDto?>.Failed(new ApiErrorDto
                    {
                        Title = "User not found.",
                        ErrorCode = "UserNotFound",
                    });
                }

                // TODO Add 2FA support
                //

                // TODO Add Email Verification
                // if (!appUser.EmailConfirmed)
                // {
                //     _logger.LogWarning("Login failed: Email {Email} is not confirmed.", model.Email);
                //     return OperationResult.Failed(new ApiErrorDto
                //     {
                //     Title = "Email is not confirmed.",
                //     ErrorCode = "EmailNotConfirmed",
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

                var refreshToken = await GenerateRefreshToken(appUser);
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
                    Token = token,
                    TokenExpiry = DateTime.UtcNow.AddMinutes(TokenExpiryTimeMin),
                    RefreshToken = refreshToken,
                    RefreshTokenExpiry = DateTime.UtcNow.AddDays(RefreshTokenExpiryTimeDays)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unexpected error occurred during login.");
                return OperationResult<TokenResponseDto?>.Failed(new ApiErrorDto
                {
                    Title = "An unexpected error occurred. Please try again later.",
                    ErrorCode = "UnexpectedError",
                });
            }
        }

        public async Task<IOperationResult<TokenResponseDto?>> RefreshToken(RefreshRequestDto request)
        {
            var appUser = await _userManager.FindByIdAsync(request.UserId);
            if (appUser is null || appUser.RefreshToken != request.RefreshToken || appUser.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                _logger.LogError("Refresh token failed: Invalid refresh token or user not found.");
                return OperationResult<TokenResponseDto?>.Failed(new ApiErrorDto
                {
                    Title = "Invalid refresh token or user not found.",
                    ErrorCode = "InvalidRefreshToken",
                });
            }

            var token = GenerateToken(appUser);
            if (string.IsNullOrEmpty(token))
            {
                _logger.LogError("Refresh token failed: Token generation failed for UserId {UserId}.", request.UserId);
                return OperationResult<TokenResponseDto?>.Failed(new ApiErrorDto
                {
                    Title = "Token generation failed.",
                    ErrorCode = "TokenGenerationFailed",
                });
            }

            var newRefreshToken = await GenerateRefreshToken(appUser);
            if (string.IsNullOrEmpty(newRefreshToken))
            {
                _logger.LogError("Refresh token failed: Refresh token generation failed for UserId {UserId}.", request.UserId);
                return OperationResult<TokenResponseDto?>.Failed(new ApiErrorDto
                {
                    Title = "Refresh token generation failed.",
                    ErrorCode = "RefreshTokenGenerationFailed",
                });
            }

            return OperationResult<TokenResponseDto?>.Success(new TokenResponseDto
            {
                Token = token,
                TokenExpiry = DateTime.UtcNow.AddMinutes(TokenExpiryTimeMin),
                RefreshToken = newRefreshToken,
                RefreshTokenExpiry = DateTime.UtcNow.AddHours(RefreshTokenExpiryTimeDays)
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

        private async Task<string> GenerateRefreshToken(AppUser appUser)
        {
            appUser.RefreshToken = GenerateRandomStringB64();
            appUser.RefreshTokenExpiryTime = DateTime.UtcNow.AddHours(RefreshTokenExpiryTimeDays);
            await _userManager.UpdateAsync(appUser);
            return appUser.RefreshToken;
        }

        private static string GenerateRandomStringB64()
        {
            using var rng = RandomNumberGenerator.Create();
            var randomNumber = new byte[RefreshTokenLength];
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}