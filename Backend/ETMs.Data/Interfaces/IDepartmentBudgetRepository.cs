using ETMs.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETMs.Data.Interfaces
{
    public interface IDepartmentBudgetRepository
    {
        Task<IEnumerable<DepartmentBudget>> GetBudgetsAsync();
        Task<DepartmentBudget?> GetByDepartmentNameAsync(string departmentName);
        Task AddOrUpdateBudgetAsync(DepartmentBudget budget);
    }
}
