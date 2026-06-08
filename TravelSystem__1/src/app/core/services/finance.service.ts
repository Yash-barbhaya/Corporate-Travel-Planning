import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { TravelRequest } from '../../shared/models/travel-request.model';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {

  constructor(private http: HttpClient) { }

  // ========================================
  // FINANCE APIs
  // ========================================

  getPendingApprovals(): Observable<TravelRequest[]> {
    return this.http.get<TravelRequest[]>(API_ENDPOINTS.FINANCE.PENDING_APPROVALS);
  }

  finalApproveRequest(id: number): Observable<any> {
    return this.http.put<any>(API_ENDPOINTS.FINANCE.FINAL_APPROVE(id), {});
  }

  processReimbursement(id: number): Observable<any> {
    return this.http.put<any>(API_ENDPOINTS.FINANCE.PROCESS_REIMBURSEMENT(id), {});
  }
}
