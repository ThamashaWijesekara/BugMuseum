using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BugMuseum.Api.Data;
using BugMuseum.Api.DTOs;
using BugMuseum.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace BugMuseum.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
        {
            return BadRequest("Email is already registered.");
        }

        if (await _context.Users.AnyAsync(u => u.Username.ToLower() == dto.Username.ToLower()))
        {
            return BadRequest("Username is already taken.");
        }

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = CreateToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            Username = user.Username,
            UserId = user.Id
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid email or password.");
        }

        var token = CreateToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            Username = user.Username,
            UserId = user.Id
        });
    }

    private string CreateToken(User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email)
        };

        var secret = _configuration["JwtSettings:Secret"] 
            ?? "BugMuseumSuperSecretKeyForJWTAuth2026!MustBeAtLeast64BytesLongToSatisfyHmacRequirements";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = creds,
            Issuer = _configuration["JwtSettings:Issuer"] ?? "BugMuseumApi",
            Audience = _configuration["JwtSettings:Audience"] ?? "BugMuseumWeb"
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}