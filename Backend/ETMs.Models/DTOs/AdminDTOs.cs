using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ETMs.Models.DTOs
{
    public class EmployeeDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public int? ManagerId { get; set; }
        public string? ManagerName { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateEmployeeDTO
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = string.Empty;

        [Required]
        public string Department { get; set; } = string.Empty;

        public int? ManagerId { get; set; }
    }

    public class UpdateEmployeeDTO
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = string.Empty;

        [Required]
        public string Department { get; set; } = string.Empty;

        public int? ManagerId { get; set; }
        public bool IsActive { get; set; }
    }

    public class DepartmentBudgetDTO
    {
        public string DepartmentName { get; set; } = string.Empty;
        public decimal BudgetLimit { get; set; }
        public decimal BudgetSpent { get; set; }
        public decimal BudgetPending { get; set; }
        public double UtilizationPercentage { get; set; }
    }

    public class SetBudgetDTO
    {
        [Required]
        public string DepartmentName { get; set; } = string.Empty;

        [Required]
        [Range(0, double.MaxValue)]
        public decimal BudgetLimit { get; set; }
    }
}
