import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timeline-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stepper">
      <div class="step" *ngFor="let step of steps; let i = index" 
           [class.active]="i === currentStep && rejectedStep === -1" 
           [class.completed]="i < currentStep && i !== rejectedStep"
           [class.rejected]="i === rejectedStep">
        <div class="step-circle">
          <span *ngIf="i < currentStep && i !== rejectedStep">✓</span>
          <span *ngIf="i === rejectedStep">✕</span>
          <span *ngIf="i >= currentStep && i !== rejectedStep">{{ i + 1 }}</span>
        </div>
        <div class="step-label">{{ step }}</div>
        <div class="step-line" *ngIf="i < steps.length - 1"></div>
      </div>
    </div>
  `,
  styles: [`
    .stepper {
      display: flex;
      justify-content: space-between;
      margin: 40px 0;
      position: relative;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      position: relative;
      z-index: 1;
    }

    .step-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f1f5f9;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      border: 2px solid #e2e8f0;
      transition: all 0.3s;
    }

    .step.active .step-circle {
      background: #eff6ff;
      color: #3b82f6;
      border-color: #3b82f6;
    }

    .step.completed .step-circle {
      background: #22c55e;
      color: white;
      border-color: #22c55e;
    }

    .step.rejected .step-circle {
      background: #ef4444;
      color: white;
      border-color: #ef4444;
    }

    .step-label {
      margin-top: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #94a3b8;
      text-align: center;
    }

    .step.active .step-label {
      color: #3b82f6;
    }

    .step.completed .step-label {
      color: #22c55e;
    }

    .step.rejected .step-label {
      color: #ef4444;
    }

    .step-line {
      position: absolute;
      top: 16px;
      left: 50%;
      width: 100%;
      height: 2px;
      background: #e2e8f0;
      z-index: -1;
    }

    .step.completed .step-line {
      background: #22c55e;
    }
  `]
})
export class TimelineStepperComponent {
  @Input() steps: string[] = ['Manager', 'Finance', 'Approved'];
  @Input() currentStep: number = 0;
  @Input() rejectedStep: number = -1;
}
