using ETMs.Models.DTOs;
using ETMs.Services.Interfaces; // 🎯 Replace with your actual Expense Service namespace
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ETMs.API.Controllers
{
    [Authorize] // 🔒 Secures all endpoints so only logged-in employees can upload bills
    [ApiController]
    [Route("api/[controller]")]
    public class ExpenseController : ControllerBase
    {
        private readonly IExpenseService _expenseService;

        public ExpenseController(IExpenseService expenseService)
        {
            _expenseService = expenseService;
        }


        //[HttpPost("upload-receipt")]
        //public async Task<IActionResult> UploadReceipt([FromForm] BulkExpenseUploadDTO dto)
        //{
        //    // 🎯 FIXED: Pulling the file collection directly out of the raw Request instance pipeline
        //    await Request.ReadFormAsync();
        //    var receipts = Request.Form?.Files?.ToList();

        //    // 1. Guard Clause: Make sure files are attached
        //    if (receipts == null || receipts.Count == 0)
        //    {
        //        return BadRequest(new { message = "Please upload at least one valid receipt file." });
        //    }

        //    try
        //    {
        //        // 2. Extract UserId out of JWT claims principal context
        //        var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        //        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
        //        int currentUserId = int.Parse(userIdStr);

        //        Console.WriteLine($"[API] Processing bulk upload containing {receipts.Count} file(s) for user ID: {currentUserId}");

        //        // 3. Calling your actual service method matching your interface
        //        var isSuccess = await _expenseService.UploadExpensesBulkAsync(dto, receipts);

        //        if (isSuccess)
        //        {
        //            return Ok(new { message = "Expenses and receipts uploaded successfully!" });
        //        }

        //        return BadRequest(new { message = "Failed to process expense files upload." });
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.ForegroundColor = ConsoleColor.Red;
        //        Console.WriteLine($"[CRITICAL ERROR] Bulk upload failed: {ex.Message}");
        //        Console.ResetColor();

        //        return StatusCode(500, new
        //        {
        //            message = "A server error occurred during bulk file processing.",
        //            error = ex.Message
        //        });
        //    }
        //}
        [HttpPost("upload-receipt")]
        [DisableRequestSizeLimit]
        [RequestFormLimits(MultipartBodyLengthLimit = 52428800)] // 50MB limit
        public async Task<IActionResult> UploadReceipt([FromForm] BulkExpenseUploadDTO dto)
        {
            try
            {
                // Await form reading inside the try-catch block to handle limit and I/O errors gracefully
                var form = await Request.ReadFormAsync();
                var receipts = form.Files?.ToList();

                if (receipts == null || receipts.Count == 0)
                {
                    return BadRequest(new { message = "Please upload at least one valid receipt file." });
                }

                var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
                int currentUserId = int.Parse(userIdStr);

                Console.WriteLine($"[API] Processing {receipts.Count} file(s) for user {currentUserId}");
                Console.WriteLine($"[API] DTO TravelRequestId: {dto.TravelRequestId}");
                Console.WriteLine($"[API] DTO Expenses count: {dto.Expenses?.Count ?? 0}");

                var isSuccess = await _expenseService.UploadExpensesBulkAsync(dto, receipts);

                if (isSuccess)
                {
                    return Ok(new { message = "Expenses and receipts uploaded successfully!" });
                }

                return BadRequest(new { message = "Failed to process expense files upload." });
            }
            catch (BadHttpRequestException ex)
            {
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine($"[API UPLOAD WARN] Bad request during file upload: {ex.Message}");
                Console.ResetColor();
                
                // If it is a request size issue, return 413 Payload Too Large
                if (ex.Message.Contains("too large", StringComparison.OrdinalIgnoreCase))
                {
                    return StatusCode(413, new { message = "File upload size exceeds the maximum allowed limit of 50MB.", error = ex.Message });
                }
                return BadRequest(new { message = "Invalid upload request.", error = ex.Message });
            }
            catch (System.IO.IOException ex)
            {
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine($"[API UPLOAD WARN] I/O Exception during file upload (network disconnect or client abort): {ex.Message}");
                Console.ResetColor();
                return StatusCode(408, new { message = "Network interruption or client disconnected during file upload.", error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"[API UPLOAD ERROR] Unauthorized disk write access: {ex.Message}");
                Console.ResetColor();
                return StatusCode(500, new { message = "Write permission denied on the server disk.", error = ex.Message });
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"[CRITICAL UPLOAD ERROR] {ex.Message}");
                Console.ResetColor();
                return StatusCode(500, new { message = "An internal server error occurred during bulk file processing.", error = ex.Message });
            }
        }
    }
}