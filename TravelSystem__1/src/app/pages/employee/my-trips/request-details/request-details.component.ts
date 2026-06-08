import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TravelRequestService } from '../../../../services/travel-request.service';
import { TimelineStepperComponent } from '../../../../shared/components/timeline-stepper/timeline-stepper.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { TravelRequest } from '../../../../shared/models/travel-request.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-request-details',
  standalone: true,
  imports: [CommonModule, RouterLink, TimelineStepperComponent, StatusBadgeComponent],
  template: `
    <div class="page-container" *ngIf="requestDetails">
      <div class="header">
        <button class="back-btn" [routerLink]="['/employee/my-trips/active']">← Back to Trips</button>
        <div class="title-row">
          <div class="title-group">
            <h1>Travel Request Details - ID: #{{ requestDetails.id }}</h1>
          </div>
          <app-status-badge [status]="requestDetails.status"></app-status-badge>
        </div>
      </div>

      <div class="main-layout">
        <div class="left-col">
          <!-- TIMELINE CARD -->
          <div class="card timeline-card">
            <h3>Status Track</h3>
            <app-timeline-stepper 
              [steps]="['Manager Approval', 'Finance Approval']"
              [currentStep]="getStatusStep(requestDetails.status)"
              [rejectedStep]="getRejectedStep(requestDetails)"
            ></app-timeline-stepper>
          </div>

          <!-- INFO CARD -->
          <div class="card info-card">
            <h3>Trip Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Destination</span>
                <span class="value">📍 {{ requestDetails.destination }}</span>
              </div>
              <div class="info-item">
                <span class="label">Purpose of Trip / Description</span>
                <span class="value">💼 {{ requestDetails.purpose }}</span>
              </div>
              <div class="info-item">
                <span class="label">Travel Dates</span>
                <span class="value">📅 {{ requestDetails.startDate | date }} to {{ requestDetails.endDate | date }}</span>
              </div>
              <div class="info-item">
                <span class="label">Financials: Total Estimated Budget</span>
                <span class="value">{{ requestDetails.estimatedBudget | currency:'INR':'symbol':'1.0-0' }}</span>
              </div>
            </div>
          </div>

          <!-- ITINERARY TIMELINE CARD -->
          <div class="card itinerary-timeline-card-wrapper border-0 shadow-sm" *ngIf="requestDetails?.itineraries?.length" style="border-radius: 12px; background: #ffffff; margin-bottom: 32px;">
            <h3 style="color: #1E3A8A; font-weight: 700; margin-bottom: 24px;">📋 Day-by-Day Itinerary</h3>
            
            <div class="vertical-timeline" style="position: relative; padding-left: 32px; border-left: 2px solid #E2E8F0; margin-left: 10px;">
              <div 
                *ngFor="let day of requestDetails.itineraries; let idx = index" 
                class="timeline-item"
                style="position: relative; margin-bottom: 24px;"
              >
                <!-- Rounded circle pin marker -->
                <div 
                  class="timeline-pin"
                  style="position: absolute; left: -43px; top: 4px; width: 22px; height: 22px; border-radius: 50%; background: #0D9488; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700;"
                >
                  {{ idx + 1 }}
                </div>
                
                <!-- Content details panel -->
                <div 
                  class="timeline-panel"
                  style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px;"
                >
                  <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                    <span class="location" style="color: #1E3A8A; font-weight: 700; font-size: 0.95rem;">📍 {{ day.location }}</span>
                    <span class="date-badge" style="background: #E2E8F0; color: #1E3A8A; font-size: 0.75rem; padding: 4px 8px; border-radius: 4px; font-weight: 600;">
                      {{ day.date | date:'EEEE, MMM d' }}
                    </span>
                  </div>
                  
                  <p class="activity-text" style="color: #475569; font-size: 0.875rem; line-height: 1.5; margin: 0 0 8px 0;">
                    {{ day.activityDetails }}
                  </p>
                  
                  <div 
                    *ngIf="day.hotelOrAccommodation" 
                    class="accommodation-info" 
                    style="color: #475569; font-size: 0.8125rem; font-weight: 600; display: flex; align-items: center; gap: 4px; margin-top: 8px;"
                  >
                    🏨 Stay: {{ day.hotelOrAccommodation }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="right-col">
          <!-- EXPENSE BREAKDOWN -->
          <div class="card expense-card" *ngIf="requestDetails.expenseBreakdown">
            <h3>Estimated Breakdown</h3>
            <div class="expense-list">
              <div class="expense-row">
                <span class="lbl">Travel</span>
                <span class="val">₹{{ requestDetails.expenseBreakdown.travel | number }}</span>
              </div>
              <div class="expense-row">
                <span class="lbl">Hotel</span>
                <span class="val">₹{{ requestDetails.expenseBreakdown.hotel | number }}</span>
              </div>
              <div class="expense-row">
                <span class="lbl">Meals</span>
                <span class="val">₹{{ requestDetails.expenseBreakdown.meals | number }}</span>
              </div>
              <div class="expense-row">
                <span class="lbl">Other</span>
                <span class="val">₹{{ requestDetails.expenseBreakdown.other | number }}</span>
              </div>
            </div>
            <div class="total-row">
              <span>Total Estimated</span>
              <span>₹{{ requestDetails.estimatedBudget | number }}</span>
            </div>
          </div>

          <!-- REJECTION CARD -->
          <div class="card rejection-card" *ngIf="$any(requestDetails.status) === 4">
            <h3>Rejection Reason</h3>
            <div class="reason-box">
              <span class="icon">⚠️</span>
              <p>{{ requestDetails.rejectionReason || 'No reason provided by the manager.' }}</p>
            </div>
            <button class="edit-btn">Edit and Resubmit</button>
          </div>
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

    .back-btn {
      background: none;
      border: none;
      color: #3b82f6;
      font-weight: 700;
      font-size: 0.875rem;
      cursor: pointer;
      margin-bottom: 16px;
      padding: 0;
    }

    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .title-group h1 {
      font-size: 2.25rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0;
    }

    .title-group .id {
      font-size: 0.875rem;
      color: #94a3b8;
      font-weight: 600;
    }

    .main-layout {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 32px;
    }

    @media (max-width: 1024px) {
      .main-layout {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      border: 1px solid #f1f5f9;
      margin-bottom: 32px;
    }

    .card h3 {
      font-size: 1.125rem;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 24px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item .label {
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .info-item .value {
      font-size: 1rem;
      font-weight: 600;
      color: #334155;
    }

    .expense-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .expense-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9375rem;
      font-weight: 600;
      color: #64748b;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;
      font-weight: 800;
      color: #1e293b;
      font-size: 1.125rem;
    }

    .reason-box {
      background: #fff1f2;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .reason-box .icon {
      font-size: 20px;
    }

    .reason-box p {
      margin: 0;
      color: #991b1b;
      font-weight: 600;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .edit-btn {
      width: 100%;
      padding: 12px;
      background: #1e293b;
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class RequestDetailsComponent implements OnInit {
  requestDetails?: TravelRequest;

  constructor(
    private route: ActivatedRoute,
    private travelRequestService: TravelRequestService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.travelRequestService.getRequestById(id).subscribe({
      next: (data) => {
        this.requestDetails = data;
      },
      error: (err) => {
        console.error('Failed to load travel request details', err);
      }
    });
  }

  getStatusStep(status: any): number {
    if (status === 1 || status === 'Pending' || status === 'pending') return 0;
    if (status === 2 || status === 'Manager Approved' || status === 'ApprovedByManager' || status === 'Finance Pending' || status === 'finance pending') return 1;
    if (status === 3 || status === 'Approved' || status === 'ApprovedByFinance' || status === 'approved') return 2;
    return 0;
  }

  getRejectedStep(request: TravelRequest): number {
    const status: any = request.status;
    if (status === 4 || status === 'Rejected') {
      // If manager approved is true, then finance rejected it
      if (request.managerApproved) return 1;
      return 0; // Otherwise manager rejected it
    }
    return -1;
  }
}
