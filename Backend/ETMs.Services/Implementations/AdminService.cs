using ETMs.Data.Entities;
using ETMs.Data.Interfaces;
using ETMs.Models.DTOs;
using ETMs.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETMs.Services.Implementations
{
    public class AdminService : IAdminService
    {
        private readonly IUserRepository _userRepository;
        private readonly ITravelRepository _travelRepository;
        private readonly IDepartmentBudgetRepository _budgetRepository;

        public AdminService(
            IUserRepository userRepository,
            ITravelRepository travelRepository,
            IDepartmentBudgetRepository budgetRepository)
        {
            _userRepository = userRepository;
            _travelRepository = travelRepository;
            _budgetRepository = budgetRepository;
        }

        public async Task<IEnumerable<EmployeeDTO>> GetEmployeesAsync()
        {
            var users = await _userRepository.GetAllUsersAsync();
            return users.Select(u => new EmployeeDTO
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                Department = u.Department,
                ManagerId = u.Manager_Id,
                ManagerName = u.Manager?.Name,
                IsActive = u.IsActive,
                CreatedAt = u.Created_At
            });
        }

        public async Task<bool> AddEmployeeAsync(CreateEmployeeDTO dto)
        {
            var existing = await _userRepository.GetUserByEmailAsync(dto.Email);
            if (existing != null)
            {
                throw new ArgumentException("An employee with this email address already exists.");
            }

            var newUser = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Password = dto.Password, // Mock database uses plaintext validation
                Role = dto.Role,
                Department = dto.Department,
                Manager_Id = dto.ManagerId,
                IsActive = true,
                Created_At = DateTime.UtcNow
            };

            await _userRepository.AddUserAsync(newUser);
            return true;
        }

        public async Task<bool> UpdateEmployeeAsync(int id, UpdateEmployeeDTO dto)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null) return false;

            // Check if email changed and is taken
            if (user.Email.ToLower() != dto.Email.ToLower())
            {
                var existing = await _userRepository.GetUserByEmailAsync(dto.Email);
                if (existing != null)
                {
                    throw new ArgumentException("An employee with this email address already exists.");
                }
            }

            user.Name = dto.Name;
            user.Email = dto.Email;
            user.Role = dto.Role;
            user.Department = dto.Department;
            user.Manager_Id = dto.ManagerId;
            user.IsActive = dto.IsActive;

            await _userRepository.UpdateUserAsync(user);
            return true;
        }

        public async Task<bool> ToggleEmployeeStatusAsync(int id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null) return false;

            user.IsActive = !user.IsActive;
            await _userRepository.UpdateUserAsync(user);
            return true;
        }

        public async Task<IEnumerable<EmployeeDTO>> GetManagersAsync()
        {
            var managers = await _userRepository.GetManagersAsync();
            return managers.Select(u => new EmployeeDTO
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                Department = u.Department,
                IsActive = u.IsActive
            });
        }

        public async Task<IEnumerable<DepartmentBudgetDTO>> GetDepartmentBudgetsAsync()
        {
            var users = await _userRepository.GetAllUsersAsync();
            var userDepartments = users.Select(u => u.Department).Distinct().Where(d => !string.IsNullOrEmpty(d)).ToList();

            var budgets = await _budgetRepository.GetBudgetsAsync();
            var budgetList = budgets.ToList();
            var budgetDepartments = budgetList.Select(b => b.DepartmentName).ToList();

            var allDepts = userDepartments.Union(budgetDepartments, StringComparer.OrdinalIgnoreCase).ToList();

            var allRequests = await _travelRepository.GetAllRequestsAsync();
            var requestList = allRequests.ToList();

            var responseList = new List<DepartmentBudgetDTO>();

            foreach (var dept in allDepts)
            {
                var budgetLimitObj = budgetList.FirstOrDefault(b => b.DepartmentName.Equals(dept, StringComparison.OrdinalIgnoreCase));
                decimal limit = budgetLimitObj?.BudgetLimit ?? 0m;

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

                responseList.Add(new DepartmentBudgetDTO
                {
                    DepartmentName = dept,
                    BudgetLimit = limit,
                    BudgetSpent = spent,
                    BudgetPending = pending,
                    UtilizationPercentage = utilization
                });
            }

            return responseList.OrderBy(b => b.DepartmentName);
        }

        public async Task<bool> SetDepartmentBudgetAsync(SetBudgetDTO dto)
        {
            var budget = new DepartmentBudget
            {
                DepartmentName = dto.DepartmentName,
                BudgetLimit = dto.BudgetLimit
            };

            await _budgetRepository.AddOrUpdateBudgetAsync(budget);
            return true;
        }

        public async Task<IEnumerable<TravelRequestResponseDTO>> GetAllTravelRequestsAsync()
        {
            var requests = await _travelRepository.GetAllRequestsAsync();
            
            var budgets = (await _budgetRepository.GetBudgetsAsync())
                .ToDictionary(b => b.DepartmentName.ToLower(), b => b.BudgetLimit);

            var departmentActiveSpending = requests
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

        public async Task<bool> ProcessAdminApprovalAsync(int requestId, bool isApproved, string? reason, int adminUserId)
        {
            var travelRequest = await _travelRepository.GetRequestByIdAsync(requestId);
            if (travelRequest == null) return false;

            travelRequest.AdminApprovedById = adminUserId;

            if (isApproved)
            {
                travelRequest.Status = ETMs.Models.Enums.TravelStatus.ApprovedByFinance; // Direct final approval
            }
            else
            {
                travelRequest.Status = ETMs.Models.Enums.TravelStatus.Rejected;
                travelRequest.RejectionReason = reason ?? "Rejected by Admin.";
            }

            await _travelRepository.UpdateRequestAsync(travelRequest);
            return true;
        }
    }
}
