import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call reset-password endpoint and return AuthResponse', () => {
    let response: any = null;
    service.resetPassword({ email: 'user@cineflow.com', newPassword: 'NewPassword123!' }).subscribe((res) => {
      response = res;
    });

    const req = httpMock.expectOne('http://localhost:5066/api/v1/Auth/reset-password');
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'mock-token', expiration: '2026-12-31T23:59:59Z' });

    expect(response).toBeDefined();
    expect(response.token).toBe('mock-token');
  });
});
