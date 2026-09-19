using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SawaryAPI.Data;
using SawaryAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Required secrets — fail fast with a clear message instead of either running
//    insecurely or crashing later with a confusing crypto/SQL exception. appsettings.json
//    ships these empty on purpose; appsettings.Development.json supplies real values for
//    local dev, and production must set them via environment variables
//    (ConnectionStrings__DefaultConnection, Jwt__Key, Jwt__Issuer, Jwt__Audience).
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var jwtKeyValue = builder.Configuration["Jwt:Key"];
var jwtIssuerValue = builder.Configuration["Jwt:Issuer"];
var jwtAudienceValue = builder.Configuration["Jwt:Audience"];

var missing = new List<string>();
if (string.IsNullOrWhiteSpace(connectionString)) missing.Add("ConnectionStrings:DefaultConnection");
if (string.IsNullOrWhiteSpace(jwtKeyValue)) missing.Add("Jwt:Key");
if (string.IsNullOrWhiteSpace(jwtIssuerValue)) missing.Add("Jwt:Issuer");
if (string.IsNullOrWhiteSpace(jwtAudienceValue)) missing.Add("Jwt:Audience");
if (missing.Count > 0)
{
    throw new InvalidOperationException(
        $"Missing required configuration: {string.Join(", ", missing)}. " +
        "Set these as environment variables (e.g. Jwt__Key) in production, or run with " +
        "ASPNETCORE_ENVIRONMENT=Development to use appsettings.Development.json.");
}

// ── Database ──────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString!)); // validated non-empty above

// ── JWT Authentication ────────────────────────────────────────────────────────
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuerValue, // validated non-empty above
            ValidAudience = jwtAudienceValue, // validated non-empty above
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKeyValue!)), // validated non-empty above
            ClockSkew = TimeSpan.Zero,
        };
    });

builder.Services.AddAuthorization();

// ── CORS — origins from config (comma-separated AllowedOrigins) ──────────────
var allowedOrigins = builder.Configuration["AllowedOrigins"]
    ?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    ?? ["http://localhost:3000"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("NextJs", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// ── Forwarded headers — production runs behind a reverse proxy (Nginx/Caddy/LB)
//    terminating TLS and proxying to Kestrel over plain HTTP. Without this, every
//    Request.Scheme the controllers read (to build absolute image URLs) reports
//    "http" instead of "https", producing mixed http/https URLs for the same host —
//    which next/image's remotePatterns then rejects as a protocol mismatch.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // The proxy's IP isn't known at build time in this codebase (varies by host/
    // container network), so trust any forwarder — standard for a single reverse
    // proxy sitting directly in front of the app. Scope this to the proxy's actual
    // IP/subnet instead if Kestrel is ever reachable directly from the internet.
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

// ── Application services ──────────────────────────────────────────────────────
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<LocalImageStorageService>();

// ── Controllers & Swagger ─────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Sawary API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ── Apply pending EF Core migrations on startup — simplest possible deploy story,
//    no manual schema-import step (this is what SawaryAPI-PHP's schema.sql import
//    used to require by hand).
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// ── Middleware pipeline ───────────────────────────────────────────────────────
// Must run first so every later middleware/controller sees the real client scheme/host.
app.UseForwardedHeaders();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();
app.UseCors("NextJs");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
