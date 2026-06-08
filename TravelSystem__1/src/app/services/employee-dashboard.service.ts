import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EmployeeDashboardStats } from '../shared/models/employee-dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeDashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  // ========================================
  // EMPLOYEE DASHBOARD APIs
  // GET: /api/dashboard/employee-stats
  // ========================================
  getDashboardStats(): Observable<EmployeeDashboardStats> {
    return this.http.get<EmployeeDashboardStats>(`${this.apiUrl}/employee-stats`);
  }

  // NOTE: If there is an expense overview API later, it can be added here
  // GET: /api/dashboard/expense-overview
}
