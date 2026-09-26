namespace backend.Dtos.Auth;

public class RegisterRequest
{
    public string FullName { get; set; } = string.Empty;

    public string Username { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;

    public string Username { get; set; } = string.Empty;
}