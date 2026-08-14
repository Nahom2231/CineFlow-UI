import {Injectable} from '@angular/core';
import {HttpClient, HttpParams } from '@angular/common/http';
import {Observable } from 'rxjs';
import {
    MovieResponseDto,
    MovieFilterParams,
    CreateScheduleCommand,
    BookTicketCommand,
    HoldSeatCommand,
    ValidateTicketCommand
} from '../models/CineFlow.model';

@Injectable({
    providedIn: 'root'
})
export class CineFlowApiService{
    private readonly baseUrl = 'http://localhost:5066/api/v1';

    constructor(private http: HttpClient){}

    getDirectors(): Observable<Array<{ id: string; name: string }>> {
  return this.http.get<Array<{ id: string; name: string }>>(`${this.baseUrl}/directors`);
}

    getFilteredMovies(filters: MovieFilterParams): Observable<MovieResponseDto[]> {
        let params = new HttpParams();
        if(filters.searchTitle) params = params.set('searchTitle', filters.searchTitle);
        if(filters.genre) params = params.set('genre', filters.genre);
        if(filters.audioLanguage) params = params.set('audioLanguage', filters.audioLanguage);
        if(filters.cinemaBranch) params= params.set('cinemaBranch', filters.cinemaBranch);

        return this.http.get<MovieResponseDto[]>(`${this.baseUrl}/Movies`, {params });

    }
    createMovie(formData: FormData): Observable<string> {
        return this.http.post<string>(`${this.baseUrl}/Movies`, formData);
    }
    createSchedule(command: CreateScheduleCommand): Observable<{scheduleId: string; message: string}> {
        return this.http.post<{scheduleId: string; message: string}>(`${this.baseUrl}/Schedules`, command);
    }

    holdSeat(command: HoldSeatCommand): Observable<{reservationId: string; message: string}> {
        return this.http.post<{reservationId: string; message: string}>(`${this.baseUrl}/Tickets/hold`, command);
    }

    bookTicket(command: BookTicketCommand): Observable<{ticketId: string; message: string}> {
        return this.http.post<{ticketId: string; message: string}>(`${this.baseUrl}/Tickets/book`, command);
    }

    validateTicket(command: ValidateTicketCommand): Observable<{success: boolean; message?: string}> {
        return this.http.post<{success: boolean; message: string}>(`${this.baseUrl}/Tickets/validate`, command);
    }
   getCinemaHalls(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/CinemaHall`);
}

    // Get a single movie by ID
    getMovieById(movieId: string): Observable<MovieResponseDto> {
        return this.http.get<MovieResponseDto>(`${this.baseUrl}/Movies/${movieId}`);
    }

    // Get user's booking history
    getUserBookings(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/Tickets/my-bookings`);
    }

    // Get booking details by ticket ID
    getBookingDetails(ticketId: string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Tickets/${ticketId}`);
    }

    // Generate QR code for a ticket
    generateQRCode(ticketId: string): Observable<{qrCodeUrl: string}> {
        return this.http.get<{qrCodeUrl: string}>(`${this.baseUrl}/Tickets/${ticketId}/qrcode`);
    }

    // Enhanced bookTicket method to return full ticket details
    bookTicketWithDetails(command: BookTicketCommand): Observable<{
        ticketId: string;
        transactionReference: string;
        movieTitle: string;
        movieTitleAmharic: string;
        seatNumber: string;
        scheduleTime: string;
        cinemaHall: string;
        cinemaLocation: string;
        ticketPrice: number;
        paymentProvider: string;
        bookingDateTime: string;
        qrCodeUrl: string;
        message: string;
    }> {
        return this.http.post<any>(`${this.baseUrl}/Tickets/book-with-details`, command);
    }
}