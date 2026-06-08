import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { TravelRequest } from '../../../shared/models/travel-request.model';
import { SidebarComponent } from '../../../sidebar/sidebar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  allRequests: TravelRequest[] = [];
  filteredRequests: TravelRequest[] = [];
  isSidebarCollapsed = true;
  searchTerm = '';
  statusFilter = 'All';

  // Decline modal state
  showRejectModal = false;
  currentRequestToReject: TravelRequest | null = null;
  selectedReason = '';
  otherReason = '';
  rejectionReasons = [
    'Budget constraints',
    'Insufficient justification',
    'Policy violation',
    'Incomplete documentation',
    'Duplicate request',
    'Other'
  ];

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.adminService.getAllRequests().subscribe({
      next: (data) => {
        this.allRequests = data;
        this.applyFilters();
      },
      error: (err) => console.error('Error fetching admin requests', err)
    });
  }

  toggleSidebar(pinned: boolean): void {
    this.isSidebarCollapsed = !pinned;
  }

  applyFilters(): void {
    let requests = [...this.allRequests];

    // Status filter
    if (this.statusFilter !== 'All') {
      requests = requests.filter(r => {
        const statusLabel = this.getStatusLabel(r.status).toLowerCase();
        return statusLabel === this.statusFilter.toLowerCase();
      });
    }

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      requests = requests.filter(r => 
        (r.employeeName && r.employeeName.toLowerCase().includes(term)) ||
        (r.destination && r.destination.toLowerCase().includes(term)) ||
        (r.purpose && r.purpose.toLowerCase().includes(term)) ||
        (r.employeeDepartment && r.employeeDepartment.toLowerCase().includes(term))
      );
    }

    this.filteredRequests = requests;
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
    if (label.includes('approved')) return 'approved';
    if (label.includes('finance pending')) return 'finance-pending';
    if (label.includes('pending')) return 'pending';
    if (label.includes('rejected')) return 'rejected';
    return '';
  }

  acceptRequest(req: TravelRequest): void {
    if (confirm('Are you sure you want to approve this request?')) {
      this.adminService.approveRequest(req.id).subscribe({
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
      this.adminService.rejectRequest(this.currentRequestToReject.id, finalReason).subscribe({
        next: () => {
          this.loadRequests();
          this.closeModal();
        },
        error: (err) => console.error('Error rejecting request', err)
      });
    }
  }
}
