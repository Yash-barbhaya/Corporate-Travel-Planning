// ========================================
// REMOVE OLD MOCK LOGIC
// REMOVE HARDCODED USER DATA
// REMOVE STATIC ARRAY
// REPLACE WITH API RESPONSE
//
// FUTURE SCALING SECTION:
// Once the ASP.NET Core backend is ready, delete this entire file
// and replace its usage in components with:
// 1. EmployeeService
// 2. ManagerService
// 3. FinanceService
// 4. TravelRequestService
// ========================================
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { TravelRequest, TravelStatus } from '../models/travel-request.model';
import { User } from '../models/user.model';
import { Expense, Reimbursement } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private requestsSubject = new BehaviorSubject<TravelRequest[]>([]);
  public requests$ = this.requestsSubject.asObservable();

  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor() {
    this.initMockData();
  }

  // ========================================
  // REMOVE STATIC ARRAY & HARDCODED USER
  // These should be fetched via API
  // ========================================
  private initMockData() {
    const mockUser: User = {
      id: 1,
      name: 'Rahul Sharma',
      email: 'rahul.sharma@travelport.com',
      role: 'employee',
      department: 'Software Engineering',
      avatar: 'RS'
    };

    const mockRequests: TravelRequest[] = [
      {
        id: 101,
        userId: 1,
        title: 'Client Visit - London',
        destination: 'London, UK',
        purpose: 'Technical Consultation & Project Handover',
        startDate: '2026-05-15',
        endDate: '2026-05-20',
        estimatedBudget: 145000,
        status: 'Approved',
        managerApproved: true,
        financeApproved: true,
        managerId: 3,
        createdAt: '2026-04-20',
        expenseBreakdown: { travel: 80000, hotel: 40000, meals: 20000, other: 5000 }
      },
      {
        id: 102,
        userId: 1,
        title: 'Annual Tech Summit',
        destination: 'Bangalore, India',
        purpose: 'Keynote Speaker & Networking',
        startDate: '2026-06-10',
        endDate: '2026-06-12',
        estimatedBudget: 25000,
        status: 'Pending',
        managerApproved: false,
        financeApproved: false,
        managerId: 3,
        createdAt: '2026-05-01'
      },
    ];

    this.userSubject.next(mockUser);
    this.requestsSubject.next(mockRequests);
  }


  getRequestsByStatus(status: TravelStatus[]): Observable<TravelRequest[]> {
    return this.requests$.pipe(
      map(requests => requests.filter(r => status.includes(r.status)))
    );
  }

  getRecentRequests(limit: number = 5): Observable<TravelRequest[]> {
    return this.requests$.pipe(
      map(requests => requests.slice(0, limit))
    );
  }

  getStats() {
    return this.requests$.pipe(
      map(requests => ({
        total: requests.length,
        approvedAmount: requests.filter(r => r.status === 'Approved').reduce((acc, r) => acc + r.estimatedBudget, 0),
        pending: requests.filter(r => r.status === 'Pending' || r.status === 'Manager Approved' || r.status === 'Finance Pending').length,
        rejected: requests.filter(r => r.status === 'Rejected').length
      }))
    );
  }

  addRequest(request: Omit<TravelRequest, 'id' | 'createdAt'>) {
    const current = this.requestsSubject.value;
    const newReq: TravelRequest = {
      ...request,
      id: Math.max(...current.map(r => r.id), 0) + 1,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.requestsSubject.next([newReq, ...current]);
  }

  updateRequest(updated: TravelRequest) {
    const current = this.requestsSubject.value;
    const index = current.findIndex(r => r.id === updated.id);
    if (index !== -1) {
      current[index] = updated;
      this.requestsSubject.next([...current]);
    }
  }

  deleteRequest(id: number) {
    const current = this.requestsSubject.value;
    this.requestsSubject.next(current.filter(r => r.id !== id));
  }
}
