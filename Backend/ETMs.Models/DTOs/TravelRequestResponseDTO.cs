using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETMs.Models.DTOs
{
    public class TravelRequestResponseDTO
    {
        public int Id { get; set; }
        public string FromLocation { get; set; } = string.Empty;
        public string Destination { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Purpose { get; set; }
        public string Status { get; set; } // Enums converted to clean string text for UI badges
        public string RejectionReason { get; set; }
        public decimal EstimatedBudget { get; set; }
        public DateTime CreatedAt { get; set; }
        public int UserId { get; set; }
        public string EmployeeName { get; set; } // Useful context text for dashboards
        public string? ManagerName { get; set; }
        public string? ManagerApprovedByName { get; set; }
        public string? FinanceApprovedByName { get; set; }
        public string? AdminApprovedByName { get; set; }
        public string? EmployeeDepartment { get; set; }
        public bool IsOverBudget { get; set; }
    }
}
