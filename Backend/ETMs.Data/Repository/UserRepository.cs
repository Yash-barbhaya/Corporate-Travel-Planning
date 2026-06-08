using ETMs.Data.Context;
using ETMs.Data.Entities;
using ETMs.Data.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETMs.Data.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            // Async/Await database call to fetch the user matching the email
            return await _context.Users
                .Include(u => u.Manager)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _context.Users
                .Include(u => u.Manager)
                .OrderBy(u => u.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<User>> GetManagersAsync()
        {
            return await _context.Users
                .Where(u => u.Role == "Manager" || u.Role == "manager" || u.Role == "Admin" || u.Role == "admin") // Admins or Managers can be managers
                .OrderBy(u => u.Name)
                .ToListAsync();
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _context.Users
                .Include(u => u.Manager)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task AddUserAsync(User user)
        {
            user.Created_At = DateTime.UtcNow;
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateUserAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }
    }
}
