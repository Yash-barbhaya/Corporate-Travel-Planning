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
    public class ExpenseRepository : IExpenseRepository
    {
        private readonly ApplicationDbContext _context;

        public ExpenseRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddExpensesBulkAsync(IEnumerable<Expense> expenses)
        {
            // Saves all rows from your Angular table to SQL Server in one batch execution
            await _context.Expenses.AddRangeAsync(expenses);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Expense>> GetExpensesByRequestIdAsync(int requestId)
        {
            // Fetches expenses, joins the Travel Request, and joins the User table to get the name
            return await _context.Expenses
                .Include(e => e.TravelRequest)
                    .ThenInclude(tr => tr.User)
                .Where(e => e.TravelRequestId == requestId)
                .ToListAsync();
        }
        // 🎯 NEW: Fetch all claims belonging to a specific logged-in Employee
        public async Task<List<Expense>> GetExpensesByUserIdAsync(int userId)
        {
            return await _context.Expenses
                .Include(e => e.TravelRequest)
                .Where(e => e.TravelRequest != null && e.TravelRequest.UserId == userId)
                .OrderByDescending(e => e.Id)
                .ToListAsync();
        }

        // 🎯 NEW: Fetch a single expense claim item for the Manager to evaluate boundaries
        public async Task<Expense?> GetExpenseByIdAsync(int expenseId)
        {
            return await _context.Expenses
                .Include(e => e.TravelRequest)
                .FirstOrDefaultAsync(e => e.Id == expenseId);
        }

        // 🎯 NEW: Track state modifications and push updates back down to PostgreSQL / SQL Server
        public async Task UpdateExpenseAsync(Expense expense)
        {
            _context.Expenses.Update(expense);
            await _context.SaveChangesAsync();
        }

    }
}
