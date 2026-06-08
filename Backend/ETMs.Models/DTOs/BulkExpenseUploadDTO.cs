using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace ETMs.Models.DTOs
{
    // Represents a single row item in your Angular bulk entry grid
    public class ExpenseItemDTO
    {
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? Description { get; set; }

        // This index links this row to the specific file position in your uploaded receipts array
        public int FileIndex { get; set; }
    }
    // Container matching your entire grid form submission
    public class BulkExpenseUploadDTO
    {
        public int TravelRequestId { get; set; }
        public List<ExpenseItemDTO> Expenses { get; set; } = new List<ExpenseItemDTO>();
        public List<IFormFile> Receipts { get; set; } = new List<IFormFile>();
    }
}

