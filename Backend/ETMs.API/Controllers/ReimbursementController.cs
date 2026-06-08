using ETMs.Models.DTOs;
using ETMs.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ETMs.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ReimbursementController : ControllerBase
    {
        private readonly IExpenseService _expenseService;

        public ReimbursementController(IExpenseService expenseService)
        {
            _expenseService = expenseService;
        }

        // GET: api/Reimbursement/my-claims
        [HttpGet("my-claims")]
        public async Task<IActionResult> GetMyClaims()
        {
            try
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
                int currentUserId = int.Parse(userIdStr);

                var claims = await _expenseService.GetEmployeeReimbursementsAsync(currentUserId);
                return Ok(claims);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error loading reimbursement claims data record.", error = ex.Message });
            }
        }

        // POST: api/Reimbursement/approve
        // POST: api/Reimbursement/approve
        [HttpPost("approve")]
        // 🎯 FIXED: Roles combined into a single attribute string using commas (Acts as an OR condition)
        [Authorize(Roles = "Finance,finance,manager")]
        public async Task<IActionResult> ApproveClaim([FromBody] ReimbursementApprovalDTO dto)
        {
            try
            {
                // Grab the Approver's User ID out of the JWT token context securely
                var approverIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(approverIdStr)) return Unauthorized();
                int currentApproverId = int.Parse(approverIdStr);

                // Dispatch the DTO down to our business logic layer rules service
                var isSuccess = await _expenseService.ProcessReimbursementApprovalAsync(dto, currentApproverId);
                if (isSuccess)
                {
                    return Ok(new { message = "Reimbursement processing completed successfully!" });
                }

                return BadRequest(new { message = "Failed to update or process reimbursement item." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while evaluating reimbursement routing rules.", error = ex.Message });
            }
        }

        // GET: api/Reimbursement/pending-approvals
        [HttpGet("pending-approvals")]
        [Authorize(Roles = "Finance,finance,manager")]
        public async Task<IActionResult> GetPendingApprovals()
        {
            try
            {
                // 1. Pull the User ID out of the JWT token context
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
                int currentUserId = int.Parse(userIdStr);

                // 2. Pull the Role out of the JWT token context
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "manager";

                // 3. Fetch the custom-filtered list
                var pendingClaims = await _expenseService.GetPendingReimbursementsForReviewAsync(currentUserId, userRole);
                return Ok(pendingClaims);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error pulling approval records.", error = ex.Message });
            }
        }
    }
}