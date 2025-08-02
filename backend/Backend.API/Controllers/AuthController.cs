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
            var loginResult = await _authService.LoginAsync(model);
            if (loginResult.Succeeded != true)
                return BadRequest(loginResult.Error);

            return Ok(loginResult.Data);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh(RefreshRequestDto refreshRequest)
        {
            var refreshResult = await _authService.RefreshToken(refreshRequest);
            if (refreshResult.Succeeded != true)
                return BadRequest(refreshResult.Error);

            return Ok(refreshResult.Data);
        }

        // [HttpPost("logout")] // TODO How to invalidate users Jwt token?
        // public async Task<IActionResult> Logout()
        // {
        //     throw new NotImplementedException();
        // }
    }
}