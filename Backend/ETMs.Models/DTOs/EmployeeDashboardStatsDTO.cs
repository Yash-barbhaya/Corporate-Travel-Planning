using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace ETMs.Models.DTOs
{
    public class EmployeeDashboardStatsDTO
    {
        public int TotalTrips { get; set; }
        public int PendingApprovals { get; set; }
        public decimal ApprovedBudgetSpent { get; set; }
        public decimal TotalAllocatedBudget { get; set; }
        public decimal RemainingBudget { get; set; }
        public double BudgetUtilizationPercentage { get; set; } // For your Frontend Budget Gauge
        public int RejectedRequests { get; set; } // 🎯 Add this line!
        // 🟢 FIXED: Use the DTO layer type instead of leaking the core database entity
        public List<TravelRequestCreateDTO> RecentRequests { get; set; } = new List<TravelRequestCreateDTO>();

        public double TravelPercentage { get; set; }
        public double HotelPercentage { get; set; }
        public double MealsPercentage { get; set; }
        public double OtherPercentage { get; set; }
    }
}
