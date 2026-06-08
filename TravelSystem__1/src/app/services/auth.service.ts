import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../shared/models/user.model';
import { API_ENDPOINTS } from '../core/constants/api-endpoints';
import { TokenStorageService } from '../core/services/token-storage.service';
import { environment } from '../../environments/environment';

// 1. Create interfaces matching our backend .NET Models project precisely
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  managerId: number | null;
  managerName?: string;
  token: string; // The backend JWT token string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Use modern Angular 18 functional injection
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private router = inject(Router);

  private apiUrl = `${environment.apiUrl}/auth/login`;

  // Explicit type safety: User or null
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Rehydrate user from storage on app load
    const savedUser = this.tokenStorage.getUser();
    if (savedUser) {
      this.currentUserSubject.next(savedUser);
    }
  }

  // ========================================
  // AUTH APIs
  // ========================================

  // Explicitly type the request/response instead of using 'any'
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, { email, password }).pipe(
      tap((response: LoginResponse) => {
        // Because the response itself IS the user object containing the token:
        if (response && response.token) {
          this.tokenStorage.saveToken(response.token);
          
          // Save the full root object as the user data
          const userObj = response as unknown as User;
          if (userObj.role) {
            userObj.role = userObj.role.toLowerCase() as any;
          }
          this.tokenStorage.saveUser(userObj);
          this.currentUserSubject.next(userObj);
        }
      })
    );
  }

  logout(): void {
    this.tokenStorage.signOut();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Public getter to grab current state synchronously
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.tokenStorage.getToken();
  }

  hasRole(role: string): boolean {
    // Uses optional chaining safely
    return this.currentUserValue?.role?.toLowerCase() === role?.toLowerCase();
  }
}