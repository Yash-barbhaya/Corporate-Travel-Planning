using ETMs.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETMs.Data.Interfaces
{
    public interface IExpenseRepository
    {
        Task AddExpensesBulkAsync(IEnumerable<Expense> expenses);
        Task<IEnumerable<Expense>> GetExpensesByRequestIdAsync(int requestId);
        Task<List<Expense>> GetExpensesByUserIdAsync(int userId);
        Task<Expense?> GetExpenseByIdAsync(int expenseId);
        Task UpdateExpenseAsync(Expense expense);
    }
}
