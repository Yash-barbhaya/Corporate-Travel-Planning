import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TravelRequestService } from '../../../../services/travel-request.service';
import { AuthService } from '../../../../services/auth.service';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { TravelRequest } from '../../../../shared/models/travel-request.model';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-travel-history',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div class="page-container">
      <div class="header">
        <div class="title-group">
          <h1>📜 Travel History</h1>
          <p>Review your completed and closed business trips.</p>
        </div>
        <div class="filters">
          <select class="filter-select" (change)="onYearChange($event)">
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="all">All Years</option>
          </select>
        </div>
      </div>

      <div class="content">
        <div class="table-card" *ngIf="historyTrips.length > 0; else empty">
          <table class="history-table">
            <thead>
              <tr>
                <th>Trip Details</th>
                <th>Destination</th>
                <th>Dates</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let trip of historyTrips">
                <td>
                  <div class="trip-info">
                    <span class="trip-title">{{ trip.title }}</span>
                    <span class="trip-id">#{{ trip.id }}</span>
                  </div>
                </td>
                <td>{{ trip.destination }}</td>
                <td>{{ trip.startDate | date:'MMM d' }} - {{ trip.endDate | date:'MMM d, y' }}</td>
                <td>
                  <div class="amount-info">
                    <span class="val">₹{{ trip.estimatedBudget | number }}</span>
                    
                  </div>
                </td>
                <td>
                  <app-status-badge [status]="trip.status"></app-status-badge>
                </td>
                <td>
                  <button class="view-btn" (click)="onView(trip)">View Details</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #empty>
          <app-empty-state
            icon="📜"
            title="No history found"
            description="No closed or completed trips found for this period."
          ></app-empty-state>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 32px;
      animation: fadeIn 0.4s ease-out;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
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

    .filter-select {
      padding: 10px 16px;
      border-radius: 8px;
      border: 1px solid var(--color-border-subtle);
      background: white;
      font-weight: 600;
      color: var(--color-navy-primary);
      outline: none;
    }

    .table-card {
      background: var(--color-surface-card);
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      border: 1px solid var(--color-border-subtle);
      overflow: hidden;
    }

    .history-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .history-table th {
      padding: 18px 24px;
      background: #f8fafc;
      color: #64748b;
      font-weight: 700;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--color-border-subtle);
    }

    .history-table td {
      padding: 18px 24px;
      border-bottom: 1px solid var(--color-border-subtle);
      color: var(--color-navy-primary);
      font-size: 0.9375rem;
    }

    .history-table tr:last-child td {
      border-bottom: none;
    }

    .trip-info {
      display: flex;
      flex-direction: column;
    }

    .trip-title {
      font-weight: 700;
      color: var(--color-navy-primary);
    }

    .trip-id {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .amount-info {
      display: flex;
      flex-direction: column;
    }

    .amount-info .val {
      font-weight: 700;
      color: var(--color-mint-success);
    }

    .amount-info .sub {
      font-size: 0.625rem;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
    }

    .view-btn {
      padding: 8px 16px;
      background: var(--color-navy-primary);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.8125rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .view-btn:hover {
      opacity: 0.9;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class TravelHistoryComponent implements OnInit {
  historyTrips: TravelRequest[] = [];

  constructor(
    private travelRequestService: TravelRequestService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.authService.currentUserValue?.id || 0;
    this.travelRequestService.getUserRequests(userId).subscribe({
      next: (data) => {
        this.historyTrips = data.filter((trip: any) => 
          trip.status === 3 || 
          trip.status === 4 ||
          trip.status?.toString().toLowerCase() === 'approvedbyfinance' ||
          trip.status?.toString().toLowerCase() === 'approved' ||
          trip.status?.toString().toLowerCase() === 'rejected'
        );
      },
      error: (error) => {
        console.error('Error fetching travel history:', error);
      }
    });
  }

  onYearChange(event: any) {
    const year = event.target.value;
    // Filtering logic would go here
  }

  onView(request: TravelRequest) {
    this.router.navigate(['/employee/travel-details', request.id]);
  }
}
