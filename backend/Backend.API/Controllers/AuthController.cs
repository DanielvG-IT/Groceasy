using Backend.API.Interfaces;
using Backend.API.Models.Auth;
using Backend.API.Models.Errors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

/// <summary>
/// Controller responsible for authentication-related endpoints such as registration, login, and token refresh.
/// </summary>
/// <remarks>
/// All endpoints are anonymous and use <see cref="ApiErrorDto"/> for error responses.
/// </remarks>
namespace Backend.API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("api/v1/[controller]")]
    public class AuthController(ILogger<AuthController> logger, IAuthService authService) : ControllerBase
    {
        private readonly ILogger<AuthController> _logger = logger;
        private readonly IAuthService _authService = authService;

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            var registerResult = await _authService.RegisterAsync(model);
            if (registerResult.Succeeded != true)
                return BadRequest(registerResult.Error);

            return Ok();
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            var loginResult = await _authService.LoginAsync(model, clientIp);
            if (loginResult.Succeeded != true || loginResult.Data is null)
                return BadRequest(loginResult.Error);

            var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

            Response.Cookies.Append("refreshToken", loginResult.Data.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = !isDevelopment, // only over HTTPS in non-development environments
                SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.None, // stricter policy in production
                Expires = loginResult.Data.RefreshTokenExpiry
            });

            return Ok(loginResult.Data);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken) || string.IsNullOrEmpty(refreshToken))
                return Unauthorized("Refresh token missing");


            var refreshResult = await _authService.RefreshAccessToken(refreshToken, clientIp);
            if (refreshResult.Succeeded != true || refreshResult.Data is null)
                return BadRequest(refreshResult.Error);

            Response.Cookies.Append("refreshToken", refreshResult.Data.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = refreshResult.Data.RefreshTokenExpiry
            });

            return Ok(refreshResult.Data);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            const string logoutReason = "User initiated logout";

            if (Request.Cookies.TryGetValue("refreshToken", out var refreshToken) && !string.IsNullOrEmpty(refreshToken))
            {
                var logoutResult = await _authService.LogoutWithRefreshTokenAsync(refreshToken, clientIp, logoutReason);
                if (logoutResult.Succeeded != true)
                    return BadRequest(logoutResult.Error);

                Response.Cookies.Delete("refreshToken");

                return Ok("Logged out successfully");
            }

            if (Request.Headers.TryGetValue("Authorization", out var accessTokenHeader) && !string.IsNullOrEmpty(accessTokenHeader))
            {
                var accessToken = accessTokenHeader.ToString().Replace("Bearer ", string.Empty);
                var logoutResult = await _authService.LogoutWithAccessTokenAsync(accessToken, clientIp, logoutReason);

                if (logoutResult.Succeeded != true)
                    return BadRequest(logoutResult.Error);

                Response.Cookies.Delete("refreshToken");

                return Ok("Logged out successfully");
            }

            return Unauthorized("No valid token provided");
        }
    }
}