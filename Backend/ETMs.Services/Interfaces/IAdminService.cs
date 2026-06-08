using ETMs.Models.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ETMs.Services.Interfaces
{
    public interface IAdminService
    {
        Task<IEnumerable<EmployeeDTO>> GetEmployeesAsync();
        Task<bool> AddEmployeeAsync(CreateEmployeeDTO dto);
        Task<bool> UpdateEmployeeAsync(int id, UpdateEmployeeDTO dto);
        Task<bool> ToggleEmployeeStatusAsync(int id);
        Task<IEnumerable<EmployeeDTO>> GetManagersAsync();
        Task<IEnumerable<DepartmentBudgetDTO>> GetDepartmentBudgetsAsync();
        Task<bool> SetDepartmentBudgetAsync(SetBudgetDTO dto);
        Task<IEnumerable<TravelRequestResponseDTO>> GetAllTravelRequestsAsync();
        Task<bool> ProcessAdminApprovalAsync(int requestId, bool isApproved, string? reason, int adminUserId);
    }
}
