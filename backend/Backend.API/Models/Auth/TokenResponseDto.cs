namespace Backend.API.Models.Auth
{
    public class TokenResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public DateTime TokenExpiry { get; set; }
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime RefreshTokenExpiry { get; set; }
    }
}