namespace Backend.API.Models.Auth
{
    public class RefreshRequestDto
    {
        public string UserId { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}