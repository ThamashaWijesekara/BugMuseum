using System.IdentityModel.Tokens.Jwt;
using System.Text;
using BugMuseum.Api.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using BugMuseum.Api.Services;

// 0. Disable default claim mapping so ClaimTypes.NameIdentifier parses clean JWT claims
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<IPhotoService, PhotoService>();

// 1. Register PostgreSQL Database Context
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// 2. Configure CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJS", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 3. Configure JWT Authentication (Unified Key Config Path)
var jwtSecret = builder.Configuration["JwtSettings:Secret"]
    ?? "BugMuseumSuperSecretKeyForJWTAuth2026!MustBeAtLeast64BytesLongToSatisfyHmacRequirements";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "BugMuseumApi",
            ValidateAudience = true,
            ValidAudience = builder.Configuration["JwtSettings:Audience"] ?? "BugMuseumWeb",
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// 🚨 Add this line to register your new AiService 🚨
builder.Services.AddHttpClient<IAiService, AiService>();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowNextJS");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();