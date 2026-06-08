import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { TravelRequest } from '../../shared/models/travel-request.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  constructor(private http: HttpClient) { }

  // ========================================
  // EMPLOYEE DASHBOARD APIs
  // ========================================

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.EMPLOYEE.DASHBOARD_STATS);
  }

  getActiveTrips(): Observable<TravelRequest[]> {
    return this.http.get<TravelRequest[]>(API_ENDPOINTS.EMPLOYEE.ACTIVE_TRIPS);
  }

  getTravelHistory(): Observable<TravelRequest[]> {
    return this.http.get<TravelRequest[]>(API_ENDPOINTS.EMPLOYEE.HISTORY);
  }
}
