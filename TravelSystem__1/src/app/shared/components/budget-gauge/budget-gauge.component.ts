import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-budget-gauge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gauge-card card">
      <div class="card-header">
        <h3>Team Travel Budget</h3>
        <span class="budget-label">{{ remaining | number:'1.0-0' }} / {{ total | number:'1.0-0' }}</span>
      </div>
      
      <div class="gauge-container">
        <svg viewBox="0 0 100 55" class="gauge">
          <!-- Background track -->
          <path d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                stroke="#e2e8f0" 
                stroke-width="8" 
                stroke-linecap="round"/>
          
          <!-- Colored progress -->
          <path d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                [attr.stroke]="gaugeColor" 
                stroke-width="8" 
                stroke-linecap="round"
                [style.stroke-dasharray]="dashArray"
                class="progress-path"/>
        </svg>
        
        <div class="gauge-content">
          <span class="percentage">{{ percentage }}%</span>
          <span class="remaining-text">Remaining</span>
        </div>
      </div>

      <div class="gauge-status" [style.color]="gaugeColor">
        <span class="dot" [style.background-color]="gaugeColor"></span>
        {{ statusText }}
      </div>
    </div>
  `,
  styles: [`
    .gauge-card {
      padding: 24px;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .card-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .card-header h3 {
      font-size: 1.1rem;
      color: #1e293b;
      font-weight: 700;
      margin: 0;
    }

    .budget-label {
      font-size: 0.875rem;
      color: #64748b;
      font-weight: 600;
    }

    .gauge-container {
      position: relative;
      width: 100%;
      max-width: 280px;
    }

    .gauge {
      width: 100%;
      height: auto;
    }

    .progress-path {
      transition: stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease;
    }

    .gauge-content {
      position: absolute;
      bottom: 10%;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      display: flex;
      flex-direction: column;
    }

    .percentage {
      font-size: 2rem;
      font-weight: 800;
      color: #1e293b;
      line-height: 1;
    }

    .remaining-text {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 4px;
    }

    .gauge-status {
      margin-top: 15px;
      font-weight: 700;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
  `]
})
export class BudgetGaugeComponent {
  @Input() total: number = 0;
  @Input() remaining: number = 0;

  get percentage(): number {
    if (this.total === 0) return 0;
    return Math.max(0, Math.round((this.remaining / this.total) * 100));
  }

  get gaugeColor(): string {
    const p = this.percentage;
    if (p >= 50) return '#10b981'; // Green
    if (p >= 20) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  }

  get statusText(): string {
    const p = this.percentage;
    if (p >= 50) return 'Budget Healthy';
    if (p >= 20) return 'Monitor Spending';
    return 'Critical Budget Level';
  }

  get dashArray(): string {
    // Circumference of semi-circle: PI * R (R=40) = ~125.6
    const circumference = 125.6;
    const offset = circumference - (this.percentage / 100) * circumference;
    return `${circumference - offset}, ${circumference}`;
  }
}
