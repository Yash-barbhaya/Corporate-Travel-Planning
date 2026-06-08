using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETMs.Models.Enums
{
    public enum ReimbursementStatus
    {
        Pending = 1,
        PartiallyApproved = 2,
        FullyApproved = 3,
        OutOfBudget = 4
    }
}
