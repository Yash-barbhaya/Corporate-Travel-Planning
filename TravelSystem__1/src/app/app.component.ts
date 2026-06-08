import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AuthService } from './services/auth.service';
import { TravelRequestService } from './shared/services/travel-request.service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, FormsModule, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  isSidebarCollapsed = true;
  showProfileDropdown = false;
  searchTerm = '';

  constructor(
    public authService: AuthService,
    public travelRequestService: TravelRequestService,
    private router: Router
  ) {}

  get isLoginPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/';
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  get firstName(): string {
    return this.authService.currentUserValue?.name?.split(' ')[0] || 'User';
  }

  get subText(): string {
    const role = this.authService.currentUserValue?.role;
    return role === 'manager' 
      ? 'Review and manage your team\'s travel requests.' 
      : 'Ready for your next trip?';
  }

  onSearchChange(term: string): void {
    this.travelRequestService.setSearchTerm(term);
  }

  toggleSidebar(pinned: boolean) {
    this.isSidebarCollapsed = !pinned;
  }

  toggleProfileDropdown(event: Event) {
    event.stopPropagation();
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  closeProfileDropdown() {
    this.showProfileDropdown = false;
  }

  logout() {
    this.showProfileDropdown = false;
    this.authService.logout();
  }
}
