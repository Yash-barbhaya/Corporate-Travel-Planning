using ETMs.Data.Entities;
using ETMs.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETMs.Services.Interfaces
{
    public interface ITravelService
    {
        Task<TravelRequestResponseDTO> CreateRequestAsync(TravelRequestCreateDTO dto, int userId);
        Task<IEnumerable<TravelRequestResponseDTO>> GetEmployeeTripsAsync(int userId);
        Task<EmployeeDashboardStatsDTO> GetDashboardStatsAsync(int userId);
        Task<IEnumerable<TravelRequestResponseDTO>> GetManagerPendingRequestsAsync(int managerId);
        Task<bool> ProcessManagerApprovalAsync(ManagerApprovalDTO dto, int managerId);
        Task<IEnumerable<TravelRequestResponseDTO>> GetFinancePendingRequestsAsync();
        Task<bool> ProcessFinanceSettlementAsync(FinanceProcessDTO dto, int financeUserId);
        Task<EmployeeDashboardStatsDTO> GetEmployeeDashboardStatsAsync(int userId);
        Task<bool> DeleteTravelRequestAsync(int id, int userId);
        Task<TravelRequest?> GetRequestByIdAsync(int id);
        Task<DepartmentBudgetDTO?> GetManagerDepartmentBudgetAsync(int managerId);
    }
}
