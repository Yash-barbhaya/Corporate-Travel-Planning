import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = ''; // Clear previous error messages
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (user) => {
        // HTTP 200 OK means user object exists and authentication passed!
        this.isLoading = false;
        
        // ⚠️ Double check if your SQL database strings are lowercase or PascalCase!
        // If your DB holds "Employee", change these to match.
        const role = user.role?.toLowerCase(); 

        if (role === 'employee') {
          this.router.navigate(['/employee/dashboard']);
        } else if (role === 'manager') {
          this.router.navigate(['/manager/dashboard']);
        } else if (role === 'finance') {
          this.router.navigate(['/finance/dashboard']);
        } else if (role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.errorMessage = 'Unknown user role configuration.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        
        // Captures our custom .NET error string response: Unauthorized(new { message = "..." })
        if (err.status === 401) {
          this.errorMessage = err.error?.message || 'Invalid email or password.';
        } else {
          this.errorMessage = 'Unable to connect to the authentication server. Please try again later.';
        }
      }
    });
  }
}