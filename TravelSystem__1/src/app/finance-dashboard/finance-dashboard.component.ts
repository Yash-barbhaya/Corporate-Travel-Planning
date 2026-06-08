import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { User } from '../shared/models/user.model';
import { TravelRequest } from '../shared/models/travel-request.model';
import { TravelRequestService } from '../shared/services/travel-request.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../core/constants/api-endpoints';

@Component({
  selector: 'app-finance-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SidebarComponent],
  templateUrl: './finance-dashboard.component.html',
  styleUrl: './finance-dashboard.component.scss'
})
export class FinanceDashboardComponent implements OnInit {
  currentUser: User | null = null;
  assignedRequests: TravelRequest[] = [];
  allAssignedRequests: TravelRequest[] = [];
  isSidebarCollapsed: boolean = true;
  private http = inject(HttpClient);
  
  // Rejection Modal State
  showRejectModal: boolean = false;
  currentRequestToReject: TravelRequest | null = null;
  selectedReason: string = '';
  otherReason: string = '';
  rejectionReasons: string[] = [
    'Budget constraints',
    'Insufficient justification',
    'Policy violation',
    'Incomplete documentation',
    'Duplicate request',
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

  pageTitle: string = 'Finance Approval';
  pageSubtitle: string = 'Review and process travel requests approved by managers.';

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadRequests();

    // Subscribe to search term
    this.travelRequestService.searchTerm$.subscribe(term => {
      this.applyFilter(term);
    });
  }

  loadRequests(): void {
    this.http.get<TravelRequest[]>(API_ENDPOINTS.FINANCE.PENDING_APPROVALS).subscribe({
      next: (allRequests) => {
        const isDashboard = this.router.url.includes('/dashboard');
        
        if (isDashboard) {
          this.pageTitle = 'Action Required';
          this.pageSubtitle = 'Final review for manager-approved requests.';
          this.allAssignedRequests = allRequests.filter(req => 
            (req.status as string) === 'Finance Pending' || (req.status as string) === 'finance pending' || (req.managerApproved && !req.financeApproved && (req.status as string) !== 'Rejected')
          );
        } else {
          this.pageTitle = 'All Finance Requests';
          this.pageSubtitle = 'Complete overview of all travel requests requiring finance oversight.';
          this.allAssignedRequests = allRequests;
        }
        this.applyFilter('');
      },
      error: (err) => console.error('Error fetching finance requests', err)
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
    if (status === 'Approved') return 'approved';
    if (status === 'Pending' || status === 'pending manager' || status === 'Finance Pending' || status === 'finance pending') return 'pending';
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
    if (confirm('Are you sure you want to approve this request?')) {
      this.http.put(API_ENDPOINTS.FINANCE.FINAL_APPROVE(req.id), {}).subscribe({
        next: () => {
          this.loadRequests();
        },
        error: (err) => console.error('Error approving request', err)
      });
    }
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
      
      this.http.put(API_ENDPOINTS.FINANCE.REJECT_REQUEST(this.currentRequestToReject.id), { reason: finalReason }).subscribe({
        next: () => {
          this.loadRequests();
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
