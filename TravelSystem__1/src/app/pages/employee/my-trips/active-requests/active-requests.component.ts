import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TravelRequestService } from '../../../../services/travel-request.service';
import { AuthService } from '../../../../services/auth.service';
import { RequestCardComponent } from '../../../../shared/components/request-card/request-card.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { TravelRequest, TravelStatus } from '../../../../shared/models/travel-request.model';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-active-requests',
  standalone: true,
  imports: [CommonModule, RequestCardComponent, EmptyStateComponent],
  template: `
    <div class="page-container">
      <div class="header">
        <div class="title-group">
          <h1>✈️ Active Requests</h1>
          <p>Track and manage your ongoing travel requests and approvals.</p>
        </div>
      </div>

      <div class="content">
        <div class="requests-grid" *ngIf="requests.length > 0; else empty">
          <app-request-card 
            *ngFor="let req of requests" 
            [request]="req"
            (view)="onView($event)"
            (edit)="onEdit($event)"
            (delete)="onDeleteRequest($event)"
          ></app-request-card>
        </div>

        <ng-template #empty>
          <app-empty-state
            icon="✈️"
            title="No active travel requests found."
            description="You don't have any active or pending travel requests at the moment."
            actionText="Create New Request"
            (action)="onCreate()"
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
      margin-bottom: 32px;
    }

    .title-group h1 {
      font-size: 1.875rem;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .title-group p {
      color: #64748b;
    }

    .requests-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 24px;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ActiveRequestsComponent implements OnInit {
  requests: TravelRequest[] = [];

  constructor(
    private travelRequestService: TravelRequestService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.authService.currentUserValue?.id || 0;
    this.travelRequestService.getUserRequests(userId).subscribe({
      next: (data) => {
        this.requests = data.filter((trip: any) => 
          trip.status === 1 || 
          trip.status === 2 ||
          trip.status?.toString().toLowerCase() === 'pending' ||
          trip.status?.toString().toLowerCase() === 'approvedbymanager' ||
          trip.status?.toString().toLowerCase() === 'finance pending'
        );
      },
      error: (error) => {
        console.error('Error fetching active requests:', error);
      }
    });
  }

  onView(request: TravelRequest) {
    this.router.navigate(['/employee/travel-details', request.id]);
  }

  onEdit(request: TravelRequest) {
    this.router.navigate(['/employee/edit-request', request.id]);
  }

  onDeleteRequest(request: TravelRequest) {
    if (confirm('Are you sure you want to delete this request?')) {
      this.travelRequestService.deleteRequest(request.id).subscribe({
        next: () => {
          // Remove the deleted card from the UI array natively
          this.requests = this.requests.filter(r => r.id !== request.id);
        },
        error: (error) => {
          console.error('Error deleting request:', error);
        }
      });
    }
  }

  onCreate() {
    this.router.navigate(['/employee/create-request']);
  }
}
