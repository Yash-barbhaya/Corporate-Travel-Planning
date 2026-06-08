using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETMs.Models.Enums
{
    public enum TravelStatus
    {
        Pending = 1,
        ApprovedByManager = 2,
        ApprovedByFinance = 3,
        Rejected = 4
    }
}
