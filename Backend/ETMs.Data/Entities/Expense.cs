using ETMs.Models.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETMs.Data.Entities
{
    public class Expense
    {
        public int Id { get; set; }

        public ExpenseType Type { get; set; } // Uses our new Enum
        public decimal Amount { get; set; }
        public string? Description { get; set; }

        // This will store the relative secure path to the file on the server's disk
        public string ReceiptFilePath { get; set; }

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        // Foreign Key linking back to the specific Travel Request
        public int TravelRequestId { get; set; }

        // Navigation property for Entity Framework Core
        public TravelRequest TravelRequest { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        // 💰 The amount the manager explicitly approves for payment
        public decimal ApprovedAmount { get; set; }

        // 📝 Notes added by the manager explaining an over-budget capping or rejection
        public string? ManagerNotes { get; set; }

        // ⚡ Tracks the current status using our brand new Enum mapping layout
        public ReimbursementStatus ReimbursementStatus { get; set; } = ReimbursementStatus.Pending;
    }
}
