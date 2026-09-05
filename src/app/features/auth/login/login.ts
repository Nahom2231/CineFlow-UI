import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  email: string = '';
  password: string = '';

  loading: boolean = false;
  errorMessage: string = '';
  alertType: 'error' | 'warning' | 'lockout' | 'info' = 'error';

  // Reset Password State
  isResetMode: boolean = false;
  resetEmail: string = '';
  resetNewPassword: string = '';
  resetConfirmPassword: string = '';
  resetLoading: boolean = false;
  resetMessage: string = '';
  resetMessageType: 'error' | 'success' = 'error';
  showResetNewPassword: boolean = false;
  showResetConfirmPassword: boolean = false;

  // Security Lockout Configuration (5 failed attempts -> 60s rate limit)
  readonly MAX_FAILED_ATTEMPTS = 5;
  readonly LOCKOUT_DURATION_SECONDS = 60;

  failedAttempts: number = 0;
  isLockedOut: boolean = false;
  lockoutCountdown: number = 0;
  private lockoutInterval?: any;

  ngOnInit(): void {
    this.checkExistingLockout();
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'reset') {
        this.toggleResetMode(true);
      }
    });
    if (this.router.url.includes('reset-password')) {
      this.toggleResetMode(true);
    }
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
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/movies';
        this.router.navigateByUrl(returnUrl);
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
    const storedLock = this.getStorageItem('cineflow_lockout_' + key);
    
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
      const val = this.getStorageItem('cineflow_attempts_' + emailKey);
      return val ? parseInt(val, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }

  private saveFailedAttempts(email: string, count: number): void {
    try {
      const key = this.getStorageKey(email);
      this.setStorageItem('cineflow_attempts_' + key, count.toString());
    } catch (e) {
      console.warn('Could not save failed attempts:', e);
    }
  }

  private resetFailedAttempts(email: string): void {
    try {
      const key = this.getStorageKey(email);
      this.removeStorageItem('cineflow_attempts_' + key);
      this.failedAttempts = 0;
    } catch (e) {
      console.warn('Could not reset failed attempts:', e);
    }
  }

  private saveLockoutExpiry(email: string, timestamp: number): void {
    try {
      const key = this.getStorageKey(email);
      this.setStorageItem('cineflow_lockout_' + key, timestamp.toString());
    } catch (e) {
      console.warn('Could not save lockout timestamp:', e);
    }
  }

  private removeLockoutExpiry(email: string): void {
    try {
      const key = this.getStorageKey(email);
      this.removeStorageItem('cineflow_lockout_' + key);
    } catch (e) {
      console.warn('Could not remove lockout timestamp:', e);
    }
  }

  private getStorageItem(key: string): string | null {
    if (typeof localStorage === 'undefined' || !localStorage) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private setStorageItem(key: string, value: string): void {
    if (typeof localStorage === 'undefined' || !localStorage) return;
    try {
      localStorage.setItem(key, value);
    } catch {}
  }

  private removeStorageItem(key: string): void {
    if (typeof localStorage === 'undefined' || !localStorage) return;
    try {
      localStorage.removeItem(key);
    } catch {}
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

  toggleResetMode(enable?: boolean): void {
    this.isResetMode = enable !== undefined ? enable : !this.isResetMode;
    if (this.isResetMode) {
      this.resetEmail = this.email || '';
      this.resetNewPassword = '';
      this.resetConfirmPassword = '';
      this.resetMessage = '';
    } else {
      this.errorMessage = '';
      this.checkExistingLockout();
    }
    this.cdr.detectChanges();
  }

  toggleShowResetNewPassword(): void {
    this.showResetNewPassword = !this.showResetNewPassword;
  }

  toggleShowResetConfirmPassword(): void {
    this.showResetConfirmPassword = !this.showResetConfirmPassword;
  }

  onResetPassword(): void {
    const email = (this.resetEmail || '').trim().toLowerCase();
    const newPass = this.resetNewPassword || '';
    const confirmPass = this.resetConfirmPassword || '';

    if (!email) {
      this.resetMessageType = 'error';
      this.resetMessage = 'Please enter your registered email address.';
      return;
    }

    if (!this.isValidEmail(email)) {
      this.resetMessageType = 'error';
      this.resetMessage = 'Please enter a valid email address.';
      return;
    }

    if (!newPass) {
      this.resetMessageType = 'error';
      this.resetMessage = 'Please enter your new password.';
      return;
    }

    if (newPass.length < 6) {
      this.resetMessageType = 'error';
      this.resetMessage = 'New password must be at least 6 characters long.';
      return;
    }

    if (newPass !== confirmPass) {
      this.resetMessageType = 'error';
      this.resetMessage = 'Passwords do not match. Please re-enter matching passwords.';
      return;
    }

    this.resetLoading = true;
    this.resetMessage = '';

    this.authService.resetPassword({ email, newPassword: newPass }).subscribe({
      next: () => {
        this.resetLoading = false;
        this.resetMessageType = 'success';
        this.resetMessage = 'Password reset successfully! Redirecting to home page...';

        // Clear any security lockout and failed attempts for this email
        this.clearLockout(email);

        this.cdr.detectChanges();

        // Redirect user to home page / landing page
        setTimeout(() => {
          this.router.navigate(['/movies']);
        }, 800);
      },
      error: (err) => {
        this.resetLoading = false;
        this.resetMessageType = 'error';
        const serverMsg = err?.error?.message || err?.error?.Message || err?.message;
        this.resetMessage = serverMsg || 'Failed to reset password. Please check your email and try again.';
        this.cdr.detectChanges();
      }
    });
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
