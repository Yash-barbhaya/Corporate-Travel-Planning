import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { User } from '../shared/models/user.model';
import { TravelRequest } from '../shared/models/travel-request.model';
import { TravelRequestService } from '../shared/services/travel-request.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { StatCardComponent } from '../shared/components/stat-card/stat-card.component';
import { BudgetGaugeComponent } from '../shared/components/budget-gauge/budget-gauge.component';
import { RecentActivityComponent, Activity } from '../shared/components/recent-activity/recent-activity.component';
import { UpcomingTripsComponent, Trip } from '../shared/components/upcoming-trips/upcoming-trips.component';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../core/constants/api-endpoints';
import { DepartmentBudget } from '../services/admin.service';
@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    FormsModule, 
    SidebarComponent, 
    StatCardComponent,
    BudgetGaugeComponent,
    RecentActivityComponent,
    UpcomingTripsComponent
  ],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.scss'
})
export class ManagerDashboardComponent implements OnInit {
  currentUser: User | null = null;
  assignedRequests: TravelRequest[] = [];
  allAssignedRequests: TravelRequest[] = [];
  isSidebarCollapsed: boolean = true;
  private http = inject(HttpClient);
  
  // Dashboard Signals
  totalBudget = signal(500000);
  remainingBudget = signal(320000);
  
  // Stats
  pendingCount = signal(0);
  approvedTodayCount = signal(0);
  rejectedCount = signal(0);
  monthlyExpenses = signal(185000);

  // New Sections Data
  recentActivities: Activity[] = [];
  upcomingTrips: Trip[] = [];

  // Rejection Modal State
  showRejectModal: boolean = false;
  currentRequestToReject: TravelRequest | null = null;
  selectedReason: string = '';
  otherReason: string = '';
  rejectionReasons: string[] = [
    'Budget constraints',
    'Insufficient justification',
    'Not aligned with business priorities',
    'Alternative available (virtual meeting)',
    'Incomplete details',
    'Other'
  ];

  constructor(
    private authService: AuthService,
    private travelRequestService: TravelRequestService,
    private router: Router
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.loadRequests();
      }
    });
  }

  pageTitle: string = 'Assigned Requests';
  pageSubtitle: string = 'Here are the travel requests awaiting your oversight.';
  isDashboard: boolean = false;

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadRequests();
    this.loadBudget();

    // Subscribe to search term
    this.travelRequestService.searchTerm$.subscribe(term => {
      this.applyFilter(term);
    });
  }

  loadBudget(): void {
    this.http.get<DepartmentBudget>(API_ENDPOINTS.MANAGER.BUDGET).subscribe({
      next: (budget) => {
        if (budget) {
          this.totalBudget.set(budget.budgetLimit);
          this.remainingBudget.set(budget.budgetLimit - budget.budgetSpent - budget.budgetPending);
        }
      },
      error: (err) => console.error('Error fetching manager budget', err)
    });
  }

  loadRequests(): void {
    this.http.get<TravelRequest[]>(API_ENDPOINTS.MANAGER.TEAM_REQUESTS).subscribe({
      next: (allRequests) => {
        this.isDashboard = this.router.url.includes('/dashboard');
        const isTeamRequests = this.router.url.includes('/team-requests');
        const isApprovals = this.router.url.includes('/approvals');
        
        if (this.isDashboard) {
          this.pageTitle = 'Manager Overview';
          this.pageSubtitle = 'Welcome back! Here is a summary of your team activity.';
          // Action Required should only show requests awaiting manager decision
          this.allAssignedRequests = allRequests.filter(req => 
            !req.managerApproved && req.status === 'Pending'
          );
          
          // Update Signal counts for the overview
          this.pendingCount.set(this.allAssignedRequests.length);
          const today = new Date().toISOString().split('T')[0];
          this.approvedTodayCount.set(allRequests.filter(r => r.managerApproved && r.createdAt === today).length);
          this.rejectedCount.set(allRequests.filter(r => r.status === 'Rejected').length);
        } else if (isTeamRequests) {
          this.pageTitle = 'Team Requests';
          this.pageSubtitle = 'Complete overview of all travel requests in your team.';
          this.allAssignedRequests = allRequests;
        } else if (isApprovals) {
          this.pageTitle = 'Recent Approvals';
          this.pageSubtitle = 'History of requests you have approved or rejected.';
          // Approvals should show everything that is NOT pending manager action
          this.allAssignedRequests = allRequests.filter(req => 
            req.managerApproved || req.status === 'Rejected'
          );
        } else {
          this.pageTitle = 'Manager Console';
          this.pageSubtitle = 'Overview of your management activities.';
          this.allAssignedRequests = allRequests;
        }
        this.applyFilter('');
      },
      error: (err) => console.error('Error fetching manager requests', err)
    });

    // Fetch Widget Data
    this.http.get<Activity[]>(API_ENDPOINTS.MANAGER.RECENT_ACTIVITY).subscribe({
      next: (activities) => this.recentActivities = activities,
      error: (err) => console.error('Error fetching recent activity', err)
    });

    this.http.get<Trip[]>(API_ENDPOINTS.MANAGER.UPCOMING_TEAM_TRIPS).subscribe({
      next: (trips) => this.upcomingTrips = trips,
      error: (err) => console.error('Error fetching upcoming trips', err)
    });
  }

  applyFilter(term: string): void {
    if (!term) {
      this.assignedRequests = [...this.allAssignedRequests];
    } else {
      const lowTerm = term.toLowerCase();
      this.assignedRequests = this.allAssignedRequests.filter(req => 
        (req.title && req.title.toLowerCase().includes(lowTerm)) ||
        (req.destination && req.destination.toLowerCase().includes(lowTerm)) ||
        (req.purpose && req.purpose.toLowerCase().includes(lowTerm))
      );
    }
  }

  getStatusClass(status: string): string {
    if (status === 'Approved' || status === 'Finance Pending' || status === 'finance pending') return 'approved';
    if (status === 'Pending' || status === 'pending manager') return 'pending';
    if (status === 'Rejected' || status === 'rejected by manager') return 'rejected';
    return '';
  }

  getStatusLabel(status: string): string {
    return status.replace(/_/g, ' ');
  }

  toggleSidebar(pinned: boolean): void {
    this.isSidebarCollapsed = !pinned;
  }

  acceptRequest(req: TravelRequest): void {
    if (req.estimatedBudget > this.remainingBudget()) {
      alert('Insufficient remaining travel budget to approve this request.');
      return;
    }

    this.http.put(API_ENDPOINTS.MANAGER.APPROVE_REQUEST(req.id), {}).subscribe({
      next: () => {
        // Update budget signal
        this.remainingBudget.update(b => b - req.estimatedBudget);
        this.loadRequests();
        this.loadBudget();
      },
      error: (err) => console.error('Error approving request', err)
    });
  }

  rejectRequest(req: TravelRequest): void {
    this.currentRequestToReject = req;
    this.showRejectModal = true;
  }

  closeModal(): void {
    this.showRejectModal = false;
    this.currentRequestToReject = null;
    this.selectedReason = '';
    this.otherReason = '';
  }

  confirmReject(): void {
    if (this.currentRequestToReject && this.selectedReason) {
      const finalReason = this.selectedReason === 'Other' ? this.otherReason : this.selectedReason;
      const wasPreviouslyApproved = this.currentRequestToReject.managerApproved;
      
      this.http.put(API_ENDPOINTS.MANAGER.REJECT_REQUEST(this.currentRequestToReject.id), { reason: finalReason }).subscribe({
        next: () => {
          if (wasPreviouslyApproved) {
            // Refund budget if we are overriding an approval
            this.remainingBudget.update(b => b + (this.currentRequestToReject?.estimatedBudget || 0));
          }
          this.loadRequests();
          this.loadBudget();
          this.closeModal();
        },
        error: (err) => console.error('Error rejecting request', err)
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
