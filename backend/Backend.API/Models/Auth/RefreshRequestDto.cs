namespace Backend.API.Models.Auth
{
    public class RefreshRequestDto
    {
        public string RefreshToken { get; set; } = string.Empty;
    }
}