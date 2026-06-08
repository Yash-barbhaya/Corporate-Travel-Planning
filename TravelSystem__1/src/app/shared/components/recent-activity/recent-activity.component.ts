import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Activity {
  id: number;
  message: string;
  timestamp: string;
  type: 'approve' | 'reject' | 'submit';
}

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="activity-card card">
      <div class="card-header">
        <h3>Recent Activity</h3>
      </div>
      
      <div class="activity-list">
        @for (item of activities; track item.id) {
          <div class="activity-item">
            <div class="icon-box" [ngClass]="item.type">
              @if (item.type === 'approve') { ✅ }
              @else if (item.type === 'reject') { ❌ }
              @else { 📝 }
            </div>
            <div class="activity-content">
              <p class="message">{{ item.message }}</p>
              <span class="time">{{ item.timestamp }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .activity-card {
      padding: 24px;
      height: 100%;
    }

    .card-header h3 {
      font-size: 1.1rem;
      color: #1e293b;
      font-weight: 700;
      margin-bottom: 20px;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .activity-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .icon-box {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }

    .icon-box.approve { background: #dcfce7; color: #166534; }
    .icon-box.reject { background: #fee2e2; color: #991b1b; }
    .icon-box.submit { background: #e0f2fe; color: #075985; }

    .activity-content {
      display: flex;
      flex-direction: column;
    }

    .message {
      font-size: 0.9rem;
      color: #334155;
      font-weight: 600;
      margin: 0;
      line-height: 1.4;
    }

    .time {
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 500;
    }
  `]
})
export class RecentActivityComponent {
  @Input() activities: Activity[] = [];
}
