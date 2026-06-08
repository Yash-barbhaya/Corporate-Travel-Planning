import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card" [style.border-left-color]="color">
      <div class="icon-wrapper" [style.background-color]="color + '15'" [style.color]="color">
        <span class="icon">{{ icon }}</span>
      </div>
      <div class="content">
        <span class="label">{{ label }}</span>
        <h3 class="value">{{ value }}</h3>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: var(--color-surface-card);
      padding: 24px;
      border-radius: 12px;
      border: 1px solid var(--color-border-subtle);
      border-left: 4px solid transparent;
      display: flex;
      align-items: center;
      gap: 20px;
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: default;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
      border-color: var(--color-teal-action);
    }

    .icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .content {
      display: flex;
      flex-direction: column;
    }

    .label {
      font-size: 0.875rem;
      color: var(--color-text-muted);
      font-weight: 600;
    }

    .value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text-main);
      margin: 4px 0 0 0;
    }
  `]
})
export class StatCardComponent {
  @Input() label: string = '';
  @Input() value: string | number = '';
  @Input() icon: string = '';
  @Input() color: string = '#3b82f6';
}
