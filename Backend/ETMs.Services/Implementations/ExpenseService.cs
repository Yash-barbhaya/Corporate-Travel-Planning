using ETMs.Data.Entities;
using ETMs.Data.Interfaces;
using ETMs.Models.DTOs;
using ETMs.Models.Enums;
using ETMs.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETMs.Services.Implementations
{
    public class ExpenseService : IExpenseService
    {
        private readonly IExpenseRepository _expenseRepository;
        private readonly ITravelRepository _travelRepository;
        private readonly ETMs.Data.Context.ApplicationDbContext _context; // 🎯 ADD THIS LINE

        public ExpenseService(IExpenseRepository expenseRepository,
            ITravelRepository travelRepository, 
            ETMs.Data.Context.ApplicationDbContext context)
        {
            _expenseRepository = expenseRepository;
            _travelRepository = travelRepository;
            _context = context; // 🎯 ADD THIS ASSIGNMENT
        }

        public async Task<bool> UploadExpensesBulkAsync(BulkExpenseUploadDTO dto, List<IFormFile> receipts)
        {
            try
            {
                // 1. Verify that the parent travel request exists
                var travelRequest = await _travelRepository.GetRequestByIdAsync(dto.TravelRequestId);
                if (travelRequest == null)
                {
                    Console.WriteLine($"[WARN] Travel Request ID {dto.TravelRequestId} not found.");
                    return false;
                }

                // 2. File validation whitelist
                var allowedExtensions = new[] { ".pdf", ".png", ".jpg", ".jpeg" };

                //// 3. Establish the permanent upload directories on the D Drive folder path
                //var uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Receipts");
                //if (!Directory.Exists(uploadFolder))
                //{
                //    Directory.CreateDirectory(uploadFolder);
                //}
                // 3. Establish the permanent upload directory (with fallback if D:\ drive does not exist/is inaccessible)
                var uploadFolder = @"D:\Travel Management System\Uploads";
                try
                {
                    var driveRoot = Path.GetPathRoot(uploadFolder);
                    if (string.IsNullOrEmpty(driveRoot) || !Directory.Exists(driveRoot))
                    {
                        throw new DirectoryNotFoundException("D drive is not available on this machine.");
                    }
                    if (!Directory.Exists(uploadFolder))
                    {
                        Directory.CreateDirectory(uploadFolder);
                    }
                }
                catch (Exception ex)
                {
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine($"[WARN] Could not access target upload folder '{uploadFolder}' ({ex.Message}). Falling back to local directory.");
                    Console.ResetColor();

                    // Safe fallback to application content root folder
                    uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
                    if (!Directory.Exists(uploadFolder))
                    {
                        Directory.CreateDirectory(uploadFolder);
                    }
                }
                    var expenseEntitiesList = new List<Expense>();

                // 🛡️ EXTRA GUARD: Ensure the DTO list itself isn't null before looping
                if (dto.Expenses == null || !dto.Expenses.Any())
                {
                    Console.WriteLine("[WARN] No expense text rows received in DTO.");
                    return false;
                }

                // 4. Process each grid row sent from the Angular client
                foreach (var item in dto.Expenses)
                {
                    // 🎯 FIXED SAFETY CHECK: Ensure the file list exists and index matches the true 'receipts' parameter count!
                    if (receipts == null || item.FileIndex < 0 || item.FileIndex >= receipts.Count)
                    {
                        Console.WriteLine($"[ERROR] FileIndex {item.FileIndex} is out of bounds for the {receipts?.Count ?? 0} uploaded files.");
                        return false;
                    }
                    

                    var file = receipts[item.FileIndex]; // 🎯 Using the real receipts parameter collection
                    var fileExtension = Path.GetExtension(file.FileName).ToLower();

                    // Security Check Enforcer
                    if (!allowedExtensions.Contains(fileExtension))
                    {
                        Console.WriteLine($"[SECURITY BLOCK] Extension '{fileExtension}' forbidden.");
                        return false;
                    }

                    // Generate unique filename to prevent disk collisions
                    var secureFileName = $"{Guid.NewGuid()}{fileExtension}";
                    var targetFilePath = Path.Combine(uploadFolder, secureFileName);

                    // Save binary stream down to physical storage folder
                    using (var stream = new FileStream(targetFilePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    // Map frontend string category selection directly to core backend Enum structures
                    if (!Enum.TryParse<ExpenseType>(item.Category, true, out var mappedEnumCategory))
                    {
                        mappedEnumCategory = ExpenseType.Other;
                    }

                    // 5. Construct persistence entity row
                    var expenseRecord = new Expense
                    {
                        TravelRequestId = dto.TravelRequestId,
                        Type = mappedEnumCategory,
                        Amount = item.Amount,
                        Description = item.Description,
                        ReceiptFilePath = Path.Combine(uploadFolder, secureFileName),

                        // 🎯 INSERT THESE THREE PROPERTY DEFAULTS TO RESTORE STACK FUNCTIONALITY:
                        ApprovedAmount = 0m,
                        ReimbursementStatus = ReimbursementStatus.Pending,
                        ManagerNotes = null
                    };

                    expenseEntitiesList.Add(expenseRecord);
                }

                // 6. Push unified batch directly to repository
                await _expenseRepository.AddExpensesBulkAsync(expenseEntitiesList);
                return true;
            }
            catch (Exception ex)
            {
                // 🎯 THE SAFETY NET: Keeps your server alive and prints the true error to your console!
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"[SERVICE CRASH CAUGHT] Exception details: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                Console.ResetColor();
                return false;
            }
        }

        public async Task<List<ReimbursementViewDTO>> GetEmployeeReimbursementsAsync(int userId)
        {
            // Fetch raw expense entities belonging to this user via repo
            var expenses = await _expenseRepository.GetExpensesByUserIdAsync(userId);
            var resultList = new List<ReimbursementViewDTO>();

            foreach (var exp in expenses)
            {
                resultList.Add(new ReimbursementViewDTO
                {
                    ExpenseId = exp.Id,
                    TravelRequestId = exp.TravelRequestId,
                    Category = exp.Type.ToString(),
                    RequestedAmount = exp.Amount, // Stored original value
                    ApprovedAmount = exp.ApprovedAmount, // Populated post-manager review
                    TotalTripBudget = exp.TravelRequest?.EstimatedBudget ?? 0,
                    Status = exp.ReimbursementStatus.ToString(),
                    ManagerNotes = exp.ManagerNotes,
                    ReceiptFilePath = exp.ReceiptFilePath
                });
            }

            return resultList;
        }

        public async Task<bool> ProcessReimbursementApprovalAsync(ReimbursementApprovalDTO dto, int managerId)
        {
            // 1. Grab the current active expense claim record
            var expense = await _expenseRepository.GetExpenseByIdAsync(dto.ExpenseId);
            if (expense == null) return false;

            // 2. Fetch the associated travel request parameters for budget parsing
            var travelRequest = await _travelRepository.GetRequestByIdAsync(expense.TravelRequestId);
            if (travelRequest == null) return false;

            // 3. APPLY CORE OVER-BUDGET BUSINESS LOGIC RULES
            if (dto.Status == ReimbursementStatus.FullyApproved || dto.Status == ReimbursementStatus.PartiallyApproved)
            {
                // If the approved amount is less than what was requested, it's a Partial Cap
                if (dto.ApprovedAmount < expense.Amount)
                {
                    expense.ReimbursementStatus = ReimbursementStatus.PartiallyApproved;
                    expense.ApprovedAmount = dto.ApprovedAmount;
                    expense.ManagerNotes = string.IsNullOrEmpty(dto.ManagerNotes)
                        ? $"Capped reimbursement. Excess amount over budget denied."
                        : dto.ManagerNotes;
                }
                else
                {
                    expense.ReimbursementStatus = ReimbursementStatus.FullyApproved;
                    expense.ApprovedAmount = expense.Amount;
                    expense.ManagerNotes = dto.ManagerNotes;
                }
            }
            else if (dto.Status == ReimbursementStatus.OutOfBudget)
            {
                expense.ReimbursementStatus = ReimbursementStatus.OutOfBudget;
                expense.ApprovedAmount = 0; // Payout blocked completely
                expense.ManagerNotes = dto.ManagerNotes ?? "Expense item flagged as completely out of corporate budget guidelines.";
            }

            // 4. Update records back down to database via repository
            await _expenseRepository.UpdateExpenseAsync(expense);
            return true;
        }

        // 🎯 ADD THIS NEW METHOD TO FETCH REVIEWS FOR MANAGER & FINANCE
        public async Task<List<ReimbursementViewDTO>> GetPendingReimbursementsForReviewAsync(int currentUserId, string userRole)
        {
            var filteredList = new List<ReimbursementViewDTO>();

            // 🎯 FIXED: Query directly from the DbContext and eagerly load the related tables
            var pendingExpenses = await _context.Expenses
                .Include(e => e.TravelRequest)
                    .ThenInclude(t => t.User)
                .Where(e => e.ReimbursementStatus == ReimbursementStatus.Pending)
                .ToListAsync();

            foreach (var exp in pendingExpenses)
            {
                // 🟢 RULE A: Finance sees EVERYTHING across the entire organization
                if (userRole == "Finance" || userRole == "finance")
                {
                    filteredList.Add(MapToReimbursementViewDTO(exp));
                }
                // 🟢 RULE B: Managers ONLY see claims from employees who report directly to them
                else if (exp.TravelRequest?.User?.Manager_Id == currentUserId)
                {
                    filteredList.Add(MapToReimbursementViewDTO(exp));
                }
            }

            return filteredList;
        }

        // 🎯 PASTE THIS INSIDE EXPENSESERVICE.CS TO CLEAR THE BUILD ERRORS
        private ReimbursementViewDTO MapToReimbursementViewDTO(Expense exp)
        {
            return new ReimbursementViewDTO
            {
                ExpenseId = exp.Id,
                TravelRequestId = exp.TravelRequestId,
                Category = exp.Type.ToString(),
                RequestedAmount = exp.Amount,
                ApprovedAmount = exp.ApprovedAmount,
                TotalTripBudget = exp.TravelRequest?.EstimatedBudget ?? 0,
                Status = exp.ReimbursementStatus.ToString(),

                Description = exp.Description,
                ManagerNotes = exp.ManagerNotes,
                ReceiptFilePath = exp.ReceiptFilePath,
                // Maps the relational link cleanly to your DTO's EmployeeName property!
                EmployeeName = exp.TravelRequest?.User?.Name ?? "Unknown Employee"
            };
        }

    }
}
