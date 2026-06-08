using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ETMs.Data.Entities;
using ETMs.Data.Interfaces;
using ETMs.Models.DTOs;
using ETMs.Services.Interfaces;

namespace ETMs.Services.Implementations
{
    public class TravelService : ITravelService
    {
        private readonly ITravelRepository _travelRepository;
        private readonly IUserRepository _userRepository;
        private readonly IDepartmentBudgetRepository _budgetRepository;

        public TravelService(ITravelRepository travelRepository, IUserRepository userRepository, IDepartmentBudgetRepository budgetRepository)
        {
            _travelRepository = travelRepository;
            _userRepository = userRepository;
            _budgetRepository = budgetRepository;
        }

        private async Task<IEnumerable<TravelRequestResponseDTO>> MapToResponseDTOsAsync(IEnumerable<TravelRequest> requests)
        {
            var budgets = (await _budgetRepository.GetBudgetsAsync())
                .ToDictionary(b => b.DepartmentName.ToLower(), b => b.BudgetLimit);

            var allRequests = await _travelRepository.GetAllRequestsAsync();
            var departmentActiveSpending = allRequests
                .Where(r => r.User != null && r.Status != ETMs.Models.Enums.TravelStatus.Rejected)
                .GroupBy(r => r.User.Department.ToLower())
                .ToDictionary(
                    g => g.Key,
                    g => g.Sum(r => r.EstimatedBudget)
                );

            return requests.Select(r =>
            {
                var dept = r.User?.Department?.ToLower() ?? "";
                var limit = budgets.ContainsKey(dept) ? budgets[dept] : 0m;
                var spent = departmentActiveSpending.ContainsKey(dept) ? departmentActiveSpending[dept] : 0m;
                bool isOverBudget = limit > 0 && spent > limit;

                return new TravelRequestResponseDTO
                {
                    Id = r.Id,
                    FromLocation = r.FromLocation,
                    Destination = r.Destination,
                    StartDate = r.StartDate,
                    EndDate = r.EndDate,
                    Purpose = r.Purpose,
                    Status = r.Status == ETMs.Models.Enums.TravelStatus.Pending ? "Pending" :
                             r.Status == ETMs.Models.Enums.TravelStatus.ApprovedByManager ? "Finance Pending" :
                             r.Status == ETMs.Models.Enums.TravelStatus.ApprovedByFinance ? "Approved" : "Rejected",
                    RejectionReason = r.RejectionReason,
                    EstimatedBudget = r.EstimatedBudget,
                    CreatedAt = r.CreatedAt,
                    UserId = r.UserId,
                    EmployeeName = r.User?.Name ?? string.Empty,
                    ManagerName = r.User?.Manager?.Name ?? "No Manager Assigned",
                    ManagerApprovedByName = r.ManagerApprovedBy?.Name,
                    FinanceApprovedByName = r.FinanceApprovedBy?.Name,
                    AdminApprovedByName = r.AdminApprovedBy?.Name,
                    EmployeeDepartment = r.User?.Department,
                    IsOverBudget = isOverBudget
                };
            }).ToList();
        }

        public async Task<TravelRequestResponseDTO> CreateRequestAsync(TravelRequestCreateDTO dto, int userId)
        {
            if (dto.StartDate < DateTime.UtcNow.Date)
                throw new ArgumentException("Start date cannot be in the past.");

            if (dto.EndDate < dto.StartDate)
                throw new ArgumentException("End date must be after the start date.");

            var requestEntity = new TravelRequest
            {
                FromLocation = dto.FromLocation,
                Destination = dto.Destination,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Purpose = dto.Purpose,
                EstimatedBudget = dto.EstimatedBudget,
                UserId = userId,
                Status = ETMs.Models.Enums.TravelStatus.Pending, // Ensure default state is set
                CreatedAt = DateTime.UtcNow,

                // 🎯 FIXED: Map the incoming DTO itinerary list straight to our core entities!
                Itineraries = dto.Itineraries.Select(i => new Itinerary
                {
                    Date = i.Date,
                    Location = i.Location,
                    ActivityDetails = i.ActivityDetails,
                    HotelOrAccommodation = i.HotelOrAccommodation
                }).ToList()
            };

            var savedEntity = await _travelRepository.AddRequestAsync(requestEntity);
            var loadedRequest = await _travelRepository.GetRequestByIdAsync(savedEntity.Id);
            var mappedList = await MapToResponseDTOsAsync(new List<TravelRequest> { loadedRequest ?? savedEntity });
            return mappedList.First();
        }

        public async Task<IEnumerable<TravelRequestResponseDTO>> GetEmployeeTripsAsync(int userId)
        {
            var requests = await _travelRepository.GetRequestsByUserIdAsync(userId);
            return await MapToResponseDTOsAsync(requests);
        }

        public async Task<EmployeeDashboardStatsDTO> GetDashboardStatsAsync(int userId)
        {
            // 1. Fetch all travel requests for the logged-in user from the database
            var requests = await _travelRepository.GetRequestsByUserIdAsync(userId);
            var requestList = requests.ToList();

            // 2. Compute the core numeric count statistics
            int totalTrips = requestList.Count;
            int pendingApprovals = requestList.Count(r =>
                r.Status == ETMs.Models.Enums.TravelStatus.Pending ||
                r.Status == ETMs.Models.Enums.TravelStatus.ApprovedByManager);

            // 3. Compute top-level budget metrics
            decimal totalAllocatedBudget = 250000.00m; // Updated to match your production layout asset limits
            decimal approvedBudgetSpent = requestList
                .Where(r => r.Status == ETMs.Models.Enums.TravelStatus.ApprovedByFinance)
                .Sum(r => r.EstimatedBudget);

            decimal remainingBudget = totalAllocatedBudget - approvedBudgetSpent;
            if (remainingBudget < 0) remainingBudget = 0;

            double utilizationPercentage = 0;
            if (totalAllocatedBudget > 0)
            {
                utilizationPercentage = Math.Round((double)(approvedBudgetSpent / totalAllocatedBudget) * 100, 1);
            }

            // 4. Extract and flatten all expense lines associated with these requests to calculate progress bars
            var allExpenses = requestList
                .Where(r => r.Expenses != null)
                .SelectMany(r => r.Expenses)
                .ToList();

            decimal totalExpensesSum = allExpenses.Sum(e => e.Amount);

            double travelPct = 0;
            double hotelPct = 0;
            double mealsPct = 0;
            double otherPct = 0;

            // Calculate individual category allocation ratios if any expenses have been filed
            if (totalExpensesSum > 0)
            {
                // 🎯 Travel percentage combines standard Travel (1) and Taxi (4) rows
                decimal travelAmount = allExpenses
                    .Where(e => (int)e.Type == 1 || (int)e.Type == 4)
                    .Sum(e => e.Amount);

                // 🎯 Hotel percentage tracks type index 2
                decimal hotelAmount = allExpenses
                    .Where(e => (int)e.Type == 2)
                    .Sum(e => e.Amount);

                // 🎯 Meals percentage tracks type index 3
                decimal mealsAmount = allExpenses
                    .Where(e => (int)e.Type == 3)
                    .Sum(e => e.Amount);

                // 🎯 Other tracks type index 5 or any unmapped/fallback values
                decimal otherAmount = allExpenses
                    .Where(e => (int)e.Type == 5)
                    .Sum(e => e.Amount);

                // In case there are items with unmapped statuses, add them to the remainder
                decimal assignedSum = travelAmount + hotelAmount + mealsAmount + otherAmount;
                if (assignedSum < totalExpensesSum)
                {
                    otherAmount += (totalExpensesSum - assignedSum);
                }

                // Convert the calculated values to single-decimal percentages for clean rendering
                travelPct = Math.Round((double)(travelAmount / totalExpensesSum) * 100, 1);
                hotelPct = Math.Round((double)(hotelAmount / totalExpensesSum) * 100, 1);
                mealsPct = Math.Round((double)(mealsAmount / totalExpensesSum) * 100, 1);
                otherPct = Math.Round((double)(otherAmount / totalExpensesSum) * 100, 1);
            }

            // 5. Construct and return the fully populated payload object back to the API pipeline layer
            return new EmployeeDashboardStatsDTO
            {
                TotalTrips = totalTrips,
                PendingApprovals = pendingApprovals,
                ApprovedBudgetSpent = approvedBudgetSpent,
                TotalAllocatedBudget = totalAllocatedBudget,
                RemainingBudget = remainingBudget,
                BudgetUtilizationPercentage = utilizationPercentage,

                // Count the rejected items to populate the fourth summary card
                RejectedRequests = requestList.Count(r => r.Status == ETMs.Models.Enums.TravelStatus.Rejected),

                // Mapped UI properties to bind the frontend HTML width styles dynamically
                TravelPercentage = travelPct,
                HotelPercentage = hotelPct,
                MealsPercentage = mealsPct,
                OtherPercentage = otherPct
            };
        }

        public async Task<IEnumerable<TravelRequestResponseDTO>> GetManagerPendingRequestsAsync(int managerId)
        {
            var requests = await _travelRepository.GetPendingRequestsForManagerAsync(managerId);
            return await MapToResponseDTOsAsync(requests);
        }

        public async Task<bool> ProcessManagerApprovalAsync(ManagerApprovalDTO dto, int managerId)
        {
            var travelRequest = await _travelRepository.GetRequestByIdAsync(dto.TravelRequestId);

            if (travelRequest == null) return false;
            if (travelRequest.User?.Manager_Id != managerId)
                throw new UnauthorizedAccessException("You are not authorized to review this employee's request.");
            if (travelRequest.Status != ETMs.Models.Enums.TravelStatus.Pending)
                throw new InvalidOperationException("This request has already been processed.");

            travelRequest.ManagerApprovedById = managerId;

            if (dto.IsApproved)
            {
                travelRequest.Status = ETMs.Models.Enums.TravelStatus.ApprovedByManager;
            }
            else
            {
                travelRequest.Status = ETMs.Models.Enums.TravelStatus.Rejected;
                travelRequest.RejectionReason = dto.RejectionReason ?? "Rejected by Manager.";
            }

            await _travelRepository.UpdateRequestAsync(travelRequest);
            return true;
        }

        public async Task<IEnumerable<TravelRequestResponseDTO>> GetFinancePendingRequestsAsync()
        {
            var requests = await _travelRepository.GetPendingClearanceRequestsAsync();
            return await MapToResponseDTOsAsync(requests);
        }

        public async Task<bool> ProcessFinanceSettlementAsync(FinanceProcessDTO dto, int financeUserId) // 👈 1. Added parameter here
        {
            var travelRequest = await _travelRepository.GetRequestByIdAsync(dto.TravelRequestId);
            if (travelRequest == null) return false;

            if (travelRequest.Status != ETMs.Models.Enums.TravelStatus.ApprovedByManager)
                throw new InvalidOperationException("This request cannot be settled because it hasn't passed Manager Approval.");

            travelRequest.FinanceApprovedById = financeUserId; // 🎯 2. Added stamp mapping here!

            if (dto.IsSettled)
            {
                travelRequest.Status = ETMs.Models.Enums.TravelStatus.ApprovedByFinance;
            }
            else
            {
                travelRequest.Status = ETMs.Models.Enums.TravelStatus.Rejected;
                travelRequest.RejectionReason = dto.FinanceRemarks ?? "Rejected by Finance Auditing.";
            }

            await _travelRepository.UpdateRequestAsync(travelRequest);
            return true;
        }

        public async Task<EmployeeDashboardStatsDTO> GetEmployeeDashboardStatsAsync(int userId)
        {
            var requests = await _travelRepository.GetRequestsByUserIdRawAsync(userId);

            decimal totalAllocated = 250000;
            decimal budgetSpent = requests
                .Where(r => r.Status == ETMs.Models.Enums.TravelStatus.ApprovedByFinance)
                .Sum(r => r.EstimatedBudget);

            decimal remaining = totalAllocated - budgetSpent;
            double utilization = totalAllocated > 0 ? (double)(budgetSpent / totalAllocated) * 100 : 0;

            return new EmployeeDashboardStatsDTO
            {
                TotalTrips = requests.Count(),
                PendingApprovals = requests.Count(r =>
                    r.Status == ETMs.Models.Enums.TravelStatus.Pending ||
                    r.Status == ETMs.Models.Enums.TravelStatus.ApprovedByManager),

                ApprovedBudgetSpent = budgetSpent,
                TotalAllocatedBudget = totalAllocated,
                RemainingBudget = remaining,
                BudgetUtilizationPercentage = Math.Round(utilization, 1),

                // 🎯 FIX: Explicitly count the real rejected requests from the database enum status
                RejectedRequests = requests.Count(r => r.Status == ETMs.Models.Enums.TravelStatus.Rejected)
            };
        }

        public async Task<bool> DeleteTravelRequestAsync(int id, int userId)
        {
            // 1. 🎯 FIXED: Using your exact repository method name!
            var request = await _travelRepository.GetRequestByIdAsync(id);

            if (request == null)
            {
                throw new KeyNotFoundException("Travel request not found.");
            }

            // 2. Security Check
            if (request.UserId != userId)
            {
                throw new UnauthorizedAccessException("You are not authorized to delete this request.");
            }

            // 3. Status Validation
            if (request.Status != ETMs.Models.Enums.TravelStatus.Pending)
            {
                throw new InvalidOperationException("Cannot delete a request that has already been reviewed.");
            }

            // 4. 🎯 FIXED: Using your newly added repository delete method name!
            await _travelRepository.DeleteRequestAsync(request);
            return true;
        }

        public async Task<TravelRequest?> GetRequestByIdAsync(int id)
        {
            // Calls your verified repository method directly!
            return await _travelRepository.GetRequestByIdAsync(id);
        }

        public async Task<DepartmentBudgetDTO?> GetManagerDepartmentBudgetAsync(int managerId)
        {
            var manager = await _userRepository.GetUserByIdAsync(managerId);
            if (manager == null || string.IsNullOrEmpty(manager.Department))
            {
                return null;
            }

            var dept = manager.Department;

            // Fetch the budget limit
            var budgetLimitObj = await _budgetRepository.GetByDepartmentNameAsync(dept);
            decimal limit = budgetLimitObj?.BudgetLimit ?? 0m;

            // Fetch all requests to compute spent and pending for this department
            var allRequests = await _travelRepository.GetAllRequestsAsync();
            var requestList = allRequests.ToList();

            decimal spent = requestList
                .Where(r => r.User != null 
                         && r.User.Department.Equals(dept, StringComparison.OrdinalIgnoreCase) 
                         && r.Status == ETMs.Models.Enums.TravelStatus.ApprovedByFinance)
                .Sum(r => r.EstimatedBudget);

            decimal pending = requestList
                .Where(r => r.User != null 
                         && r.User.Department.Equals(dept, StringComparison.OrdinalIgnoreCase) 
                         && (r.Status == ETMs.Models.Enums.TravelStatus.Pending || r.Status == ETMs.Models.Enums.TravelStatus.ApprovedByManager))
                .Sum(r => r.EstimatedBudget);

            double utilization = limit > 0 ? Math.Round((double)(spent / limit) * 100, 1) : 0;

            return new DepartmentBudgetDTO
            {
                DepartmentName = dept,
                BudgetLimit = limit,
                BudgetSpent = spent,
                BudgetPending = pending,
                UtilizationPercentage = utilization
            };
        }
    }
}