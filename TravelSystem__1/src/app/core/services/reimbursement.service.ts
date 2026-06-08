import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ReimbursementClaim, ReimbursementApprovalDTO } from '../../shared/models/reimbursement.model';

@Injectable({
  providedIn: 'root'
})
export class ReimbursementService {

  constructor(private http: HttpClient) { }

  getPendingClaims(): Observable<ReimbursementClaim[]> {
    return this.http.get<ReimbursementClaim[]>(API_ENDPOINTS.REIMBURSEMENT.PENDING);
  }

  processClaim(dto: ReimbursementApprovalDTO): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.REIMBURSEMENT.APPROVE, dto);
  }
}
