import { Component } from '@angular/core';
import {CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router, RouterLink } from '@angular/router';
import {AuthService} from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})

export class Register {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isSuccess: boolean = false;
  message: string = '';
  loading: boolean = false;

constructor(
  private authService: AuthService,
  private router : Router
){}
onRegister(): void {
  if(!this.email||!this.password){
    this.isSuccess = false;
    this.message = 'Please fill out all required fields.';
    return;

  }
  if(this.password != this.confirmPassword) {
    this.isSuccess = false;
    this.message= 'Passwords do not match.';
    return;
  }
  this.loading = true;
  this.message = '';

  this.authService.register({ email: this.email, password: this.password}).subscribe({
    next: (res)=> {
      this.loading = false;
      this.isSuccess = true;
      this.message=  'Registration successful! Redirecting to login...';
      setTimeout(() => this.router.navigate(['/auth/login']), 1500);
    },
    error: (err)=> {
      this.loading = false;
      this.isSuccess = false;

      if(Array.isArray(err.error)){
        this.message = err.error.map((e: any)=> e.description).join(' ');
      }else if (err.error?.description) {
        this.message = err.error.description;
      }else if (err.error?.message){
        this.message= err.error.message;
      }else{

      this.message ='Registration failed. Please check your details.';
      }
    }
  });
}
}
