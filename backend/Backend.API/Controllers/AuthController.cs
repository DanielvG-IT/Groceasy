using Backend.API.Models;
using Backend.API.Interfaces;
using Backend.API.Models.Auth;
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
            if (registerResult is null || registerResult.Succeeded != true)
            {
                return BadRequest(new ApiErrorDto
                {
                    Title = "Registration Failed",
                    ErrorCode = "RegistrationError",
                    Timestamp = DateTimeOffset.UtcNow,
                    Detail = "The registration process encountered an error. Please try again.",
                    Status = StatusCodes.Status400BadRequest
                });
            }
            return Ok();
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            var loginResult = await _authService.LoginAsync(model);
            if (loginResult is null)
            {
                return BadRequest(new ApiErrorDto
                {
                    Title = "Invalid Login",
                    ErrorCode = "InvalidCredentials",
                    Timestamp = DateTimeOffset.UtcNow,
                    Detail = "The provided login credentials are incorrect.",
                    Status = StatusCodes.Status400BadRequest
                });
            }
            return Ok(loginResult);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh(RefreshRequestDto refreshRequest)
        {
            var refreshResult = await _authService.RefreshToken(refreshRequest);
            if (refreshResult is null)
            {
                return BadRequest(new ApiErrorDto
                {
                    Title = "Invalid Refresh Token",
                    ErrorCode = "InvalidToken",
                    Timestamp = DateTimeOffset.UtcNow,
                    Detail = "The provided refresh token is invalid or has expired.",
                    Status = StatusCodes.Status400BadRequest
                });
            }
            return Ok(refreshResult);
        }

        // [HttpPost("logout")] // TODO How to invalidate users Jwt token?
        // public async Task<IActionResult> Logout()
        // {
        //     throw new NotImplementedException();
        // }
    }
}