using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http; // Services project already knows this!
using ETMs.Models.DTOs;

namespace ETMs.Services.Interfaces
{
    public interface IExpenseService
    {
        Task<bool> UploadExpensesBulkAsync(BulkExpenseUploadDTO dto, List<IFormFile> receipts);
        // 🎯 NEW: Get all claims for an employee or manager view
        Task<List<ReimbursementViewDTO>> GetEmployeeReimbursementsAsync(int userId);

        // 🎯 NEW: Process the manager's approval or capping logic
        Task<bool> ProcessReimbursementApprovalAsync(ReimbursementApprovalDTO dto, int managerId);
        Task<List<ReimbursementViewDTO>> GetPendingReimbursementsForReviewAsync(int currentUserId, string userRole);
    }
}
