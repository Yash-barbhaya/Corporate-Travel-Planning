using ETMs.Models.DTOs;
using ETMs.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ETMs.API.Controllers
{
    [Authorize] // Requires a valid JWT token passed in the Authorization header
    [ApiController]
    [Route("api/[controller]")]
    public class TravelController : Controller
    {
        private readonly ITravelService _travelService;

        public TravelController(ITravelService travelService)
        {
            _travelService = travelService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateRequest([FromBody] TravelRequestCreateDTO dto)
        {
            try
            {
                // Extracts the UserId claim automatically embedded inside the user's active JWT token
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

                int userId = int.Parse(userIdStr);
                var result = await _travelService.CreateRequestAsync(dto, userId);

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("my-trips")]
        public async Task<IActionResult> GetMyTrips()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            int userId = int.Parse(userIdStr);
            var trips = await _travelService.GetEmployeeTripsAsync(userId);

            return Ok(trips);
        }

        [HttpGet("dashboard-stats")]
        [Authorize]
        public async Task<IActionResult> GetEmployeeDashboardStats()
        {
            var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            int currentUserId = int.Parse(userIdString);

            // 🎯 Calls the Service layer directly!
            var statisticsData = await _travelService.GetEmployeeDashboardStatsAsync(currentUserId);
            return Ok(statisticsData);
        }


        //[HttpGet("{id}")]
        //public async Task<IActionResult> GetRequestById(int id)
        //{
        //    try
        //    {
        //        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        //        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
        //        int currentUserId = int.Parse(userIdStr);

        //        // Call the service layer to pull the specific trip request
        //        var request = await _travelService.GetRequestByIdAsync(id);

        //        if (request == null)
        //        {
        //            return NotFound(new { message = "Travel request not found." });
        //        }

        //        // 🎯 FIX: Read the user's role claim out of the active JWT token
        //        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        //        // Security Check: Allow access if it's their own trip OR if the user is a Manager/Admin
        //        if (request.UserId != currentUserId && userRole != "Manager" && userRole != "Admin")
        //        {
        //            return Forbid(); // Securely blocks unrelated employees, but lets Rajesh pass!
        //        }

        //        return Ok(request);
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { message = "An error occurred while retrieving data.", error = ex.Message });
        //    }
        //}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRequestById(int id)
        {
            try
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
                int currentUserId = int.Parse(userIdStr);

                // Call the service layer to pull the specific trip request
                var request = await _travelService.GetRequestByIdAsync(id);

                if (request == null)
                {
                    return NotFound(new { message = "Travel request not found." });
                }

                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                // Security Check: Allow access if it's their own trip OR if the user is a Manager/Admin/Finance (case-insensitive)
                if (request.UserId != currentUserId && 
                    !string.Equals(userRole, "Manager", StringComparison.OrdinalIgnoreCase) && 
                    !string.Equals(userRole, "Admin", StringComparison.OrdinalIgnoreCase) && 
                    !string.Equals(userRole, "Finance", StringComparison.OrdinalIgnoreCase))
                {
                    return Forbid(); // Securely blocks unrelated employees, but lets Rajesh and Priya pass!
                }

                return Ok(request);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving data.", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTravelRequest(int id)
        {
            try
            {
                // Extracts the authenticated worker's ID out of the JWT principal claim context
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
                int currentUserId = int.Parse(userIdStr);

                // 🎯 Pass responsibility entirely down to the service layer!
                await _travelService.DeleteTravelRequestAsync(id, currentUserId);

                return Ok(new { message = "Request deleted successfully from database and manager queue!" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(); // 403 Forbidden if they try to hack another user's ID
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("user/{userId}/recent")]
        public async Task<IActionResult> GetRecentRequests(int userId, [FromQuery] int limit = 5)
        {
            try
            {
                // Pulls all the trips for the user using your existing service layer method
                var trips = await _travelService.GetEmployeeTripsAsync(userId);

                if (trips == null) return Ok(new List<object>());

                // Filter, order by newest, and take the specified limit (3)
                var recentTrips = trips
                    .OrderByDescending(t => t.Id) // Assuming higher ID means newer, or use a date property if available
                    .Take(limit)
                    .ToList();

                return Ok(recentTrips);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching recent requests", error = ex.Message });
            }
        }
    }
}
