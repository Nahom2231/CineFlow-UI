import { Component } from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router, RouterLink } from '@angular/router';
import {AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email: string ='';
  password: string='';

  loading: boolean = false;
  errorMessage: string='';
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    if(!this.email||!this.password){
      this.errorMessage = 'Please enter both email and password';
      return;
    }
    this.loading=true;
    this.errorMessage= '';

    this.authService.login({email: this.email, password: this.password }).subscribe({
        next: () => {
          this.loading= false;
          this.router.navigate(['/movies']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.Error|| err.error?.message|| 'Invalid email or password.';
        }
    });
  }
}
