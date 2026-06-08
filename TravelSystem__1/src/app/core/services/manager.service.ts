import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { TravelRequest } from '../../shared/models/travel-request.model';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {

  constructor(private http: HttpClient) { }

  // ========================================
  // MANAGER APIs
  // ========================================

  getTeamRequests(): Observable<TravelRequest[]> {
    return this.http.get<TravelRequest[]>(API_ENDPOINTS.MANAGER.TEAM_REQUESTS);
  }

  approveRequest(id: number, comments: string = ''): Observable<any> {
    return this.http.put<any>(API_ENDPOINTS.MANAGER.APPROVE_REQUEST(id), { comments });
  }

  rejectRequest(id: number, reason: string): Observable<any> {
    return this.http.put<any>(API_ENDPOINTS.MANAGER.REJECT_REQUEST(id), { reason });
  }
}
