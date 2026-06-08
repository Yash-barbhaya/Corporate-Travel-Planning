import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  
  // EMPLOYEE MODULE
  {
    path: 'employee',
    canActivate: [authGuard],
    data: { role: 'employee' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./pages/employee/dashboard/dashboard.component').then(m => m.EmployeeDashboardComponent) 
      },
      {
        path: 'my-trips',
        children: [
          { path: '', redirectTo: 'active', pathMatch: 'full' },
          { 
            path: 'active', 
            loadComponent: () => import('./pages/employee/my-trips/active-requests/active-requests.component').then(m => m.ActiveRequestsComponent) 
          },
          { 
            path: 'history', 
            loadComponent: () => import('./pages/employee/my-trips/travel-history/travel-history.component').then(m => m.TravelHistoryComponent) 
          }
        ]
      },
      { 
        path: 'travel-details/:id', 
        loadComponent: () => import('./pages/employee/my-trips/request-details/request-details.component').then(m => m.RequestDetailsComponent) 
      },
      {
        path: 'expenses',
        children: [
          { path: '', redirectTo: 'upload-bills', pathMatch: 'full' },
          { 
            path: 'upload-bills', 
            loadComponent: () => import('./pages/employee/expenses/upload-bills/upload-bills.component').then(m => m.UploadBillsComponent) 
          },
          { 
            path: 'reimbursements', 
            loadComponent: () => import('./pages/employee/expenses/reimbursements/reimbursements.component').then(m => m.ReimbursementsComponent) 
          }
        ]
      },
      { 
        path: 'profile', 
        loadComponent: () => import('./pages/employee/profile/profile.component').then(m => m.ProfileComponent) 
      },
      { path: 'create-request', loadComponent: () => import('./add-request/add-request.component').then(m => m.AddRequestComponent) },
      { path: 'edit-request/:id', loadComponent: () => import('./add-request/add-request.component').then(m => m.AddRequestComponent) }
    ]
  },

  // MANAGER MODULE
  { 
    path: 'manager',
    canActivate: [authGuard],
    data: { role: 'manager' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./manager-dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent)
      },
      {
        path: 'my-trips',
        children: [
          { path: '', redirectTo: 'active', pathMatch: 'full' },
          { 
            path: 'active', 
            loadComponent: () => import('./pages/employee/my-trips/active-requests/active-requests.component').then(m => m.ActiveRequestsComponent) 
          },

          { 
            path: 'history', 
            loadComponent: () => import('./pages/employee/my-trips/travel-history/travel-history.component').then(m => m.TravelHistoryComponent) 
          }
        ]
      },
      {
        path: 'expenses',
        children: [
          { path: '', redirectTo: 'upload-bills', pathMatch: 'full' },
          { 
            path: 'upload-bills', 
            loadComponent: () => import('./pages/employee/expenses/upload-bills/upload-bills.component').then(m => m.UploadBillsComponent) 
          },
          { 
            path: 'reimbursements', 
            loadComponent: () => import('./pages/employee/expenses/reimbursements/reimbursements.component').then(m => m.ReimbursementsComponent) 
          }
        ]
      },
      { 
        path: 'team-requests', 
        loadComponent: () => import('./manager-dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent)
      },
      { 
        path: 'approvals', 
        loadComponent: () => import('./manager-dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent)
      },
      { 
        path: 'reimbursement-approvals', 
        loadComponent: () => import('./shared/components/reimbursement-approvals/reimbursement-approvals.component').then(m => m.ReimbursementApprovalsComponent)
      },
      { 
        path: 'details/:id', 
        loadComponent: () => import('./manager-request-details/manager-request-details.component').then(m => m.ManagerRequestDetailsComponent)
      },
      { 
        path: 'profile', 
        loadComponent: () => import('./pages/employee/profile/profile.component').then(m => m.ProfileComponent)
      },
      { path: 'create-request', loadComponent: () => import('./add-request/add-request.component').then(m => m.AddRequestComponent) },
      { path: 'edit-request/:id', loadComponent: () => import('./add-request/add-request.component').then(m => m.AddRequestComponent) }
    ]
  },
  
  // FINANCE MODULE
  { 
    path: 'finance',
    canActivate: [authGuard],
    data: { role: 'finance'},
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./finance-dashboard/finance-dashboard.component').then(m => m.FinanceDashboardComponent)
      },
      {
        path: 'my-trips',
        children: [
          { path: '', redirectTo: 'active', pathMatch: 'full' },
          { 
            path: 'active', 
            loadComponent: () => import('./pages/employee/my-trips/active-requests/active-requests.component').then(m => m.ActiveRequestsComponent) 
          },

          { 
            path: 'history', 
            loadComponent: () => import('./pages/employee/my-trips/travel-history/travel-history.component').then(m => m.TravelHistoryComponent) 
          }
        ]
      },
      {
        path: 'expenses',
        children: [
          { path: '', redirectTo: 'upload-bills', pathMatch: 'full' },
          { 
            path: 'upload-bills', 
            loadComponent: () => import('./pages/employee/expenses/upload-bills/upload-bills.component').then(m => m.UploadBillsComponent) 
          },
          { 
            path: 'reimbursements', 
            loadComponent: () => import('./pages/employee/expenses/reimbursements/reimbursements.component').then(m => m.ReimbursementsComponent) 
          }
        ]
      },
      { 
        path: 'reimbursement-approvals', 
        loadComponent: () => import('./shared/components/reimbursement-approvals/reimbursement-approvals.component').then(m => m.ReimbursementApprovalsComponent)
      },
      { 
        path: 'details/:id', 
        loadComponent: () => import('./manager-request-details/manager-request-details.component').then(m => m.ManagerRequestDetailsComponent)
      },
      { 
        path: 'profile', 
        loadComponent: () => import('./pages/employee/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },

  // ADMIN MODULE
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { role: 'admin' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'budgets',
        loadComponent: () => import('./pages/admin/budgets/budgets.component').then(m => m.BudgetsComponent)
      },
      {
        path: 'employees',
        loadComponent: () => import('./pages/admin/employees/employees.component').then(m => m.EmployeesComponent)
      },
      {
        path: 'details/:id',
        loadComponent: () => import('./manager-request-details/manager-request-details.component').then(m => m.ManagerRequestDetailsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/employee/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
