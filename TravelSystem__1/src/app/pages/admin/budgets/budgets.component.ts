import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, DepartmentBudget } from '../../../services/admin.service';
import { SidebarComponent } from '../../../sidebar/sidebar.component';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './budgets.component.html',
  styleUrl: './budgets.component.scss'
})
export class BudgetsComponent implements OnInit {
  private adminService = inject(AdminService);

  budgets: DepartmentBudget[] = [];
  isSidebarCollapsed = true;

  // Set budget form state
  selectedDept = '';
  budgetLimit: number | null = null;
  
  // Custom department name for typed option
  customDeptName = '';
  showCustomDept = false;

  // Pre-configured departments for easy selection
  departments = [
    'Sales',
    'Marketing',
    'Human Resources',
    'Engineering',
    'Finance',
    'Operations',
    'Full Stack',
    'Quality Assurance'
  ];

  // Overall Statistics
  totalAllocated = 0;
  totalSpent = 0;
  totalPending = 0;
  overallUtilization = 0;

  ngOnInit(): void {
    this.loadBudgets();
  }

  loadBudgets(): void {
    this.adminService.getBudgets().subscribe({
      next: (data) => {
        this.budgets = data;
        this.calculateOverallStats();
      },
      error: (err) => console.error('Error fetching department budgets', err)
    });
  }

  toggleSidebar(pinned: boolean): void {
    this.isSidebarCollapsed = !pinned;
  }

  calculateOverallStats(): void {
    this.totalAllocated = this.budgets.reduce((sum, b) => sum + b.budgetLimit, 0);
    this.totalSpent = this.budgets.reduce((sum, b) => sum + b.budgetSpent, 0);
    this.totalPending = this.budgets.reduce((sum, b) => sum + b.budgetPending, 0);
    
    this.overallUtilization = this.totalAllocated > 0 
      ? Math.round((this.totalSpent / this.totalAllocated) * 100) 
      : 0;
  }

  onDeptChange(): void {
    this.showCustomDept = this.selectedDept === 'Other';
  }

  submitBudget(): void {
    const deptName = this.selectedDept === 'Other' ? this.customDeptName.trim() : this.selectedDept;
    if (!deptName || this.budgetLimit === null || this.budgetLimit < 0) {
      alert('Please fill in a valid department name and budget limit.');
      return;
    }

    this.adminService.setBudget(deptName, this.budgetLimit).subscribe({
      next: () => {
        alert(`Budget set successfully for ${deptName}!`);
        this.selectedDept = '';
        this.customDeptName = '';
        this.budgetLimit = null;
        this.showCustomDept = false;
        this.loadBudgets();
      },
      error: (err) => console.error('Error setting department budget', err)
    });
  }

  editDeptBudget(dept: DepartmentBudget): void {
    this.selectedDept = this.departments.includes(dept.departmentName) ? dept.departmentName : 'Other';
    if (this.selectedDept === 'Other') {
      this.customDeptName = dept.departmentName;
      this.showCustomDept = true;
    } else {
      this.showCustomDept = false;
    }
    this.budgetLimit = dept.budgetLimit;
  }

  getProgressColor(percentage: number): string {
    if (percentage > 100) return 'progress-danger';
    if (percentage > 80) return 'progress-warning';
    return 'progress-success';
  }
}
