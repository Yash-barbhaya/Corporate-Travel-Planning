using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace ETMs.Models.DTOs
{
    public class ManagerApprovalDTO
    {
        [Required]
        public int TravelRequestId { get; set; }

        [Required]
        // Expects true for Approve (moves to ApprovedByManager), false for Reject (moves to Rejected)
        public bool IsApproved { get; set; }

        public string? RejectionReason { get; set; }
    }
}
