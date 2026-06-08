import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../core/constants/api-endpoints'; // 🎯 Import our endpoints catalog
import { environment } from '../../environments/environment';
import { TravelRequest } from '../shared/models/travel-request.model';

@Injectable({
  providedIn: 'root'
})
export class TravelRequestService {
  private http = inject(HttpClient); // Modern Angular dependency injection approach

  // ========================================
  // EMPLOYEE TRAVEL REQUEST APIs
  // ========================================

  // GET: /api/Travel/my-trips
  getUserRequests(userId: number, statusFilters?: string[]): Observable<TravelRequest[]> {
    let params = new HttpParams();
    if (statusFilters && statusFilters.length > 0) {
      statusFilters.forEach(status => {
        params = params.append('status', status);
      });
    }
    // Linked to centralized GET_ALL endpoint
    return this.http.get<TravelRequest[]>(API_ENDPOINTS.TRAVEL_REQUESTS.GET_ALL, { params });
  }

  // GET: /api/Travel/recent
  getRecentRequests(userId: number, limit: number = 5): Observable<TravelRequest[]> {
    let params = new HttpParams().set('limit', limit.toString());
    return this.http.get<TravelRequest[]>(`${API_ENDPOINTS.TRAVEL_REQUESTS.CREATE}/user/${userId}/recent`, { params });
  }

  // GET: /api/Travel/{id}
  getRequestById(id: number): Observable<TravelRequest> {
    return this.http.get<TravelRequest>(API_ENDPOINTS.TRAVEL_REQUESTS.GET_BY_ID(id));
  }

  // POST: /api/Travel
  createRequest(request: Omit<TravelRequest, 'id' | 'createdAt'>): Observable<TravelRequest> {
    // 🎯 FIXED: Points straight to your working POST route now!
    return this.http.post<TravelRequest>(API_ENDPOINTS.TRAVEL_REQUESTS.CREATE, request);
  }

  // PUT: /api/Travel/{id}
  updateRequest(id: number, request: TravelRequest): Observable<TravelRequest> {
    return this.http.put<TravelRequest>(API_ENDPOINTS.TRAVEL_REQUESTS.UPDATE(id), request);
  }

  // DELETE: /api/Travel/{id}
  deleteRequest(id: number): Observable<any> {
    return this.http.delete(API_ENDPOINTS.TRAVEL_REQUESTS.DELETE(id), { responseType: 'text' });
  }

  // GET: /api/Travel/dashboard-stats
  getEmployeeDashboardStats(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/Travel/dashboard-stats`);
  }
}