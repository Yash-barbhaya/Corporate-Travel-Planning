import { environment } from '../../../environments/environment';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${environment.apiUrl}/Auth/login`,
    REGISTER: `${environment.apiUrl}/Auth/register`,
    PROFILE: `${environment.apiUrl}/Auth/profile`,
  },
  TRAVEL_REQUESTS: {
    GET_ALL: `${environment.apiUrl}/Travel/my-trips`,
    GET_BY_ID: (id: number) => `${environment.apiUrl}/Travel/${id}`,
    CREATE: `${environment.apiUrl}/Travel`,
    UPDATE: (id: number) => `${environment.apiUrl}/Travel/${id}`,
    DELETE: (id: number) => `${environment.apiUrl}/Travel/${id}`,
    DASHBOARD_STATS: `${environment.apiUrl}/Travel/dashboard-stats`,
    APPROVED_TRIPS: `${environment.apiUrl}/Travel/my-trips?status=Approved`
  },
  MANAGER: {
    TEAM_REQUESTS: `${environment.apiUrl}/Manager/team-requests`,
    APPROVE_REQUEST: (id: number) => `${environment.apiUrl}/Manager/approve/${id}`,
    REJECT_REQUEST: (id: number) => `${environment.apiUrl}/Manager/reject/${id}`,
    RECENT_ACTIVITY: `${environment.apiUrl}/Manager/recent-activity`,
    UPCOMING_TEAM_TRIPS: `${environment.apiUrl}/Manager/upcoming-trips`,
    BUDGET: `${environment.apiUrl}/Manager/budget`
  },
  FINANCE: {
    PENDING_APPROVALS: `${environment.apiUrl}/Finance/pending-approvals`,
    FINAL_APPROVE: (id: number) => `${environment.apiUrl}/Finance/approve/${id}`,
    REJECT_REQUEST: (id: number) => `${environment.apiUrl}/Finance/reject/${id}`,
  },
  EXPENSES: {
    UPLOAD: `${environment.apiUrl}/Expense/upload-receipt`,
    MY_REIMBURSEMENTS: `${environment.apiUrl}/Expense/my-reimbursements`
  },
  REIMBURSEMENT: {
    PENDING: `${environment.apiUrl}/Reimbursement/pending`,
    APPROVE: `${environment.apiUrl}/Reimbursement/approve`
  },
  ADMIN: {
    REQUESTS: `${environment.apiUrl}/Admin/requests`,
    APPROVE_REQUEST: (id: number) => `${environment.apiUrl}/Admin/requests/${id}/approve`,
    REJECT_REQUEST: (id: number) => `${environment.apiUrl}/Admin/requests/${id}/reject`,
    BUDGETS: `${environment.apiUrl}/Admin/budgets`,
    EMPLOYEES: `${environment.apiUrl}/Admin/employees`,
    MANAGERS: `${environment.apiUrl}/Admin/managers`,
    TOGGLE_STATUS: (id: number) => `${environment.apiUrl}/Admin/employees/${id}/toggle-status`
  }
};
