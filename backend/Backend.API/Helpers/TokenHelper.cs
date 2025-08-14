using System.Text;
using System.Security.Claims;
using System.Security.Cryptography;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;

namespace Backend.API.Helpers
{
    public class TokenHelper
    {
        public static string RandomTokenUrlSafe(int bytes = 64)
        {
            var buf = new byte[bytes];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(buf);

            // base64url encode
            var b64 = Convert.ToBase64String(buf);
            return b64.Replace("+", "-").Replace("/", "_").TrimEnd('=');
        }

        public static string HashToken(string token)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
            return Convert.ToHexString(bytes).ToLowerInvariant(); // .NET 5+ convert to hex
        }

        public static ClaimsPrincipal? GetPrincipalFromExpiredToken(string token, IConfiguration configuration)
        {
            var secretKey = configuration.GetValue<string>("JwtSettings:SecretKey");
            if (string.IsNullOrWhiteSpace(secretKey))
            {
                throw new ArgumentException("Secret key is missing in configuration.");
            }

            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = false // We are only interested in extracting claims, not validating expiration
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            try
            {
                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);
                if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                    !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha512, StringComparison.InvariantCultureIgnoreCase))
                {
                    throw new SecurityTokenException("Invalid token");
                }

                return principal;
            }
            catch
            {
                return null; // Return null if token validation fails
            }
        }
    }
}