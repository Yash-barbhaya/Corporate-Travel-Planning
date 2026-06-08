import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TravelRequest } from '../shared/models/travel-request.model';
import { User } from '../shared/models/user.model';
import { API_ENDPOINTS } from '../core/constants/api-endpoints';

export interface DepartmentBudget {
  departmentName: string;
  budgetLimit: number;
  budgetSpent: number;
  budgetPending: number;
  utilizationPercentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);

  getAllRequests(): Observable<TravelRequest[]> {
    return this.http.get<TravelRequest[]>(API_ENDPOINTS.ADMIN.REQUESTS);
  }

  approveRequest(id: number): Observable<any> {
    return this.http.put(API_ENDPOINTS.ADMIN.APPROVE_REQUEST(id), {});
  }

  rejectRequest(id: number, reason: string): Observable<any> {
    return this.http.put(API_ENDPOINTS.ADMIN.REJECT_REQUEST(id), { rejectionReason: reason });
  }

  getBudgets(): Observable<DepartmentBudget[]> {
    return this.http.get<DepartmentBudget[]>(API_ENDPOINTS.ADMIN.BUDGETS);
  }

  setBudget(departmentName: string, budgetLimit: number): Observable<any> {
    return this.http.post(API_ENDPOINTS.ADMIN.BUDGETS, { departmentName, budgetLimit });
  }

  getEmployees(): Observable<User[]> {
    return this.http.get<User[]>(API_ENDPOINTS.ADMIN.EMPLOYEES);
  }

  getManagers(): Observable<User[]> {
    return this.http.get<User[]>(API_ENDPOINTS.ADMIN.MANAGERS);
  }

  addEmployee(employee: any): Observable<any> {
    return this.http.post(API_ENDPOINTS.ADMIN.EMPLOYEES, employee);
  }

  updateEmployee(id: number, employee: any): Observable<any> {
    return this.http.put(`${API_ENDPOINTS.ADMIN.EMPLOYEES}/${id}`, employee);
  }

  toggleEmployeeStatus(id: number): Observable<any> {
    return this.http.put(API_ENDPOINTS.ADMIN.TOGGLE_STATUS(id), {});
  }
}
