using ETMs.Models.DTOs;
using ETMs.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ETMs.API.Controllers
{
    [Authorize(Roles = "Manager,manager")]
    [ApiController]
    [Route("api/[controller]")]
    public class ManagerController : ControllerBase
    {
        private readonly ITravelService _travelService;

        public ManagerController(ITravelService travelService)
        {
            _travelService = travelService;
        }

        [HttpGet("team-requests")] // Matches: api/Manager/team-requests
        public async Task<IActionResult> GetTeamRequests()
        {
            var managerIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(managerIdStr)) return Unauthorized();

            int managerId = int.Parse(managerIdStr);
            var requests = await _travelService.GetManagerPendingRequestsAsync(managerId);
            return Ok(requests);
        }

        [HttpPut("approve/{id}")] // Matches: api/Manager/approve/{id} via PUT
        public async Task<IActionResult> ApproveRequest(int id)
        {
            var managerIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(managerIdStr)) return Unauthorized();

            int managerId = int.Parse(managerIdStr);
            var dto = new ManagerApprovalDTO { TravelRequestId = id, IsApproved = true };

            var result = await _travelService.ProcessManagerApprovalAsync(dto, managerId);
            if (!result) return NotFound(new { message = "Travel request not found." });

            return Ok(new { message = "Request approved successfully." });
        }

        [HttpPut("reject/{id}")] // Matches: api/Manager/reject/{id} via PUT with string body
        public async Task<IActionResult> RejectRequest(int id, [FromBody] RejectInput input)
        {
            var managerIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(managerIdStr)) return Unauthorized();

            int managerId = int.Parse(managerIdStr);
            var dto = new ManagerApprovalDTO { TravelRequestId = id, IsApproved = false, RejectionReason = input.Reason };

            var result = await _travelService.ProcessManagerApprovalAsync(dto, managerId);
            if (!result) return NotFound(new { message = "Travel request not found." });

            return Ok(new { message = "Request rejected successfully." });
        }

        [HttpGet("budget")]
        public async Task<IActionResult> GetManagerDepartmentBudget()
        {
            var managerIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(managerIdStr)) return Unauthorized();

            int managerId = int.Parse(managerIdStr);
            var budget = await _travelService.GetManagerDepartmentBudgetAsync(managerId);
            if (budget == null) return NotFound(new { message = "Department budget not found for manager." });

            return Ok(budget);
        }
    }

    public class RejectInput
    {
        public string Reason { get; set; } = string.Empty;
    }
}
