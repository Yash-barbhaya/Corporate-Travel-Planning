import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ReimbursementClaim, ReimbursementApprovalDTO } from '../../models/reimbursement.model';
import { ReimbursementService } from '../../../core/services/reimbursement.service';

@Component({
  selector: 'app-reimbursement-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reimbursement-approvals.component.html',
  styleUrl: './reimbursement-approvals.component.scss'
})
export class ReimbursementApprovalsComponent implements OnInit {
  reimbursementClaims: any[] = [];
  private reimbursementService = inject(ReimbursementService);
  private http = inject(HttpClient);

  showRejectModal = false;
  currentClaimToReject: any = null;
  selectedReason = '';
  customReason = '';
  rejectionReasons: string[] = [
    'Receipt image is blurry or unreadable',
    'Incurred expense exceeds the allowed category budget ceiling',
    'Missing itemized breakdown details on the attached document',
    'Personal or non-business expense policy violation',
    'Duplicate claim submission detected',
    'Other'
  ];

  ngOnInit(): void {
    this.fetchPendingApprovals();
  }

  fetchPendingApprovals(): void {
    this.http.get<any[]>(`${environment.apiUrl}/Reimbursement/pending-approvals`).subscribe({
      next: (data) => {
        this.reimbursementClaims = data.map(claim => {
          if (claim.receiptFilePath) {
            // Normalize path separators to forward slashes
            let cleanPath = claim.receiptFilePath.replace(/\\/g, '/');
            
            // Extract the path segment starting with "uploads/" to map it to the static route
            const uploadsIdx = cleanPath.toLowerCase().indexOf('uploads/');
            if (uploadsIdx !== -1) {
              cleanPath = cleanPath.substring(uploadsIdx);
            } else {
              // Fallback to last segment if uploads is not found
              const parts = cleanPath.split('/');
              cleanPath = 'Uploads/' + parts[parts.length - 1];
            }

            const baseUrl = environment.apiUrl.replace('/api', '');
            claim.receiptUrl = `${baseUrl}/${cleanPath}`;
          } else {
            claim.receiptUrl = null;
          }
          claim.showItinerary = false;
          return claim;
        });
      },
      error: (err) => console.error('Error fetching data:', err)
    });
  }

  approveClaim(claim: any) {
    const payload = {
      expenseId: claim.expenseId,
      approvedAmount: claim.requestedAmount,
      managerNotes: "Approved by Finance",
      status: 3 // 🎯 FullyApproved
    };

    if (claim.editableAmount !== undefined && claim.editableAmount < claim.requestedAmount) {
      payload.approvedAmount = claim.editableAmount;
      payload.managerNotes = "Capped reimbursement. Excess amount over budget denied.";
      payload.status = 2; // 🎯 PartiallyApproved
    }

    this.http.post(`${environment.apiUrl}/Reimbursement/approve`, payload).subscribe({
      next: (res: any) => {
        console.log('Approval success!', res);
        this.fetchPendingApprovals(); // Wipes it from the screen
      },
      error: (err) => console.error(err)
    });
  }

  openRejectModal(claim: any): void {
    this.currentClaimToReject = claim;
    this.selectedReason = '';
    this.customReason = '';
    this.showRejectModal = true;
  }

  closeModal(): void {
    this.showRejectModal = false;
    this.currentClaimToReject = null;
    this.selectedReason = '';
    this.customReason = '';
  }

  confirmReject(): void {
    if (this.currentClaimToReject && this.selectedReason) {
      if (this.selectedReason === 'Other' && !this.customReason.trim()) {
        alert('Please specify a custom reason.');
        return;
      }
      const finalReason = this.selectedReason === 'Other' ? this.customReason : this.selectedReason;
      
      this.rejectClaim(this.currentClaimToReject, finalReason);
    }
  }

  rejectClaim(claim: any, reason: string): void {
    const payload = {
      expenseId: claim.expenseId,
      approvedAmount: 0,
      managerNotes: reason,
      status: 4 // 🎯 OutOfBudget
    };

    this.http.post(`${environment.apiUrl}/Reimbursement/approve`, payload).subscribe({
      next: () => {
        this.fetchPendingApprovals();
        this.closeModal();
      },
      error: (err) => console.error('Error rejecting claim', err)
    });
  }
}
