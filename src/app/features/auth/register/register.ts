import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isSuccess: boolean = false;
  message: string = '';
  loading: boolean = false;

  // Password Requirement Helpers
  get hasMinLength(): boolean {
    return this.password.length >= 6;
  }

  get hasUpperCase(): boolean {
    return /[A-Z]/.test(this.password);
  }

  get hasLowerCase(): boolean {
    return /[a-z]/.test(this.password);
  }

  get hasNumber(): boolean {
    return /[0-9]/.test(this.password);
  }

  get hasSpecialChar(): boolean {
    return /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(this.password);
  }

  get isPasswordValid(): boolean {
    return this.hasMinLength && this.hasUpperCase && this.hasLowerCase && this.hasNumber && this.hasSpecialChar;
  }

  get passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }

  get isEmailTaken(): boolean {
    return this.message.toLowerCase().includes('already taken') || this.message.toLowerCase().includes('duplicate');
  }

  onRegister(): void {
    const cleanEmail = this.email.trim();
    if (!cleanEmail || !this.password) {
      this.isSuccess = false;
      this.message = 'Please fill out all required fields.';
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      this.isSuccess = false;
      this.message = 'Please enter a valid email address (e.g. user@cineflow.com).';
      return;
    }

    // Password validation (matches ASP.NET Core Identity standards)
    if (!this.isPasswordValid) {
      this.isSuccess = false;
      this.message = 'Please ensure your password meets all requirements (min 6 chars, uppercase, lowercase, digit, and special character).';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.isSuccess = false;
      this.message = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.message = '';

    this.authService.register({ email: cleanEmail, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        this.isSuccess = true;
        this.message = res?.message || 'Registration successful! Redirecting to login...';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.isSuccess = false;

        let errMsg = '';
        if (err.error?.errors) {
          // ASP.NET Core ValidationProblemDetails { errors: { Password: [...], Email: [...] } }
          const errList: string[] = [];
          for (const key of Object.keys(err.error.errors)) {
            const val = err.error.errors[key];
            if (Array.isArray(val)) {
              errList.push(...val);
            } else if (typeof val === 'string') {
              errList.push(val);
            }
          }
          errMsg = errList.join(' • ');
        } else if (Array.isArray(err.error)) {
          // ASP.NET IdentityError array [ { code, description } ]
          errMsg = err.error.map((e: any) => e.description || e.message || JSON.stringify(e)).join(' • ');
        } else if (err.error?.description) {
          errMsg = err.error.description;
        } else if (err.error?.message) {
          errMsg = err.error.message;
        } else if (err.error?.title) {
          errMsg = err.error.title;
        } else if (typeof err.error === 'string') {
          errMsg = err.error;
        } else {
          errMsg = 'Registration failed (HTTP 400). Please check that your email is unique or try signing in if you already have an account.';
        }
        this.message = errMsg;
        this.cdr.detectChanges();
      }
    });
  }
}
