using Backend.API.Models;
using Backend.API.Models.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Backend.API.Interfaces;
using System.Data;
using Microsoft.AspNetCore.Identity.Data;

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
                return BadRequest(new ApiErrorDto { });
            }
            return Ok();
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            var loginResult = await _authService.LoginAsync(model);
            if (loginResult is null)
            {
                return BadRequest(new ApiErrorDto { });
            }
            return Ok(loginResult);
        }

        [HttpPost("refresh")] // TODO How to create refresh token during login?
        public async Task<IActionResult> Refresh(RefreshRequestDto refreshRequest)
        {
            var refreshResult = await _authService.RefreshToken(refreshRequest);
            if (refreshRequest is null)
            {
                return BadRequest();
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