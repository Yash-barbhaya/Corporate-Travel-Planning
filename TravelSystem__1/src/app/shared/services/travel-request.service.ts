import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { TravelRequest } from '../models/travel-request.model';
import { environment } from '../../../environments/environment';

// ========================================
// FUTURE API INTEGRATION
// GET: /api/travelrequests
// GET: /api/travelrequests/{id}
// POST: /api/travelrequests
// PUT: /api/travelrequests/{id}
// DELETE: /api/travelrequests/{id}
// ========================================

@Injectable({
  providedIn: 'root'
})
export class TravelRequestService {
  private http = inject(HttpClient);
  
  // Dashboard Search Term State
  private searchTermSubject = new BehaviorSubject<string>('');
  public searchTerm$ = this.searchTermSubject.asObservable();
  
  // Example base URL for future use:
  private apiUrl = `${environment.apiUrl}/dashboard`;


  // TEMP MOCK DATA
  // Remove after backend API integration is completed
  private requests: TravelRequest[] = [
    {
      id: 1,
      userId: 2, // Example employee ID
      title: 'Client Meeting in Mumbai',
      destination: 'Mumbai',
      purpose: 'Annual business review with major clients',
      startDate: '2026-05-25',
      endDate: '2026-05-28',
      estimatedBudget: 45000,
      status: 'Pending',
      managerApproved: false,
      financeApproved: false,
      createdAt: new Date().toISOString().split('T')[0],
      employeeName: 'Rahul Kumar',
      department: 'Sales',
      reportingManager: 'Priya Sharma'
    },
    {
      id: 2,
      userId: 2,
      title: 'Tech Conference 2026',
      destination: 'Bangalore',
      purpose: 'Attend Angular World Conference',
      startDate: '2026-06-10',
      endDate: '2026-06-12',
      estimatedBudget: 25000,
      status: 'Manager Approved',
      managerApproved: true,
      financeApproved: false,
      createdAt: new Date().toISOString().split('T')[0],
      employeeName: 'Rahul Kumar',
      department: 'Engineering',
      reportingManager: 'Priya Sharma'
    },
    {
      id: 3,
      userId: 3,
      title: 'Project Kickoff',
      destination: 'Delhi',
      purpose: 'New government project initiation phase',
      startDate: '2026-05-20',
      endDate: '2026-05-22',
      estimatedBudget: 32000,
      status: 'Approved',
      managerApproved: true,
      financeApproved: true,
      createdAt: new Date().toISOString().split('T')[0],
      employeeName: 'Amit Singh',
      department: 'Consulting',
      reportingManager: 'Priya Sharma'
    }
  ];

  constructor() {}

  /**
   * Retrieves all travel requests.
   * FUTURE: return this.http.get<TravelRequest[]>(this.apiUrl);
   */
  getUserTravelRequests(): TravelRequest[] {
    // Returning mock data synchronously for now so it doesn't break component logic
    return this.requests;
  }

  /**
   * Retrieves a specific travel request by ID.
   * FUTURE: return this.http.get<TravelRequest>(`${this.apiUrl}/${id}`);
   */
  getRequestById(id: number): TravelRequest | undefined {
    return this.requests.find(req => req.id === id);
  }

  /**
   * Updates an existing travel request.
   * FUTURE: return this.http.put<TravelRequest>(`${this.apiUrl}/${request.id}`, request);
   */
  updateTravelRequest(updatedRequest: TravelRequest): void {
    const index = this.requests.findIndex(req => req.id === updatedRequest.id);
    if (index !== -1) {
      this.requests[index] = updatedRequest;
    }
  }

  /**
   * Adds a new travel request.
   * FUTURE: return this.http.post<TravelRequest>(this.apiUrl, newRequest);
   */
  addTravelRequest(newRequest: Partial<TravelRequest>): void {
    const request: TravelRequest = {
      ...newRequest,
      id: this.requests.length > 0 ? Math.max(...this.requests.map(r => r.id)) + 1 : 1,
      userId: newRequest.userId || 1, // Default mock user id
      status: newRequest.status || 'Pending',
      managerApproved: newRequest.managerApproved || false,
      financeApproved: newRequest.financeApproved || false,
      createdAt: newRequest.createdAt || new Date().toISOString().split('T')[0]
    } as TravelRequest;
    
    this.requests.push(request);
  }

  /**
   * Deletes a travel request.
   * FUTURE: return this.http.delete(`${this.apiUrl}/${id}`);
   */
  deleteTravelRequest(id: number): void {
    this.requests = this.requests.filter(req => req.id !== id);
  }

  // Used for global search filtering in dashboards
  setSearchTerm(term: string): void {
    this.searchTermSubject.next(term);
  }

  /**
   * Retrieves dashboard statistics for the logged-in user.
   */
  getDashboardStats() {
    return this.http.get<any>(`${this.apiUrl}/dashboard-stats`);
  }
}
