import { Injectable } from '@angular/core';
import {HttpClient } from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {LoginRequest, RegisterRequest, AuthResponse} from '../models/CineFlow.model'

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly apiUrl= 'http://localhost:5066/api/v1/Auth';
    constructor (private http: HttpClient) {}
    register(credentials: RegisterRequest): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/register`, credentials);
    }
     login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response=>{
             if(response.token){
                localStorage.setItem('cineflow_token', response.token);
             }
            })

            
        );
     }
     logout(): void {
        localStorage.removeItem('cineflow_token');
     }
     getToken(): string | null {
        return localStorage.getItem('cineflow_token');
     }
     isLoggedIn(): boolean {
        return !!this.getToken();
     }
}
