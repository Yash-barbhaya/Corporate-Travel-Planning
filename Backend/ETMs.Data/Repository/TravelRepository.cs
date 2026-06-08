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
    public class TravelRepository : ITravelRepository
    {
        private readonly ApplicationDbContext _context;

        public TravelRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<TravelRequest> AddRequestAsync(TravelRequest request)
        {
            await _context.TravelRequests.AddAsync(request);
            await _context.SaveChangesAsync();
            return request;
        }

        public async Task<IEnumerable<TravelRequest>> GetRequestsByUserIdAsync(int userId)
        {
            return await _context.TravelRequests
                .Include(tr => tr.User)
                    .ThenInclude(u => u.Manager) // 🎯 FIXED: This now properly drills into the User entity to fetch the Manager!
                .Include(tr => tr.Itineraries)   // Eagerly loads day-by-day itineraries cleanly
                .Include(tr => tr.ManagerApprovedBy)
                .Include(tr => tr.FinanceApprovedBy)
                .Include(tr => tr.AdminApprovedBy)
                .Where(tr => tr.UserId == userId && tr.User.IsActive)
                .OrderByDescending(tr => tr.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<TravelRequest>> GetPendingRequestsForManagerAsync(int managerId)
        {
            return await _context.TravelRequests
                .Include(tr => tr.User)
                .Include(tr => tr.ManagerApprovedBy)
                .Include(tr => tr.FinanceApprovedBy)
                .Include(tr => tr.AdminApprovedBy)
                .Where(tr => tr.User.Manager_Id == managerId
                          && tr.Status == ETMs.Models.Enums.TravelStatus.Pending
                          && tr.User.IsActive)
                .OrderByDescending(tr => tr.CreatedAt)
                .ToListAsync();
        }

        public async Task<TravelRequest?> GetRequestByIdAsync(int requestId)
        {
            return await _context.TravelRequests
                .Include(tr => tr.User)
                .Include(tr => tr.Itineraries)
                .Include(tr => tr.ManagerApprovedBy)
                .Include(tr => tr.FinanceApprovedBy)
                .Include(tr => tr.AdminApprovedBy)
                .FirstOrDefaultAsync(tr => tr.Id == requestId);
        }

        public async Task UpdateRequestAsync(TravelRequest request)
        {
            _context.TravelRequests.Update(request);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<TravelRequest>> GetPendingClearanceRequestsAsync()
        {
            return await _context.TravelRequests
                .Include(tr => tr.User)
                .Include(tr => tr.ManagerApprovedBy)
                .Include(tr => tr.FinanceApprovedBy)
                .Include(tr => tr.AdminApprovedBy)
                .Where(tr => tr.Status == ETMs.Models.Enums.TravelStatus.ApprovedByManager && tr.User.IsActive)
                .OrderByDescending(tr => tr.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<TravelRequest>> GetRequestsByUserIdRawAsync(int userId)
        {
            return await _context.TravelRequests
                .Where(r => r.UserId == userId)
                .ToListAsync();
        }

        public async Task DeleteRequestAsync(TravelRequest request)
        {
            _context.TravelRequests.Remove(request);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<TravelRequest>> GetAllRequestsAsync()
        {
            return await _context.TravelRequests
                .Include(tr => tr.User)
                    .ThenInclude(u => u.Manager)
                .Include(tr => tr.ManagerApprovedBy)
                .Include(tr => tr.FinanceApprovedBy)
                .Include(tr => tr.AdminApprovedBy)
                .OrderByDescending(tr => tr.CreatedAt)
                .ToListAsync();
        }
    }
}