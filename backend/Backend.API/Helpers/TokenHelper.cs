using System.Text;
using System.Security.Cryptography;

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
    }
}