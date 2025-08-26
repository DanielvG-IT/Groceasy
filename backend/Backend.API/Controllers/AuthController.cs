using Backend.API.Interfaces;
using Backend.API.Models.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Backend.API.Models;
using Backend.API.Models.Errors;

/// <summary>
/// Controller responsible for authentication-related endpoints such as registration, login, and token refresh.
/// </summary>
/// <remarks>
/// All endpoints are anonymous and use <see cref="ApiErrorDto"/> for error responses.
/// </remarks>
namespace Backend.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class AuthController(ILogger<AuthController> logger, IAuthService authService) : ControllerBase
    {
        private readonly ILogger<AuthController> _logger = logger;
        private readonly IAuthService _authService = authService;

        private const string refreshHeaderName = "X-Refresh-Token";

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            var registerResult = await _authService.RegisterAsync(model);
            if (registerResult.Succeeded != true)
                return BadRequest(registerResult.Error);

            return Ok();
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            var loginResult = await _authService.LoginAsync(model, clientIp);
            if (loginResult.Succeeded != true || loginResult.Data is null)
                return BadRequest(loginResult.Error);

            return Ok(loginResult.Data);
        }

        [AllowAnonymous]
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshRequestDto dto)
        {
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

            if (string.IsNullOrEmpty(dto.RefreshToken))
            {
                var error = new ApiErrorDto
                {
                    Title = "Refresh token missing",
                    ErrorCode = "RefreshTokenMissing",
                    Status = 401
                };
                return Unauthorized(error);
            }

            _logger.LogInformation("Refreshing token for IP {IP}", clientIp);

            var refreshResult = await _authService.RefreshAccessToken(dto.RefreshToken, clientIp);
            if (refreshResult.Succeeded != true || refreshResult.Data is null)
                return BadRequest(refreshResult.Error);

            return Ok(refreshResult.Data);
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] RefreshRequestDto dto)
        {
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            const string logoutReason = "User initiated logout";

            if (string.IsNullOrWhiteSpace(dto.RefreshToken))
            {
                var failedError = new ApiErrorDto
                {
                    Title = "Logout failed",
                    ErrorCode = "LogoutFailed",
                    Status = 400
                };
                return BadRequest(failedError);
            }

            var logoutResult = await _authService.LogoutWithRefreshTokenAsync(dto.RefreshToken, clientIp, logoutReason);
            if (!logoutResult.Succeeded)
                return BadRequest(logoutResult.Error);

            return Ok();
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                var notFoundError = new ApiErrorDto
                {
                    Title = "User ID not found in token",
                    ErrorCode = "UserIdNotFound",
                    Status = 401
                };
                return Unauthorized(notFoundError);
            }
            var user = await _authService.GetUserByIdAsync(userId);

            if (user is null || user.Data is null)
            {
                var notFoundError = new ApiErrorDto
                {
                    Title = "User not found",
                    ErrorCode = "UserNotFound",
                    Status = 404
                };
                return NotFound(notFoundError);
            }

            var dto = new CurrentUserDto
            {
                Id = user.Data.Id,
                Email = user.Data.Email!,
                FirstName = user.Data.FirstName,
                LastName = user.Data.LastName,
                HouseholdId = user.Data.HouseholdId,
                HouseholdName = user.Data.Household?.Name,
                Role = user.Data.Role
            };

            return Ok(dto);
        }

    }
}