import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        {
          provide: Router,
          useValue: {
            navigate: vi.fn()
          }
        }
      ]
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should allow navigation if user is logged in', () => {
    vi.spyOn(authService, 'isLoggedIn').mockReturnValue(true);

    const mockRoute = {} as ActivatedRouteSnapshot;
    const mockState = { url: '/booking-history' } as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));
    expect(result).toBe(true);
  });

  it('should redirect to /auth/login if user is not logged in', () => {
    vi.spyOn(authService, 'isLoggedIn').mockReturnValue(false);

    const mockRoute = {} as ActivatedRouteSnapshot;
    const mockState = { url: '/booking-history' } as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/booking-history' }
    });
  });
});
