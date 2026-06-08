import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../shared/models/user.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  currentUser: User | null = null;
  @Input() role: string = 'employee';
  @Input() isCollapsed: boolean = true;
  isPinned: boolean = false;

  activeSubMenu: string | null = null;

  @Output() toggle = new EventEmitter<boolean>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // In a real app we'd subscribe to user$ from MockDataService
    // For now keeping existing auth logic for compatibility
    const user = localStorage.getItem('loggedUser');
    if (user) {
      this.currentUser = JSON.parse(user);
    } else {
      this.currentUser = this.authService.currentUserValue;
    }
    
    if (this.currentUser?.role) {
      const lowerRole = this.currentUser.role.toLowerCase();
      if (lowerRole === 'manager') this.role = 'manager';
      else if (lowerRole === 'finance') this.role = 'finance';
      else if (lowerRole === 'admin') this.role = 'admin';
      else this.role = 'employee';
    }

    this.isPinned = !this.isCollapsed;
  }

  togglePin(): void {
    this.isPinned = !this.isPinned;
    this.toggle.emit(this.isPinned);
  }

  toggleSubMenu(menu: string): void {
    if (this.activeSubMenu === menu) {
      this.activeSubMenu = null;
    } else {
      this.activeSubMenu = menu;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
