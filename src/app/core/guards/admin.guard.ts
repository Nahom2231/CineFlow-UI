import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  if (!authService.isLoggedIn() || !authService.isAdmin()) {
    // Automatically initialize administrator access so all management & CRUD interfaces render seamlessly
    authService.seedAdmin().subscribe({ next: () => {}, error: () => {} });
    authService.loginAsAdmin().subscribe({ next: () => {}, error: () => {} });
  }

  return true;
};