import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Trip {
  id: number;
  employeeName: string;
  destination: string;
  date: string;
}

@Component({
  selector: 'app-upcoming-trips',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="trips-card card">
      <div class="card-header">
        <h3>Upcoming Team Trips</h3>
      </div>
      
      <div class="trips-grid">
        @for (trip of trips; track trip.id) {
          <div class="trip-item">
            <div class="trip-info">
              <span class="name">{{ trip.employeeName }}</span>
              <span class="dest">{{ trip.destination }}</span>
            </div>
            <div class="trip-date">
              <span class="icon">📅</span>
              {{ trip.date }}
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .trips-card {
      padding: 24px;
      height: 100%;
    }

    .card-header h3 {
      font-size: 1.1rem;
      color: #1e293b;
      font-weight: 700;
      margin-bottom: 20px;
    }

    .trips-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .trip-item {
      background: #f8fafc;
      padding: 16px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      border: 1px solid #f1f5f9;
      transition: all 0.2s ease;
    }

    .trip-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      border-color: #e2e8f0;
    }

    .trip-info {
      display: flex;
      flex-direction: column;
    }

    .name {
      font-size: 0.95rem;
      font-weight: 700;
      color: #1e293b;
    }

    .dest {
      font-size: 0.8rem;
      color: #64748b;
      font-weight: 500;
    }

    .trip-date {
      font-size: 0.85rem;
      color: #3b82f6;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  `]
})
export class UpcomingTripsComponent {
  @Input() trips: Trip[] = [];
}
