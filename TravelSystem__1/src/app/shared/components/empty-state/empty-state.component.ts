import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <div class="icon-wrapper">
        <span class="icon">{{ icon }}</span>
      </div>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
      <button *ngIf="actionText" (click)="action.emit()" class="action-btn">
        {{ actionText }}
      </button>
    </div>
  `,
  styles: [`
    .empty-state {
      padding: 60px 20px;
      text-align: center;
      background: white;
      border-radius: 20px;
      border: 2px dashed #e2e8f0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .icon-wrapper {
      width: 80px;
      height: 80px;
      background: #f8fafc;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      margin-bottom: 24px;
    }

    h2 {
      font-size: 1.5rem;
      color: #1e293b;
      margin-bottom: 8px;
    }

    p {
      color: #64748b;
      max-width: 320px;
      margin: 0 auto 30px;
    }

    .action-btn {
      padding: 12px 24px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .action-btn:hover {
      background: #2563eb;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon: string = '🔍';
  @Input() title: string = 'No items found';
  @Input() description: string = 'We couldn\'t find any records matching your request.';
  @Input() actionText: string = '';
  @Output() action = new EventEmitter<void>();
}
