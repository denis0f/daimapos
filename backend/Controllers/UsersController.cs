using backend.Dtos.Users;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController(UserService userService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetUsers()
    {
        return Ok(await userService.GetUsersAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUser(int id)
    {
        var user = await userService.GetUserAsync(id);

        if (user is null)
            return NotFound(new { message = "User not found." });

        return Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser(
        CreateUserRequest request)
    {
        var result = await userService.CreateUserAsync(request);

        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return CreatedAtAction(
            nameof(GetUser),
            new { id = result.User!.Id },
            result.User);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> UpdateUser(
        int id,
        UpdateUserRequest request)
    {
        var result = await userService.UpdateUserAsync(id, request);

        if (!result.Success)
        {
            if (result.Message == "User not found.")
                return NotFound(new { message = result.Message });

            return BadRequest(new { message = result.Message });
        }

        return Ok(result.User);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var result = await userService.DeleteUserAsync(id);

        if (!result.Success)
            return NotFound(new { message = result.Message });

        return Ok(new { message = result.Message });
    }
}