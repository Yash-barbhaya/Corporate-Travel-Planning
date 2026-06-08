import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../shared/models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container" *ngIf="user$ | async as user">
      <div class="header">
        <h1>⚙️ Profile & Settings</h1>
        <p>Manage your account information and system preferences.</p>
      </div>

      <div class="profile-grid">
        <!-- USER CARD -->
        <div class="card user-card">
          <div class="avatar-large">{{ user.name ? user.name[0] : 'U' }}</div>
          <div class="user-meta">
            <h2>{{ user.name }}</h2>
            <span class="role">{{ user.role | uppercase }}</span>
          </div>
          <button class="upload-btn">Change Photo</button>
        </div>

        <!-- SETTINGS FORM -->
        <div class="card settings-card">
          <h3>Personal Information</h3>
          <form (submit)="onSave($event)">
            <div class="form-grid">
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" [value]="user.name" readonly>
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" [value]="user.email" readonly>
              </div>
              <div class="form-group">
                <label>Department</label>
                <input type="text" [value]="user.department" readonly>
              </div>
              <div class="form-group">
                <label>Employee ID</label>
                <input type="text" [value]="'EMP-' + user.id" readonly>
              </div>
            </div>

            <div class="divider"></div>

            <h3>Security</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>New Password</label>
                <input type="password" placeholder="••••••••">
              </div>
              <div class="form-group">
                <label>Confirm Password</label>
                <input type="password" placeholder="••••••••">
              </div>
            </div>

            <button type="submit" class="save-btn">Save Changes</button>
          </form>
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

    .header h1 {
      font-size: 1.875rem;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .header p {
      color: #64748b;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 32px;
    }

    @media (max-width: 900px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: white;
      padding: 32px;
      border-radius: 20px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      border: 1px solid #f1f5f9;
    }

    .user-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 20px;
      height: fit-content;
    }

    .avatar-large {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      border-radius: 50%;
      color: white;
      font-size: 48px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
    }

    .user-meta h2 {
      margin: 0;
      color: #1e293b;
      font-size: 1.5rem;
      font-weight: 800;
    }

    .role {
      font-size: 0.75rem;
      font-weight: 800;
      color: #3b82f6;
      background: #eff6ff;
      padding: 4px 12px;
      border-radius: 20px;
    }

    .upload-btn {
      padding: 10px 20px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-weight: 700;
      color: #1e293b;
      cursor: pointer;
      transition: all 0.2s;
    }

    .upload-btn:hover {
      background: #f8fafc;
      border-color: #3b82f6;
    }

    .settings-card h3 {
      font-size: 1.125rem;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 24px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .form-group {
      margin-bottom: 12px;
    }

    .form-group label {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    input {
      width: 100%;
      padding: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.9375rem;
      color: #1e293b;
      outline: none;
      transition: all 0.2s;
    }

    input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    input[readonly] {
      background: #f8fafc;
      cursor: not-allowed;
    }

    .divider {
      height: 1px;
      background: #f1f5f9;
      margin: 32px 0;
    }

    .save-btn {
      margin-top: 24px;
      padding: 14px 32px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
    }

    .save-btn:hover {
      background: #2563eb;
      transform: translateY(-2px);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ProfileComponent implements OnInit {
  user$!: Observable<User | null>;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user$ = this.authService.currentUser$;
  }

  onSave(event: Event) {
    event.preventDefault();
    alert('Settings functionality to be implemented!');
  }
}
