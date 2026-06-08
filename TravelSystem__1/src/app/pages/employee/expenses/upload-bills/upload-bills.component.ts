import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TravelRequest } from '../../../../shared/models/travel-request.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api-endpoints';

@Component({
  selector: 'app-upload-bills',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header">
        <div class="title-group">
          <h1>🧾 Upload Bills</h1>
          <p>Submit your expense receipts for approved trips.</p>
        </div>
      </div>

      <!-- Trip Dropdown Selector -->
      <div class="trip-dropdown-wrapper">
        <label class="dropdown-label">Select Approved Trip</label>
        <div class="custom-dropdown" (click)="dropdownOpen = !dropdownOpen" [class.open]="dropdownOpen">
          <div class="dropdown-display">
            <div class="selected-info" *ngIf="selectedTrip">
              <span class="selected-title">{{ selectedTrip.title }}</span>
              <span class="selected-meta">{{ selectedTrip.destination }} • {{ selectedTrip.startDate | date:'MMM y' }}</span>
            </div>
            <span class="placeholder" *ngIf="!selectedTrip">Choose a trip...</span>
            <span class="chevron" [class.rotated]="dropdownOpen">▾</span>
          </div>
          <div class="dropdown-menu" *ngIf="dropdownOpen">
            <div
              class="dropdown-item"
              *ngFor="let trip of approvedTrips$ | async"
              [class.active]="selectedTrip?.id === trip.id"
              (click)="selectTrip(trip, $event)"
            >
              <div class="item-info">
                <span class="item-title">{{ trip.title }}</span>
                <span class="item-meta">{{ trip.destination }} • {{ trip.startDate | date:'MMM y' }}</span>
              </div>
              <span class="check" *ngIf="selectedTrip?.id === trip.id">✓</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Upload Form -->
      <div class="upload-section">
        <div class="card" *ngIf="selectedTrip; else noSelection">
          <h3>Add Expense for {{ selectedTrip.title }}</h3>
          <div class="table-wrapper">
            <table class="expense-table">
              <thead>
                <tr>
                  <th class="col-sno">#</th>
                  <th class="col-category">Category</th>
                  <th class="col-amount">Amount (₹)</th>
                  <th class="col-description">Description</th>
                  <th class="col-receipt">Receipt</th>
                  <th class="col-action"></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of expenseRows; let i = index">
                  <td class="sno-cell">{{ i + 1 }}</td>
                  <td>
                    <select [(ngModel)]="row.category" [name]="'category_' + i" required>
                      <option value="" disabled>Select an option</option>
                      <option value="Travel">Travel</option>
                      <option value="Hotel">Hotel</option>
                      <option value="Meals">Meals</option>
                      <option value="Taxi">Taxi</option>
                      <option value="Other">Other</option>
                    </select>
                  </td>
                  <td>
                    <input type="number" [(ngModel)]="row.amount" [name]="'amount_' + i" placeholder="0.00" required>
                  </td>
                  <td>
                    <input type="text" [(ngModel)]="row.description" [name]="'desc_' + i" placeholder="What was this expense for?">
                  </td>
                  <td>
                    <div class="file-upload-mini">
                      <span>{{ row.fileName || 'Choose file...' }}</span>
                      <input type="file" class="file-input" (change)="onFileChange($event, i)">
                    </div>
                  </td>
                  <td>
                    <button type="button" class="remove-btn" *ngIf="expenseRows.length > 1" (click)="removeRow(i)" title="Remove row">×</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="table-actions">
            <button type="button" class="add-row-btn" (click)="addRow()">+ Add Row</button>
            <button type="button" class="submit-btn" [disabled]="!canSubmit" (click)="onSubmit($event)">Submit Expenses</button>
          </div>
        </div>
        <ng-template #noSelection>
          <div class="select-hint">
            <span class="icon">📋</span>
            <p>Please select an approved trip from the dropdown above to start uploading bills.</p>
          </div>
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
      margin-bottom: 24px;
      text-align: center;
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

    /* ── Dropdown Selector ── */
    .trip-dropdown-wrapper {
      margin-bottom: 28px;
      text-align: center;
    }

    .dropdown-label {
      display: block;
      font-size: 0.8125rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }

    .custom-dropdown {
      position: relative;
      width: 100%;
      max-width: 500px;
      margin: 0 auto;
      cursor: pointer;
      user-select: none;
      text-align: left;
    }

    .dropdown-display {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 18px;
      transition: all 0.2s;
    }

    .custom-dropdown.open .dropdown-display,
    .dropdown-display:hover {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .selected-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .selected-title {
      font-weight: 700;
      color: #1e293b;
      font-size: 0.9375rem;
    }

    .selected-meta {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 600;
    }

    .placeholder {
      color: #94a3b8;
      font-size: 0.9375rem;
    }

    .chevron {
      font-size: 1rem;
      color: #64748b;
      transition: transform 0.25s ease;
      margin-left: 12px;
      flex-shrink: 0;
    }

    .chevron.rotated {
      transform: rotate(180deg);
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.06);
      z-index: 50;
      overflow: hidden;
      animation: dropIn 0.2s ease-out;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      transition: all 0.15s;
    }

    .dropdown-item:hover {
      background: #f8fafc;
    }

    .dropdown-item.active {
      background: #eff6ff;
    }

    .dropdown-item + .dropdown-item {
      border-top: 1px solid #f1f5f9;
    }

    .item-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .item-title {
      font-weight: 700;
      color: #1e293b;
      font-size: 0.9375rem;
    }

    .item-meta {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 600;
    }

    .check {
      color: #3b82f6;
      font-weight: 800;
      font-size: 1rem;
    }

    /* ── Upload Section ── */
    .upload-section {
      margin-top: 4px;
    }

    .card {
      background: white;
      padding: 32px;
      border-radius: 20px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      border: 1px solid #f1f5f9;
    }

    .card h3 {
      font-size: 1.25rem;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 24px;
    }

    .table-wrapper {
      overflow-x: auto;
      margin-bottom: 20px;
    }

    .expense-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
    }

    .expense-table thead tr {
      background: #1e293b;
    }

    .expense-table th {
      padding: 14px 16px;
      font-size: 0.8125rem;
      font-weight: 700;
      color: white;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      text-align: left;
      white-space: nowrap;
    }

    .col-sno { width: 50px; }
    .col-category { width: 180px; }
    .col-amount { width: 140px; }
    .col-description { min-width: 200px; }
    .col-receipt { width: 180px; }
    .col-action { width: 50px; }

    .expense-table tbody tr {
      background: white;
      transition: background 0.15s;
    }

    .expense-table tbody tr:hover {
      background: #f8fafc;
    }

    .expense-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }

    .expense-table tbody tr:last-child td {
      border-bottom: none;
    }

    .sno-cell {
      font-weight: 700;
      color: #94a3b8;
      text-align: center;
    }

    .expense-table td select,
    .expense-table td input[type='number'],
    .expense-table td input[type='text'] {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.2s;
      background: white;
    }

    .expense-table td select:focus,
    .expense-table td input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    .file-upload-mini {
      position: relative;
      padding: 10px 12px;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      font-size: 0.8125rem;
      color: #94a3b8;
      cursor: pointer;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      transition: all 0.2s;
    }

    .file-upload-mini:hover {
      border-color: #3b82f6;
      color: #3b82f6;
    }

    .file-upload-mini .file-input {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      opacity: 0;
      cursor: pointer;
    }

    .remove-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: #fef2f2;
      color: #ef4444;
      font-size: 1.25rem;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }

    .remove-btn:hover {
      background: #fee2e2;
    }

    .table-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .add-row-btn {
      padding: 10px 20px;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .add-row-btn:hover {
      background: #e2e8f0;
    }


    .submit-btn {
      padding: 10px 24px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.875rem;
      cursor: pointer;
      margin-left: auto;
      transition: background 0.2s;
    }

    .submit-btn:hover:not(:disabled) {
      background: #2563eb;
    }

    .submit-btn:disabled {
      background: #94a3b8;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .select-hint {
      padding: 60px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      text-align: center;
      background: white;
      border-radius: 20px;
      border: 1px solid #f1f5f9;
    }

    .select-hint .icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes dropIn {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class UploadBillsComponent implements OnInit {
  approvedTrips$!: Observable<TravelRequest[]>;
  selectedTrip: TravelRequest | null = null;
  dropdownOpen = false;
  expenseRows: { category: string; amount: number | null; description: string; fileName: string; file: File | null }[] = [];

  private http = inject(HttpClient);

  ngOnInit(): void {
    this.approvedTrips$ = this.http.get<TravelRequest[]>(API_ENDPOINTS.TRAVEL_REQUESTS.APPROVED_TRIPS).pipe(
      map(trips => trips.filter((trip: any) => trip.status === 3 || trip.status === 'Approved'))
    );
    this.addRow();
  }

  selectTrip(trip: TravelRequest, event: Event) {
    event.stopPropagation();
    this.selectedTrip = trip;
    this.dropdownOpen = false;
  }

  addRow() {
    this.expenseRows.push({ category: '', amount: null, description: '', fileName: '', file: null });
  }

  removeRow(index: number) {
    this.expenseRows.splice(index, 1);
  }

  onFileChange(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.expenseRows[index].fileName = input.files[0].name;
      this.expenseRows[index].file = input.files[0];
    }
  }

  get canSubmit(): boolean {
    return this.expenseRows.length > 0 && this.expenseRows.every(row => row.fileName !== '');
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.canSubmit || !this.selectedTrip) return;

    const formData = new FormData();

    // ✅ PascalCase to match .NET model binder
    formData.append('TravelRequestId', this.selectedTrip.id.toString());

    let fileIndex = 0; // ✅ Track actual file position separately

    this.expenseRows.forEach((row, index) => {
      formData.append(`Expenses[${index}].Category`, row.category);
      formData.append(`Expenses[${index}].Amount`, row.amount?.toString() || '0');
      formData.append(`Expenses[${index}].Description`, row.description);

      if (row.file) {
        formData.append('receipts', row.file, row.file.name);
        formData.append(`Expenses[${index}].FileIndex`, fileIndex.toString()); // ✅ real index
        fileIndex++;
      }
    });

    this.http.post(API_ENDPOINTS.EXPENSES.UPLOAD, formData).subscribe({
      next: () => {
        alert('Expenses submitted successfully!');
        this.selectedTrip = null;
        this.expenseRows = [];
        this.addRow();
      },
      error: (err) => {
        console.error('Error uploading expenses', err);
        alert('Failed to upload expenses. Check console for details.');
      }
    });
  }
}
