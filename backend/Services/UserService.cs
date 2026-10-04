using backend.Data;
using backend.Dtos.Users;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class UserService(AppDbContext context)
{
    private readonly PasswordHasher<User> passwordHasher = new();

    public async Task<List<UserDto>> GetUsersAsync()
    {
        return await context.Users
            .OrderBy(u => u.FullName)
            .Select(u => new UserDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Username = u.Username,
                Role = u.Role
            })
            .ToListAsync();
    }

    public async Task<UserDto?> GetUserAsync(int id)
    {
        return await context.Users
            .Where(u => u.Id == id)
            .Select(u => new UserDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Username = u.Username,
                Role = u.Role
            })
            .FirstOrDefaultAsync();
    }

    public async Task<(bool Success, string Message, UserDto? User)> CreateUserAsync(
        CreateUserRequest request)
    {
        var username = request.Username.Trim();

        if (string.IsNullOrWhiteSpace(request.FullName))
            return (false, "Full name is required.", null);

        if (string.IsNullOrWhiteSpace(username))
            return (false, "Username is required.", null);

        if (string.IsNullOrWhiteSpace(request.Password))
            return (false, "Password is required.", null);

        if (request.Password.Length < 6)
            return (false, "Password must be at least 6 characters.", null);

        if (!IsValidRole(request.Role))
            return (false, "Role must be Admin or Cashier.", null);

        if (await context.Users.AnyAsync(u => u.Username == username))
            return (false, "Username already exists.", null);

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Username = username,
            Role = request.Role.Trim()
        };

        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        context.Users.Add(user);
        await context.SaveChangesAsync();

        return (true, "User created successfully.", ToDto(user));
    }

    public async Task<(bool Success, string Message, UserDto? User)> UpdateUserAsync(
        int id,
        UpdateUserRequest request)
    {
        var user = await context.Users.FindAsync(id);

        if (user is null)
            return (false, "User not found.", null);

        var username = request.Username.Trim();

        if (string.IsNullOrWhiteSpace(request.FullName))
            return (false, "Full name is required.", null);

        if (string.IsNullOrWhiteSpace(username))
            return (false, "Username is required.", null);

        if (!IsValidRole(request.Role))
            return (false, "Role must be Admin or Cashier.", null);

        if (await context.Users.AnyAsync(u =>
                u.Id != id &&
                u.Username == username))
        {
            return (false, "Username already exists.", null);
        }

        user.FullName = request.FullName.Trim();
        user.Username = username;
        user.Role = request.Role.Trim();

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            if (request.Password.Length < 6)
                return (false, "Password must be at least 6 characters.", null);

            user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
        }

        await context.SaveChangesAsync();

        return (true, "User updated successfully.", ToDto(user));
    }

    public async Task<(bool Success, string Message)> DeleteUserAsync(int id)
    {
        var user = await context.Users.FindAsync(id);

        if (user is null)
            return (false, "User not found.");

        context.Users.Remove(user);
        await context.SaveChangesAsync();

        return (true, "User deleted successfully.");
    }

    private static bool IsValidRole(string role)
    {
        return role.Trim() is "Admin" or "Cashier";
    }

    private static UserDto ToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Username = user.Username,
            Role = user.Role
        };
    }
}