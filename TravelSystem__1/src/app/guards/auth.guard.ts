import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    let expectedRole = route.data['role'];
    let currRoute = route;
    while (!expectedRole && currRoute.parent) {
      currRoute = currRoute.parent;
      expectedRole = currRoute.data['role'];
    }
    
    // If no specific role is required, or the user has the required role
    if (!expectedRole || authService.hasRole(expectedRole)) {
      return true;
    }

    // If user doesn't have the required role, redirect to their home page
    const userRole = authService.currentUserValue?.role;
    router.navigate([`/${userRole}/dashboard`]);
    return false;
  }

  // Not logged in, redirect to login page
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
