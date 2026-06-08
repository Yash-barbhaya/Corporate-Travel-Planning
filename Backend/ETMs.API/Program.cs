using ETMs.Data.Context;
using ETMs.Data.Interfaces;
using ETMs.Data.Repository;
using ETMs.Services.Implementations;
using ETMs.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ✅ Fix: Configure Kestrel to handle file uploads without crashing
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 52428800; // 50MB
});

// ✅ Fix: Configure multipart form options
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 52428800; // 50MB
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartHeadersLengthLimit = int.MaxValue;
});

// 1. Database Connection Configuration
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Register Dependency Injections (DI)
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
// Register Travel Layer Dependencies
builder.Services.AddScoped<ITravelRepository, TravelRepository>();
builder.Services.AddScoped<ITravelService, TravelService>();
builder.Services.AddDbContext<ApplicationDbContext>();
builder.Services.AddScoped<IExpenseRepository, ExpenseRepository>();
builder.Services.AddScoped<IExpenseService, ExpenseService>();
builder.Services.AddScoped<IDepartmentBudgetRepository, DepartmentBudgetRepository>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<ETMs.Data.Context.ApplicationDbContext>();
// 3. Configure JWT Authentication Guard
var jwtKey = builder.Configuration["Jwt:Key"]
     ?? throw new InvalidOperationException("Jwt:Key is missing from appsettings.json");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// 4. Enable CORS for your Angular Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200") // Change to your Angular local port if different
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    }); builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "ETMs API", Version = "v1" });

    // Define the Bearer Auth scheme
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
    c.CustomSchemaIds(type => type.FullName);
});
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngular"); // Activate CORS
app.UseHttpsRedirection();
// 🎯 MAKE YOUR UPLOADS FOLDER ACCESSIBLE TO ANGULAR:
var staticFilesFolder = @"D:\Travel Management System\Uploads";
try
{
    var driveRoot = Path.GetPathRoot(staticFilesFolder);
    if (string.IsNullOrEmpty(driveRoot) || !Directory.Exists(driveRoot))
    {
        throw new DirectoryNotFoundException("D drive is not available on this machine.");
    }
    if (!Directory.Exists(staticFilesFolder))
    {
        Directory.CreateDirectory(staticFilesFolder);
    }
}
catch (Exception ex)
{
    Console.ForegroundColor = ConsoleColor.Yellow;
    Console.WriteLine($"[WARN] Could not access static file folder '{staticFilesFolder}' ({ex.Message}). Falling back to local directory.");
    Console.ResetColor();

    staticFilesFolder = Path.Combine(builder.Environment.ContentRootPath, "Uploads");
    if (!Directory.Exists(staticFilesFolder))
    {
        Directory.CreateDirectory(staticFilesFolder);
    }
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(staticFilesFolder),
    RequestPath = "/Uploads"
});


app.UseAuthentication(); // Must be before Authorization
app.UseAuthorization();

app.MapControllers();

app.Run();