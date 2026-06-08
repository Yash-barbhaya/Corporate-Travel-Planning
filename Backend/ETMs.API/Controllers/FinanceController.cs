using System.Security.Claims;
using ETMs.Models.DTOs;
using ETMs.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ETMs.API.Controllers
{
    [Authorize(Roles = "Finance,finance")]
    [ApiController]
    [Route("api/[controller]")]
    public class FinanceController : ControllerBase
    {
        private readonly ITravelService _travelService;

        public FinanceController(ITravelService travelService)
        {
            _travelService = travelService;
        }

        [HttpGet("pending-approvals")] // Matches: api/Finance/pending-approvals
        public async Task<IActionResult> GetPendingApprovals()
        {
            var requests = await _travelService.GetFinancePendingRequestsAsync();
            return Ok(requests);
        }

        [HttpPut("approve/{id}")] // Matches: api/Finance/approve/{id}
        public async Task<IActionResult> ApproveRequest(int id)
        {
            // 🎯 Extracts the active auditor's unique ID from the incoming HTTP Bearer token
            var financeUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var dto = new FinanceProcessDTO { TravelRequestId = id, IsSettled = true };

            // ✅ FIXED: Now passing the extracted financeUserId as the second argument
            var result = await _travelService.ProcessFinanceSettlementAsync(dto, financeUserId);

            if (!result) return NotFound(new { message = "Travel request not found." });

            return Ok(new { message = "Request finalized by finance successfully." });
        }

        [HttpPut("reject/{id}")] // Matches: api/Finance/reject/{id}
        public async Task<IActionResult> RejectRequest(int id, [FromBody] RejectInput input)
        {
            // 🎯 Extracts the active auditor's unique ID from the incoming HTTP Bearer token
            var financeUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var dto = new FinanceProcessDTO { TravelRequestId = id, IsSettled = false, FinanceRemarks = input.Reason };

            // ✅ FIXED: Now passing the extracted financeUserId as the second argument
            var result = await _travelService.ProcessFinanceSettlementAsync(dto, financeUserId);

            if (!result) return NotFound(new { message = "Travel request not found." });

            return Ok(new { message = "Request rejected by finance auditing." });
        }
    }
}