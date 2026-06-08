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
    public class DepartmentBudgetRepository : IDepartmentBudgetRepository
    {
        private readonly ApplicationDbContext _context;

        public DepartmentBudgetRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DepartmentBudget>> GetBudgetsAsync()
        {
            return await _context.DepartmentBudgets
                .OrderBy(b => b.DepartmentName)
                .ToListAsync();
        }

        public async Task<DepartmentBudget?> GetByDepartmentNameAsync(string departmentName)
        {
            return await _context.DepartmentBudgets
                .FirstOrDefaultAsync(b => b.DepartmentName.ToLower() == departmentName.ToLower());
        }

        public async Task AddOrUpdateBudgetAsync(DepartmentBudget budget)
        {
            var existing = await GetByDepartmentNameAsync(budget.DepartmentName);
            if (existing == null)
            {
                await _context.DepartmentBudgets.AddAsync(budget);
            }
            else
            {
                existing.BudgetLimit = budget.BudgetLimit;
                _context.DepartmentBudgets.Update(existing);
            }
            await _context.SaveChangesAsync();
        }
    }
}
