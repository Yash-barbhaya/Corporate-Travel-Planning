import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { TravelRequest } from '../shared/models/travel-request.model';
import { User } from '../shared/models/user.model';
import { API_ENDPOINTS } from '../core/constants/api-endpoints';
import { TravelRequestService } from '../services/travel-request.service';

@Component({
  selector: 'app-manager-request-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './manager-request-details.component.html',
  styleUrl: './manager-request-details.component.scss'
})
export class ManagerRequestDetailsComponent implements OnInit {
  requestDetails: TravelRequest | null = null;
  currentUser: User | null = null;

  get backLink(): string {
    if (this.currentUser?.role === 'admin') return '/admin/dashboard';
    return this.currentUser?.role === 'finance' ? '/finance/dashboard' : '/manager/dashboard';
  }

  get request(): TravelRequest | null {
    return this.requestDetails;
  }
  set request(value: TravelRequest | null) {
    this.requestDetails = value;
  }
  private http = inject(HttpClient);
  
  // Modal state
  showDeclineModal: boolean = false;
  declineReasonCategory: string = '';
  customDeclineReason: string = '';
  
  declineCategories: string[] = [
    'Budget constraints',
    'Insufficient justification',
    'Travel not aligned with business priorities',
    'Alternative solution available (virtual meeting)',
    'Incomplete or unclear details',
    'Other'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private travelService: TravelRequestService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadRequestDetails(id);
    }
  }

  loadRequestDetails(id: number): void {
    this.travelService.getRequestById(id).subscribe({
      next: (data) => {
        this.request = data; // 🎯 This guarantees the data payload contains the filled itineraries array!
        console.log('Successfully synchronized deep request details:', data);
      },
      error: (err) => console.error('Failed to load deep request payload:', err)
    });
  }

  getDuration(start: string, end: string): number {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }

  approveRequest(): void {
    if (this.requestDetails) {
      if (confirm('Are you sure you want to approve this request?')) {
        this.http.put(API_ENDPOINTS.MANAGER.APPROVE_REQUEST(this.requestDetails.id), {}).subscribe({
          next: () => {
            alert('Request Processed Successfully!');
            this.router.navigate(['/manager/dashboard']);
          },
          error: (err) => console.error('Error approving request', err)
        });
      }
    }
  }

  openDeclineModal(): void {
    this.showDeclineModal = true;
  }

  closeDeclineModal(): void {
    this.showDeclineModal = false;
    this.declineReasonCategory = '';
    this.customDeclineReason = '';
  }

  confirmDecline(): void {
    if (this.requestDetails && this.declineReasonCategory) {
      const finalReason = this.declineReasonCategory === 'Other' 
        ? this.customDeclineReason 
        : this.declineReasonCategory;
        
      this.http.put(API_ENDPOINTS.MANAGER.REJECT_REQUEST(this.requestDetails.id), { reason: finalReason }).subscribe({
        next: () => {
          this.closeDeclineModal();
          alert('Request Declined.');
          this.router.navigate(['/manager/dashboard']);
        },
        error: (err) => console.error('Error rejecting request', err)
      });
    }
  }

  getStatusLabel(status: any): string {
    if (status === 1 || status === 'Pending' || status === 'pending') return 'Pending';
    if (status === 2 || status === 'ApprovedByManager' || status === 'Manager Approved' || status === 'Finance Pending' || status === 'finance pending') return 'Finance Pending';
    if (status === 3 || status === 'ApprovedByFinance' || status === 'Approved' || status === 'approved') return 'Approved';
    if (status === 4 || status === 'Rejected' || status === 'rejected') return 'Rejected';
    return String(status);
  }

  getStatusClass(status: any): string {
    const label = this.getStatusLabel(status).toLowerCase();
    if (label.includes('approved') || label.includes('finance pending')) return 'approved';
    if (label.includes('pending')) return 'pending';
    if (label.includes('rejected')) return 'rejected';
    return '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
