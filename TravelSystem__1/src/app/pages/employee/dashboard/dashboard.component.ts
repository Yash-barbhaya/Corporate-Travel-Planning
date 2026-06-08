import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { EmployeeDashboardService } from '../../../services/employee-dashboard.service';
import { TravelRequestService } from '../../../services/travel-request.service';
import { AuthService } from '../../../services/auth.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { RequestCardComponent } from '../../../shared/components/request-card/request-card.component';
import { TravelRequest } from '../../../shared/models/travel-request.model';
import { User } from '../../../shared/models/user.model';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent, RequestCardComponent],
  template: `
    <div class="dashboard-container">
      <div class="stats-grid">
        <app-stat-card label="Total Requests" [value]="stats?.totalTrips ?? 0" icon="📋" color="var(--color-teal-action)"></app-stat-card>
        <app-stat-card label="Approved Amount" [value]="'₹' + ((stats?.approvedBudgetSpent ?? 0) | number)" icon="💰" color="#0ea5e9"></app-stat-card>
        <app-stat-card label="Pending Requests" [value]="stats?.pendingApprovals ?? 0" icon="⏳" color="#eab308"></app-stat-card>
        <app-stat-card label="Rejected Requests" [value]="stats?.rejectedRequests ?? 0" icon="❌" color="#ef4444"></app-stat-card>
      </div>

      <!-- MAIN CONTENT -->
      <div class="main-content">
        <!-- EXPENSE OVERVIEW -->
        <div class="content-section expense-overview">
          <div class="section-header">
            <h3>Expense Overview</h3>
          </div>
          <div class="chart-container">
            <div class="expense-bars">
              <div class="expense-item">
                <div class="label-group">
                  <span>Travel</span>
                  <span>{{ stats?.travelPercentage || 0 }}%</span>
                </div>
                <div class="progress-bg"><div class="progress-bar-fill" [style.width.%]="stats?.travelPercentage || 0" style="background: var(--color-teal-action);"></div></div>
              </div>
              <div class="expense-item">
                <div class="label-group">
                  <span>Hotel</span>
                  <span>{{ stats?.hotelPercentage || 0 }}%</span>
                </div>
                <div class="progress-bg"><div class="progress-bar-fill" [style.width.%]="stats?.hotelPercentage || 0" style="background: var(--color-teal-action);"></div></div>
              </div>
              <div class="expense-item">
                <div class="label-group">
                  <span>Meals</span>
                  <span>{{ stats?.mealsPercentage || 0 }}%</span>
                </div>
                <div class="progress-bg"><div class="progress-bar-fill" [style.width.%]="stats?.mealsPercentage || 0" style="background: var(--color-teal-action);"></div></div>
              </div>
              <div class="expense-item">
                <div class="label-group">
                  <span>Other</span>
                  <span>{{ stats?.otherPercentage || 0 }}%</span>
                </div>
                <div class="progress-bg"><div class="progress-bar-fill" [style.width.%]="stats?.otherPercentage || 0" style="background: var(--color-teal-action);"></div></div>
              </div>
            </div>
          </div>
        </div>

        <!-- RECENT REQUESTS -->
        <div class="content-section recent-requests">
          <div class="section-header">
            <h3>Recent Requests</h3>
            <a [routerLink]="['/employee/my-trips']" class="view-all">View All</a>
          </div>
          <div class="requests-list">
            <app-request-card 
              *ngFor="let req of recentRequests$ | async" 
              [request]="req"
              [showProgress]="false"
              (view)="onView($event)"
              (edit)="onEdit($event)"
              (delete)="onDelete($event)"
            ></app-request-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 0;
      animation: fadeIn 0.4s ease-out;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    .main-content {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 32px;
    }

    @media (max-width: 1024px) {
      .main-content {
        grid-template-columns: 1fr;
      }
    }

    .content-section {
      background: var(--color-surface-card);
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--color-border-subtle);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .section-header h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text-main);
      margin: 0;
    }

    .total {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--color-teal-action);
      background: rgba(13, 148, 136, 0.1);
      padding: 4px 12px;
      border-radius: 20px;
    }

    .view-all {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-teal-action);
      text-decoration: none;
    }

    .view-all:hover {
      text-decoration: underline;
    }

    .expense-bars {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .expense-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .label-group {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .label-group span:first-child {
      color: var(--color-text-muted);
    }

    .label-group span:last-child {
      color: var(--color-text-main);
    }

    .progress-bg {
      height: 8px;
      background: var(--color-border-subtle);
      border-radius: 10px;
      overflow: hidden;
    }

    .progress-fill, .progress-bar-fill {
      height: 100%;
      border-radius: 10px;
    }

    .requests-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class EmployeeDashboardComponent implements OnInit {
  user$!: Observable<User | null>;
  recentRequests$!: Observable<TravelRequest[]>;
  stats: any;

  constructor(
    private dashboardService: EmployeeDashboardService,
    private travelRequestService: TravelRequestService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get the current user
    this.user$ = this.authService.currentUser$;
    const userId = this.authService.currentUserValue?.id || 0;

    // Fetch dashboard stats via API
    this.travelRequestService.getEmployeeDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (error) => {
        console.error('Error fetching dashboard stats', error);
        this.stats = {
          totalTrips: 0,
          pendingApprovals: 0,
          approvedBudgetSpent: 0,
          totalAllocatedBudget: 0,
          remainingBudget: 0,
          budgetUtilizationPercentage: 0
        };
      }
    });

    // Fetch recent requests via API
    this.recentRequests$ = this.travelRequestService.getRecentRequests(userId, 3).pipe(
      catchError(error => {
        console.error('Error fetching recent requests', error);
        return of([]);
      })
    );
  }

  onView(request: TravelRequest) {
    this.router.navigate(['/employee/travel-details', request.id]);
  }

  onEdit(request: TravelRequest): void {
    this.router.navigate(['/employee/edit-request', request.id]);
  }

  onDelete(request: TravelRequest): void {
    if (confirm(`Are you sure you want to delete request #${request.id}?`)) {
      this.travelRequestService.deleteRequest(request.id).subscribe({
        next: () => {
          // Re-trigger our dashboard data streams to refresh the cards and count blocks seamlessly
          this.ngOnInit();
        },
        error: (err) => console.error('Failed to delete request from dashboard view', err)
      });
    }
  }
}
