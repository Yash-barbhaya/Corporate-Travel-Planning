import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [ngClass]="statusClass">
      {{ displayStatus }}
    </span>
  `,
  styles: [`
    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      display: inline-block;
    }


    .status-pending { background: #fef9c3; color: #854d0e; }
    .status-manager-approved { background: #dcfce7; color: #166534; }
    .status-finance-pending { background: #e0f2fe; color: #075985; }
    .status-approved { background: #dcfce7; color: #15803d; }
    .status-rejected { background: #fee2e2; color: #991b1b; }
    .status-completed { background: #f0f9ff; color: #0369a1; }
    .status-closed { background: #f8fafc; color: #475569; }
    
    /* Fallback and dynamic mapping */
    .status-finance-pending { background: #e0f2fe; color: #075985; }
  `]
})
export class StatusBadgeComponent {
  @Input() status: any = '';

  get displayStatus(): string {
    if (this.status === 1 || this.status === '1' || this.status === 'Pending' || this.status === 'pending') return 'Pending';
    if (this.status === 2 || this.status === '2' || this.status === 'ApprovedByManager' || this.status === 'Manager Approved' || this.status === 'Finance Pending' || this.status === 'finance pending') return 'Finance Pending';
    if (this.status === 3 || this.status === '3' || this.status === 'ApprovedByFinance' || this.status === 'Approved' || this.status === 'approved') return 'Approved';
    if (this.status === 4 || this.status === '4' || this.status === 'Rejected' || this.status === 'rejected') return 'Rejected';
    return String(this.status || 'Pending');
  }

  get statusClass(): string {
    const s = this.displayStatus.toLowerCase().replace(/ /g, '-');
    return `status-${s}`;
  }
}
