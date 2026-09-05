import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Login } from './login';

describe('Login', () => {
  let component: Login;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Login,
        provideHttpClient(),
        provideRouter([]),
        { provide: ChangeDetectorRef, useValue: { detectChanges: () => {} } }
      ]
    });
    component = TestBed.inject(Login);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have MAX_FAILED_ATTEMPTS set to 5', () => {
    expect(component.MAX_FAILED_ATTEMPTS).toBe(5);
  });

  it('should have LOCKOUT_DURATION_SECONDS set to 60', () => {
    expect(component.LOCKOUT_DURATION_SECONDS).toBe(60);
  });

  it('should toggle reset password mode on and off', () => {
    expect(component.isResetMode).toBe(false);
    component.email = 'test@example.com';
    component.toggleResetMode(true);
    expect(component.isResetMode).toBe(true);
    expect(component.resetEmail).toBe('test@example.com');

    component.toggleResetMode(false);
    expect(component.isResetMode).toBe(false);
  });

  it('should validate passwords before submitting reset', () => {
    component.isResetMode = true;
    component.resetEmail = 'user@example.com';
    component.resetNewPassword = '123';
    component.resetConfirmPassword = '123';

    component.onResetPassword();
    expect(component.resetMessage).toContain('at least 6 characters');

    component.resetNewPassword = 'Password123!';
    component.resetConfirmPassword = 'Password456!';
    component.onResetPassword();
    expect(component.resetMessage).toContain('Passwords do not match');
  });
});
