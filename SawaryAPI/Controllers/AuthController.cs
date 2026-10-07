using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SawaryAPI.Data;
using SawaryAPI.DTOs.Auth;
using SawaryAPI.Services;

namespace SawaryAPI.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, JwtService jwt) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await db.AdminUsers
            .FirstOrDefaultAsync(u => u.Username == dto.Username);

        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "بيانات الدخول غير صحيحة" });

        var (token, expiresAt) = jwt.GenerateToken(user);

        return Ok(new TokenResponseDto
        {
            Token = token,
            Username = user.Username,
            ExpiresAt = expiresAt,
        });
    }

    // Lets the Next.js frontend confirm a bearer token is a valid admin session (used by its
    // /api/revalidate route before it purges cached pages) without sharing the JWT signing key.
    [Authorize]
    [HttpGet("verify")]
    public IActionResult Verify() => NoContent();
}
