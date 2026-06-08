using ETMs.Models.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETMs.Data.Entities
{
    public class TravelRequest
    {
        public int Id { get; set; }
        public string FromLocation { get; set; } = string.Empty;
        public string Destination { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Purpose { get; set; }

        // Default new requests to Pending
        public TravelStatus Status { get; set; } = TravelStatus.Pending;
        public string? RejectionReason { get; set; } // Filled if a manager/finance rejects it

        public decimal EstimatedBudget { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign Key linking to the User who created it
        public int UserId { get; set; }

        // Navigation Property for Entity Framework
        public User? User { get; set; } = null!;

        // 🎯 ADD THIS TO CONNECT THE ONE-TO-MANY RELATIONSHIP WORKFLOW:
        public ICollection<Itinerary> Itineraries { get; set; } = new List<Itinerary>();
        public ICollection<Expense> Expenses { get; set; } = new List<Expense>();

        public int? FinanceApprovedById { get; set; } // Foreign key to Users table

        [ForeignKey("FinanceApprovedById")]
        public virtual User? FinanceApprovedBy { get; set; } // Navigation property

        public int? ManagerApprovedById { get; set; } // Foreign key to Users table for manager action

        [ForeignKey("ManagerApprovedById")]
        public virtual User? ManagerApprovedBy { get; set; } // Navigation property

        public int? AdminApprovedById { get; set; } // Foreign key to Users table for admin action

        [ForeignKey("AdminApprovedById")]
        public virtual User? AdminApprovedBy { get; set; } // Navigation property
    }
}
