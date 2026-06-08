using ETMs.Models.DTOs;
using ETMs.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ETMs.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDTO loginDto)
        {
            var result = await _authService.AuthenticateAsync(loginDto);

            if (result == null)
                return Unauthorized(new { message = "Invalid email or password" });

            return Ok(result);
        }
    }
}
