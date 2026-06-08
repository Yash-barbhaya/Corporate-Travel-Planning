import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TravelRequest } from '../../models/travel-request.model';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-request-card',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div class="request-card" (click)="view.emit(request)">
      <div class="card-header">
        <div class="title-group">
          <h3 class="trip-title">{{ request.title }}</h3>
          <span class="trip-id">ID: #{{ request.id }}</span>
        </div>
        <app-status-badge [status]="request.status"></app-status-badge>
      </div>

      <div class="card-body">
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Destination</span>
            <span class="value">📍 {{ request.destination }}</span>
          </div>
          <div class="info-item">
            <span class="label">Dates</span>
            <span class="value">📅 {{ request.startDate | date:'MMM d' }} - {{ request.endDate | date:'MMM d, y' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Estimated Budget</span>
            <span class="value">₹ {{ request.estimatedBudget | number }}</span>
          </div>
        </div>

        <div class="progress-section" *ngIf="showProgress">
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" [style.width]="progressWidth"></div>
          </div>
          <div class="progress-labels">
            <span>Progress</span>
            <span>Manager</span>
            <span>Finance</span>
          </div>
        </div>
      </div>

      <div class="card-footer" (click)="$event.stopPropagation()">
        <div class="actions">
          <button class="action-btn secondary" (click)="view.emit(request)">View</button>
          <button class="action-btn" *ngIf="canEditOrDelete" (click)="edit.emit(request)">Edit</button>
          <button class="action-btn danger" *ngIf="canEditOrDelete" (click)="delete.emit(request)">Delete</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .request-card {
      background: var(--color-surface-card);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--color-border-subtle);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .request-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
      border-color: var(--color-teal-action);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .title-group {
      display: flex;
      flex-direction: column;
    }

    .trip-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--color-text-main);
      margin: 0;
    }

    .trip-id {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      font-weight: 500;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item .label {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .info-item .value {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--color-text-main);
    }

    .progress-section {
      margin-top: 20px;
    }

    .progress-bar-bg {
      height: 6px;
      background: var(--color-border-subtle);
      border-radius: 10px;
      margin-bottom: 10px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: var(--color-teal-action);
      border-radius: 10px;
      transition: width 0.5s ease;
    }

    .progress-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.625rem;
      color: var(--color-text-muted);
      font-weight: 700;
      text-transform: uppercase;
    }

    .card-footer {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--color-border-subtle);
    }

    .actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .action-btn {
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid var(--color-teal-action);
      background: var(--color-teal-action);
      color: #FFFFFF;
    }

    .action-btn:hover {
      opacity: 0.9;
    }

    .action-btn.secondary {
      background: var(--color-surface-card);
      border: 1px solid var(--color-border-subtle);
      color: var(--color-text-main);
    }

    .action-btn.secondary:hover {
      background: #F8FAFC;
      border-color: var(--color-teal-action);
    }

    .action-btn.danger {
      background: rgba(225, 29, 72, 0.1);
      color: var(--color-coral-danger);
      border: 1px solid rgba(225, 29, 72, 0.15);
    }

    .action-btn.danger:hover {
      background: rgba(225, 29, 72, 0.2);
    }
  `]
})
export class RequestCardComponent {
  @Input() request!: TravelRequest;
  @Input() showProgress: boolean = true;
  
  @Output() view = new EventEmitter<TravelRequest>();
  @Output() edit = new EventEmitter<TravelRequest>();
  @Output() delete = new EventEmitter<TravelRequest>();

  get canEditOrDelete(): boolean {
    const status: any = this.request.status;
    // 🎯 FIXED: Check for 1 or 'Pending' to align with our backend C# configurations
    return status === 1 || status === 'Pending';
  }

  get progressWidth(): string {
    const status: any = this.request.status;
    
    if (status === 4 || status === 'Rejected' || status === 'rejected') {
      return '0%';
    }
    if (status === 1 || status === 'Pending' || status === 'pending') {
      return '25%';
    }
    if (status === 2 || status === 'ApprovedByManager' || status === 'Manager Approved' || status === 'Finance Pending' || status === 'finance pending') {
      return '66%';
    }
    if (status === 3 || status === 'Approved' || status === 'ApprovedByFinance' || status === 'approved') {
      return '100%';
    }
    
    return '0%';
  }
}
