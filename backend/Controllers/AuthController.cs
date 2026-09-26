using backend.Dtos.Auth;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        try
        {
            var response = await authService.RegisterAsync(request);

            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var response = await authService.LoginAsync(request);

        if (response is null)
        {
            return Unauthorized(new { message = "Invalid username or password." });
        }

        return Ok(response);
    }
}