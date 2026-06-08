import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { Reimbursement } from '../../../../shared/models/expense.model';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api-endpoints';
import { environment } from '../../../../../environments/environment';


@Component({
  selector: 'app-reimbursements',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div class="page-container">
      <div class="header">
        <div class="title-group">
          <h1>💰 Reimbursements</h1>
          <p>Track your expense repayments and payment status.</p>
        </div>
      </div>

      <div class="content">
        <div class="table-card" *ngIf="myClaims && myClaims.length > 0">
          <table class="reimbursement-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Trip Budget</th>
                <th>Claimed Amount</th>
                <th>Approved Amount</th>
                <th>Status</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let claim of myClaims">
                <td>
                  <div class="trip-info">
                    <span class="name">{{ claim.category }}</span>
                    <span class="id">REQ #{{ claim.travelRequestId }}</span>
                  </div>
                </td>
                <td>{{ claim.totalTripBudget | currency:'INR':'symbol':'1.0-0' }}</td>
                <td><span class="amount">{{ claim.requestedAmount | currency:'INR':'symbol':'1.2-2' }}</span></td>
                <td>
                  <div class="approved-col">
                    <span class="amount approved">{{ claim.approvedAmount | currency:'INR':'symbol':'1.2-2' }}</span>
                    <span class="notes" [title]="claim.managerNotes || 'No notes added'">ℹ️ {{ claim.managerNotes || 'No notes added' }}</span>
                  </div>
                </td>
                <td><app-status-badge [status]="claim.status"></app-status-badge></td>
                <td>
                  <span class="pay-status">
                    {{ claim.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="!myClaims || myClaims.length === 0">
          <app-empty-state
            icon="💰"
            title="No claims found"
            description="You haven't submitted any reimbursement claims yet."
          ></app-empty-state>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 32px;
      animation: fadeIn 0.4s ease-out;
    }

    .header {
      margin-bottom: 32px;
    }

    .title-group h1 {
      font-size: 1.875rem;
      font-weight: 800;
      color: var(--color-navy-primary);
      margin-bottom: 4px;
    }

    .title-group p {
      color: #64748b;
    }

    .table-card {
      background: var(--color-surface-card);
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      border: 1px solid var(--color-border-subtle);
      overflow: hidden;
    }

    .reimbursement-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .reimbursement-table th {
      padding: 18px 24px;
      background: #f8fafc;
      color: #64748b;
      font-weight: 700;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--color-border-subtle);
    }

    .reimbursement-table td {
      padding: 18px 24px;
      border-bottom: 1px solid var(--color-border-subtle);
      color: var(--color-navy-primary);
      font-size: 0.9375rem;
    }

    .reimbursement-table tr:last-child td {
      border-bottom: none;
    }

    .trip-info {
      display: flex;
      flex-direction: column;
    }

    .name {
      font-weight: 700;
      color: var(--color-navy-primary);
    }

    .id {
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 600;
    }

    .amount {
      font-weight: 700;
      color: var(--color-navy-primary);
    }

    .amount.approved {
      color: var(--color-mint-success);
    }

    .approved-col {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .notes {
      font-size: 0.65rem;
      color: #64748b;
      cursor: help;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 2px;
    }

    .pay-status {
      font-size: 0.8125rem;
      font-weight: 700;
    }

    .pay-status.paid { color: var(--color-mint-success); }
    .pay-status.pending { color: #f59e0b; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ReimbursementsComponent implements OnInit {
  myClaims: any[] = [];
  
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>(`${environment.apiUrl}/Reimbursement/my-claims`).subscribe(data => {
      this.myClaims = data;
    });
  }
}
