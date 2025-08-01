using Backend.API.Models;
using Backend.API.Interfaces;
using Backend.API.Models.Auth;
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

        private readonly int TokenExpiryTime = configuration.GetValue<int>("JwtSettings:TokenExpiryTime", 30);
        private readonly int RefreshTokenExpiryTime = configuration.GetValue<int>("JwtSettings:RefreshTokenExpiryTime", 24);
        private readonly int RefreshTokenLength = configuration.GetValue<int>("JwtSettings:RefreshTokenLength", 64);

        public async Task<IdentityResult> RegisterAsync(RegisterModel model)
        {
            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser is not null)
            {
                return IdentityResult.Failed(new IdentityError
                {
                    Code = "DuplicateEmail",
                    Description = "Email is already in use."
                });
            }

            var user = new AppUser { UserName = model.Email, Email = model.Email };
            return await _userManager.CreateAsync(user, model.Password);
        }

        public async Task<TokenResponseDto?> LoginAsync(LoginModel model)
        {
            var result = await _signInManager.PasswordSignInAsync(model.Email, model.Password, model.RememberMe, false);
            if (!result.Succeeded)
            {
                return null;
            }
            var appUser = await _userManager.FindByEmailAsync(model.Email);
            if (appUser is null)
            {
                return null;
            }

            var token = GenerateToken(appUser);
            var refreshToken = await GenerateRefreshToken(appUser);
            if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(refreshToken))
            {
                return null;
            }

            return new TokenResponseDto
            {
                Token = token,
                TokenExpiry = DateTime.UtcNow.AddMinutes(TokenExpiryTime),
                RefreshToken = refreshToken,
                RefreshTokenExpiry = DateTime.UtcNow.AddHours(RefreshTokenExpiryTime)
            };
        }

        public async Task<TokenResponseDto?> RefreshToken(RefreshRequestDto request)
        {
            var appUser = await _userManager.FindByIdAsync(request.UserId);
            if (appUser is null || appUser.RefreshToken != request.RefreshToken || appUser.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                _logger.LogError("Failed to generate token: AppUser is null or has an invalid Email.");
                return null;
            }

            var token = GenerateToken(appUser);
            var newRefreshToken = await GenerateRefreshToken(appUser);
            if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(newRefreshToken))
            {
                return null;
            }

            return new TokenResponseDto
            {
                Token = token,
                TokenExpiry = DateTime.UtcNow.AddMinutes(TokenExpiryTime),
                RefreshToken = newRefreshToken,
                RefreshTokenExpiry = DateTime.UtcNow.AddHours(RefreshTokenExpiryTime)
            };
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
                expires: DateTime.UtcNow.AddMinutes(TokenExpiryTime),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }

        private async Task<string> GenerateRefreshToken(AppUser appUser)
        {
            appUser.RefreshToken = GenerateRandomStringB64();
            appUser.RefreshTokenExpiryTime = DateTime.UtcNow.AddHours(RefreshTokenExpiryTime);
            await _userManager.UpdateAsync(appUser);
            return appUser.RefreshToken;
        }

        private string GenerateRandomStringB64()
        {
            using var rng = RandomNumberGenerator.Create();
            var randomNumber = new byte[RefreshTokenLength];
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}