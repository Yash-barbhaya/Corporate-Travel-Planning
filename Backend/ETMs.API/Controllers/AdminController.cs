using ETMs.Models.DTOs;
using ETMs.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ETMs.API.Controllers
{
    [Authorize(Roles = "Admin,admin")] // Restrict to admin role
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("requests")]
        public async Task<IActionResult> GetAllRequests()
        {
            var requests = await _adminService.GetAllTravelRequestsAsync();
            return Ok(requests);
        }

        [HttpPut("requests/{id}/approve")]
        public async Task<IActionResult> ApproveRequest(int id)
        {
            var adminIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminIdStr)) return Unauthorized();

            int adminUserId = int.Parse(adminIdStr);
            var success = await _adminService.ProcessAdminApprovalAsync(id, true, null, adminUserId);
            if (!success) return NotFound(new { message = "Travel request not found." });

            return Ok(new { message = "Request approved successfully." });
        }

        [HttpPut("requests/{id}/reject")]
        public async Task<IActionResult> RejectRequest(int id, [FromBody] RejectRequestDTO dto)
        {
            var adminIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminIdStr)) return Unauthorized();

            int adminUserId = int.Parse(adminIdStr);
            var success = await _adminService.ProcessAdminApprovalAsync(id, false, dto.RejectionReason, adminUserId);
            if (!success) return NotFound(new { message = "Travel request not found." });

            return Ok(new { message = "Request rejected successfully." });
        }

        [HttpGet("budgets")]
        public async Task<IActionResult> GetBudgets()
        {
            var budgets = await _adminService.GetDepartmentBudgetsAsync();
            return Ok(budgets);
        }

        [HttpPost("budgets")]
        public async Task<IActionResult> SetBudget([FromBody] SetBudgetDTO dto)
        {
            var success = await _adminService.SetDepartmentBudgetAsync(dto);
            return Ok(new { message = "Department budget updated successfully." });
        }

        [HttpGet("employees")]
        public async Task<IActionResult> GetEmployees()
        {
            var employees = await _adminService.GetEmployeesAsync();
            return Ok(employees);
        }

        [HttpGet("managers")]
        public async Task<IActionResult> GetManagers()
        {
            var managers = await _adminService.GetManagersAsync();
            return Ok(managers);
        }

        [HttpPost("employees")]
        public async Task<IActionResult> AddEmployee([FromBody] CreateEmployeeDTO dto)
        {
            try
            {
                var success = await _adminService.AddEmployeeAsync(dto);
                return Ok(new { message = "Employee created successfully." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("employees/{id}")]
        public async Task<IActionResult> UpdateEmployee(int id, [FromBody] UpdateEmployeeDTO dto)
        {
            try
            {
                var success = await _adminService.UpdateEmployeeAsync(id, dto);
                if (!success) return NotFound(new { message = "Employee not found." });

                return Ok(new { message = "Employee updated successfully." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("employees/{id}/toggle-status")]
        public async Task<IActionResult> ToggleEmployeeStatus(int id)
        {
            var success = await _adminService.ToggleEmployeeStatusAsync(id);
            if (!success) return NotFound(new { message = "Employee not found." });

            return Ok(new { message = "Employee status updated successfully." });
        }
    }

    public class RejectRequestDTO
    {
        public string? RejectionReason { get; set; }
    }
}
