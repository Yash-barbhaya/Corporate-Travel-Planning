using ETMs.Data.Interfaces;
using ETMs.Models.DTOs;
using ETMs.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace ETMs.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _config;

        public AuthService(IUserRepository userRepository, IConfiguration config)
        {
            _userRepository = userRepository;
            _config = config;
        }

        public async Task<LoginResponseDTO> AuthenticateAsync(LoginRequestDTO loginDto)
        {
            var user = await _userRepository.GetUserByEmailAsync(loginDto.Email);

            // Plain text check for your existing database setup
            if (user == null || user.Password != loginDto.Password || !user.IsActive)
            {
                return null;
            }

            // Authentication successful, generate token
            var token = GenerateJwtToken(user);

            return new LoginResponseDTO
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role?.ToLower(),
                Department = user.Department,
                ManagerId = user.Manager_Id,
                Token = token,
                ManagerName = user.Manager?.Name ?? "No Manager Assigned"
            };
        }

        private string GenerateJwtToken(Data.Entities.User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role?.ToLower() ?? ""),
                    new Claim("Department", user.Department ?? ""),
                    new Claim("ManagerId", user.Manager_Id?.ToString() ?? "")
                }),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"]
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
