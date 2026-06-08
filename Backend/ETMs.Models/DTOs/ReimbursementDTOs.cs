using ETMs.Models.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETMs.Models.DTOs
{
    // What the Manager sends when approving/capping a bill
    public class ReimbursementApprovalDTO
    {
        public int ExpenseId { get; set; }
        public decimal ApprovedAmount { get; set; }
        public string? ManagerNotes { get; set; }
        public ReimbursementStatus Status { get; set; }
    }

    // What is sent back to the frontend to display in the grid
    public class ReimbursementViewDTO
    {
        public int ExpenseId { get; set; }
        public int TravelRequestId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal RequestedAmount { get; set; }
        public decimal ApprovedAmount { get; set; }
        public decimal TotalTripBudget { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ManagerNotes { get; set; }
        public string? ReceiptFilePath { get; set; }
    }
}
