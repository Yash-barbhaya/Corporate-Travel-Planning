import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { User } from '../../../shared/models/user.model';
import { SidebarComponent } from '../../../sidebar/sidebar.component';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent implements OnInit {
  private adminService = inject(AdminService);

  employees: User[] = [];
  managers: User[] = [];
  isSidebarCollapsed = true;

  // Filter state
  searchTerm = '';
  filteredEmployees: User[] = [];

  // Modal form state
  showModal = false;
  isEditMode = false;
  selectedEmployeeId: number | null = null;

  // Form values
  empName = '';
  empEmail = '';
  empPassword = '';
  empRole = 'employee';
  empDept = '';
  empManagerId: number | null = null;
  empIsActive = true;

  roles = [
    { value: 'employee', label: 'Employee' },
    { value: 'manager', label: 'Manager' },
    { value: 'finance', label: 'Finance Auditor' },
    { value: 'admin', label: 'System Admin' }
  ];

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

  ngOnInit(): void {
    this.loadEmployees();
    this.loadManagers();
  }

  loadEmployees(): void {
    this.adminService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.applyFilter();
      },
      error: (err) => console.error('Error fetching employees', err)
    });
  }

  loadManagers(): void {
    this.adminService.getManagers().subscribe({
      next: (data) => {
        this.managers = data;
      },
      error: (err) => console.error('Error fetching managers list', err)
    });
  }

  toggleSidebar(pinned: boolean): void {
    this.isSidebarCollapsed = !pinned;
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredEmployees = [...this.employees];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredEmployees = this.employees.filter(e => 
        (e.name && e.name.toLowerCase().includes(term)) ||
        (e.email && e.email.toLowerCase().includes(term)) ||
        (e.department && e.department.toLowerCase().includes(term)) ||
        (e.role && e.role.toLowerCase().includes(term))
      );
    }
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedEmployeeId = null;
    this.empName = '';
    this.empEmail = '';
    this.empPassword = '';
    this.empRole = 'employee';
    this.empDept = '';
    this.empManagerId = null;
    this.empIsActive = true;
    this.showModal = true;
  }

  openEditModal(employee: User): void {
    this.isEditMode = true;
    this.selectedEmployeeId = employee.id;
    this.empName = employee.name;
    this.empEmail = employee.email;
    this.empPassword = ''; // Password is not editable in simple update employee DTO
    this.empRole = employee.role;
    this.empDept = employee.department || '';
    this.empManagerId = employee.managerId || null;
    this.empIsActive = employee.isActive !== undefined ? employee.isActive : true;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveEmployee(): void {
    if (!this.empName.trim() || !this.empEmail.trim() || !this.empRole || !this.empDept) {
      alert('Please fill in all required fields.');
      return;
    }

    if (this.isEditMode && this.selectedEmployeeId !== null) {
      // Edit mode
      const payload = {
        name: this.empName,
        email: this.empEmail,
        role: this.empRole,
        department: this.empDept,
        managerId: this.empManagerId,
        isActive: this.empIsActive
      };

      this.adminService.updateEmployee(this.selectedEmployeeId, payload).subscribe({
        next: () => {
          alert('Employee updated successfully!');
          this.closeModal();
          this.loadEmployees();
          this.loadManagers(); // Reload in case roles changed
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message || 'Error updating employee.');
        }
      });
    } else {
      // Add mode
      if (!this.empPassword || this.empPassword.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
      }

      const payload = {
        name: this.empName,
        email: this.empEmail,
        password: this.empPassword,
        role: this.empRole,
        department: this.empDept,
        managerId: this.empManagerId
      };

      this.adminService.addEmployee(payload).subscribe({
        next: () => {
          alert('Employee registered successfully!');
          this.closeModal();
          this.loadEmployees();
          this.loadManagers();
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message || 'Error registering employee.');
        }
      });
    }
  }

  toggleEmployeeStatus(employee: User): void {
    const actionStr = employee.isActive ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${actionStr} employee: ${employee.name}?`)) {
      this.adminService.toggleEmployeeStatus(employee.id).subscribe({
        next: () => {
          this.loadEmployees();
          this.loadManagers();
        },
        error: (err) => console.error('Error toggling employee status', err)
      });
    }
  }
}
