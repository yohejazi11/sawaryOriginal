using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SawaryAPI.Models;

namespace SawaryAPI.Services;

public class JwtService(IConfiguration config)
{
    private readonly string _key = config["Jwt:Key"]!;
    private readonly string _issuer = config["Jwt:Issuer"]!;
    private readonly string _audience = config["Jwt:Audience"]!;
    private readonly int _expireHours = int.Parse(config["Jwt:ExpireHours"] ?? "24");

    public (string Token, DateTime ExpiresAt) GenerateToken(AdminUser user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddHours(_expireHours);

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: expires,
            signingCredentials: creds);

        return (new JwtSecurityTokenHandler().WriteToken(token), expires);
    }
}
