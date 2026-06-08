using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETMs.Data.Entities
{
    public class DepartmentBudget
    {
        public int Id { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public decimal BudgetLimit { get; set; }
    }
}
