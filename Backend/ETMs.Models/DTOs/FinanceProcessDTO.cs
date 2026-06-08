using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETMs.Models.DTOs
{
    public class FinanceProcessDTO
    {
        [Required]
        public int TravelRequestId { get; set; }

        [Required]
        // True = ApprovedByFinance (Paid/Reimbursed), False = Rejected
        public bool IsSettled { get; set; }

        public string? FinanceRemarks { get; set; }
    }
}
