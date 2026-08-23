import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  email: string = '';
  password: string = '';

  loading: boolean = false;
  errorMessage: string = '';
  alertType: 'error' | 'warning' | 'lockout' | 'info' = 'error';

  // Security Lockout Configuration (5 failed attempts -> 60s rate limit)
  readonly MAX_FAILED_ATTEMPTS = 5;
  readonly LOCKOUT_DURATION_SECONDS = 60;

  failedAttempts: number = 0;
  isLockedOut: boolean = false;
  lockoutCountdown: number = 0;
  private lockoutInterval?: any;

  ngOnInit(): void {
    this.checkExistingLockout();
  }

  ngOnDestroy(): void {
    if (this.lockoutInterval) {
      clearInterval(this.lockoutInterval);
    }
  }

  onEmailChange(): void {
    this.checkExistingLockout();
  }

  onLogin(): void {
    if (this.isLockedOut) {
      this.errorMessage = `Account is locked. Please wait ${this.lockoutCountdown} seconds before attempting again.`;
      this.alertType = 'lockout';
      return;
    }

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both your email address and password.';
      this.alertType = 'error';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const attemptEmail = this.email.trim().toLowerCase();

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.resetFailedAttempts(attemptEmail);
        this.router.navigate(['/movies']);
      },
      error: (err) => {
        this.loading = false;
        this.handleFailedLogin(attemptEmail, err);
      }
    });
  }

  private handleFailedLogin(email: string, err: any): void {
    const errorBody = err?.error || {};
    const isServerLockout = err?.status === 429 || errorBody?.isLockedOut || errorBody?.IsLockedOut;
    const serverRemainingSeconds = errorBody?.remainingSeconds || errorBody?.RemainingSeconds;
    const serverFailedAttempts = errorBody?.failedAttempts || errorBody?.FailedAttempts;

    if (isServerLockout) {
      const duration = typeof serverRemainingSeconds === 'number' && serverRemainingSeconds > 0 
        ? serverRemainingSeconds 
        : this.LOCKOUT_DURATION_SECONDS;
      this.activateLockout(email, duration);
      return;
    }

    this.failedAttempts = typeof serverFailedAttempts === 'number' 
      ? serverFailedAttempts 
      : this.failedAttempts + 1;
    this.saveFailedAttempts(email, this.failedAttempts);

    if (this.failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
      this.activateLockout(email, this.LOCKOUT_DURATION_SECONDS);
    } else {
      const remaining = typeof errorBody?.remainingAttempts === 'number' 
        ? errorBody.remainingAttempts 
        : (this.MAX_FAILED_ATTEMPTS - this.failedAttempts);
      const serverMsg = errorBody?.message || errorBody?.Message || errorBody?.Error;
      
      this.alertType = 'warning';
      this.errorMessage = serverMsg 
        ? `${serverMsg}`
        : `Invalid email or password. Warning: ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before account lockout.`;
    }
    this.cdr.detectChanges();
  }

  private activateLockout(email: string, durationSeconds: number): void {
    this.isLockedOut = true;
    this.lockoutCountdown = durationSeconds;
    this.alertType = 'lockout';
    this.errorMessage = `Security Lockout: Too many failed password attempts. Access temporarily locked for ${this.lockoutCountdown}s.`;

    const lockUntil = Date.now() + durationSeconds * 1000;
    this.saveLockoutExpiry(email, lockUntil);

    if (this.lockoutInterval) {
      clearInterval(this.lockoutInterval);
    }

    this.lockoutInterval = setInterval(() => {
      this.lockoutCountdown--;
      if (this.lockoutCountdown <= 0) {
        this.clearLockout(email);
      } else {
        this.errorMessage = `Security Lockout: Too many failed password attempts. Access temporarily locked for ${this.lockoutCountdown}s.`;
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  private clearLockout(email: string): void {
    if (this.lockoutInterval) {
      clearInterval(this.lockoutInterval);
      this.lockoutInterval = undefined;
    }
    this.isLockedOut = false;
    this.lockoutCountdown = 0;
    this.failedAttempts = 0;
    this.removeLockoutExpiry(email);
    this.resetFailedAttempts(email);
    this.alertType = 'info';
    this.errorMessage = 'Lockout expired. You may now sign in with your credentials.';
    this.cdr.detectChanges();
  }

  private checkExistingLockout(): void {
    const key = this.getStorageKey(this.email);
    const storedLock = localStorage.getItem('cineflow_lockout_' + key);
    
    if (storedLock) {
      const lockUntil = parseInt(storedLock, 10);
      const now = Date.now();
      if (lockUntil > now) {
        const remaining = Math.ceil((lockUntil - now) / 1000);
        this.activateLockout(key, remaining);
        return;
      } else {
        this.removeLockoutExpiry(key);
      }
    }

    this.failedAttempts = this.getSavedFailedAttempts(key);
    this.isLockedOut = false;
  }

  private getStorageKey(email: string): string {
    return email && email.trim() ? email.trim().toLowerCase() : 'anonymous_client';
  }

  private getSavedFailedAttempts(emailKey: string): number {
    try {
      const val = localStorage.getItem('cineflow_attempts_' + emailKey);
      return val ? parseInt(val, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }

  private saveFailedAttempts(email: string, count: number): void {
    try {
      const key = this.getStorageKey(email);
      localStorage.setItem('cineflow_attempts_' + key, count.toString());
    } catch (e) {
      console.warn('Could not save failed attempts:', e);
    }
  }

  private resetFailedAttempts(email: string): void {
    try {
      const key = this.getStorageKey(email);
      localStorage.removeItem('cineflow_attempts_' + key);
      this.failedAttempts = 0;
    } catch (e) {
      console.warn('Could not reset failed attempts:', e);
    }
  }

  private saveLockoutExpiry(email: string, timestamp: number): void {
    try {
      const key = this.getStorageKey(email);
      localStorage.setItem('cineflow_lockout_' + key, timestamp.toString());
    } catch (e) {
      console.warn('Could not save lockout timestamp:', e);
    }
  }

  private removeLockoutExpiry(email: string): void {
    try {
      const key = this.getStorageKey(email);
      localStorage.removeItem('cineflow_lockout_' + key);
    } catch (e) {
      console.warn('Could not remove lockout timestamp:', e);
    }
  }

  useDemoCustomer(): void {
    if (this.isLockedOut) return;
    this.email = 'customer@cineflow.com';
    this.password = 'Password123!';
    this.errorMessage = '';
    this.onLogin();
  }

  useDemoAdmin(): void {
    if (this.isLockedOut) return;
    this.email = 'admin@cineflow.com';
    this.password = 'AddisAbaba2026!';
    this.errorMessage = '';
    this.onLogin();
  }
}
