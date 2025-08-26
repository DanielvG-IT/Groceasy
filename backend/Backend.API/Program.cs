using Backend.API.Data;
using Backend.API.Models;
using Backend.API.Handlers;
using Backend.API.Services;
using Backend.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Assign variables for later use.
var connectionString = builder.Configuration.GetConnectionString("GroceasyDbConnection") ?? throw new InvalidOperationException("Missing connection string: 'GroceasyDbConnection'. Please ensure it is set in your appsettings.json or environment variables.");
var issuer = builder.Configuration["JwtSettings:Issuer"] ?? throw new InvalidOperationException("Missing configuration value: 'JwtSettings:Issuer'. Please ensure it is set in your appsettings.json or environment variables.");
var audience = builder.Configuration["JwtSettings:Audience"] ?? throw new InvalidOperationException("Missing configuration value: 'JwtSettings:Audience'. Please ensure it is set in your appsettings.json or environment variables.");
var key = builder.Configuration["JwtSettings:SecretKey"] ?? throw new InvalidOperationException("Missing configuration value: 'JwtSettings:SecretKey'. Please ensure it is set in your appsettings.json or environment variables.");
var frontendUrl = builder.Configuration["Settings:FrontendUrl"] ?? throw new InvalidOperationException("Missing configuration value: 'FrontendUrl'. Please ensure it is set in your appsettings.json or environment variables.");

// Add services to the container.
builder.Services.AddIdentity<AppUser, IdentityRole>().AddEntityFrameworkStores<ApplicationDbContext>().AddDefaultTokenProviders();
builder.Services.Configure<IdentityOptions>(i =>
{
    i.Password.RequireDigit = true;
    i.Password.RequireLowercase = true;
    i.Password.RequireUppercase = true;
    i.Password.RequireNonAlphanumeric = true;
    i.Password.RequiredLength = 12;

    i.User.RequireUniqueEmail = true;

    i.Lockout.MaxFailedAccessAttempts = 5;
    i.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);

    i.SignIn.RequireConfirmedEmail = false;
    i.SignIn.RequireConfirmedAccount = false;
    i.SignIn.RequireConfirmedPhoneNumber = false;
});
builder.Services.AddDbContext<ApplicationDbContext>(o =>
    o.UseNpgsql(connectionString)
);
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(x =>
{
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidIssuer = issuer,
        ValidateIssuer = true,
        ValidAudience = audience,
        ValidateAudience = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
        ValidateIssuerSigningKey = true,
        ValidateLifetime = true
    };
});
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAuthorizationHandler, HouseholdRoleHandler>();
builder.Services.AddAuthorizationBuilder()
  .AddPolicy("BeMember", policy =>
        policy.Requirements.Add(new HouseholdRoleRequirement(HouseholdRole.Reader)))
  .AddPolicy("RequireShopper", policy =>
        policy.Requirements.Add(new HouseholdRoleRequirement(HouseholdRole.Shopper)))
  .AddPolicy("RequireEditor", policy =>
        policy.Requirements.Add(new HouseholdRoleRequirement(HouseholdRole.Editor)))
  .AddPolicy("RequireManager", policy =>
        policy.Requirements.Add(new HouseholdRoleRequirement(HouseholdRole.Manager)));

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(frontendUrl)
              .AllowCredentials()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/status", (HttpContext http) =>
{
    var result = new
    {
        status = "OK",
        scheme = http.Request.Scheme,       // "http" or "https"
        isHttps = http.Request.IsHttps,
        host = http.Request.Host.Value,
        path = http.Request.Path,
        method = http.Request.Method,
        utcNow = DateTime.UtcNow
    };

    return Results.Ok(result);
});

app.Run();
