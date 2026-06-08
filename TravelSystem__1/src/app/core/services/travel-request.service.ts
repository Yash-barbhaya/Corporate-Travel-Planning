import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { TravelRequest } from '../../shared/models/travel-request.model';

@Injectable({
  providedIn: 'root'
})
export class TravelRequestService {

  constructor(private http: HttpClient) { }

  // ========================================
  // TRAVEL REQUEST APIs
  // ========================================

  getAllRequests(): Observable<TravelRequest[]> {
    return this.http.get<TravelRequest[]>(API_ENDPOINTS.TRAVEL_REQUESTS.GET_ALL);
  }

  getRequestById(id: number): Observable<TravelRequest> {
    return this.http.get<TravelRequest>(API_ENDPOINTS.TRAVEL_REQUESTS.GET_BY_ID(id));
  }

  createRequest(request: Partial<TravelRequest>): Observable<TravelRequest> {
    return this.http.post<TravelRequest>(API_ENDPOINTS.TRAVEL_REQUESTS.CREATE, request);
  }

  updateRequest(id: number, request: TravelRequest): Observable<TravelRequest> {
    return this.http.put<TravelRequest>(API_ENDPOINTS.TRAVEL_REQUESTS.UPDATE(id), request);
  }

  deleteRequest(id: number): Observable<any> {
    return this.http.delete<any>(API_ENDPOINTS.TRAVEL_REQUESTS.DELETE(id));
  }
}
