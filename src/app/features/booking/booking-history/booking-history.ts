import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';
import { AuthService } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification.service';

export interface BookingHistory {
  ticketId: string;
  movieTitle: string;
  movieTitleAmharic: string;
  seatNumber: string;
  scheduleTime: string;
  cinemaHall: string;
  cinemaLocation: string;
  bookingDate: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  qrCodeUrl?: string;
  price: number;
}

@Component({
  selector: 'app-booking-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './booking-history.html',
  styleUrl: './booking-history.scss'
})
export class BookingHistory implements OnInit {
  private apiService = inject(CineFlowApiService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  bookings: BookingHistory[] = [];
  loading: boolean = true;
  activeTab: 'upcoming' | 'completed' | 'all' = 'upcoming';

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get userEmail(): string | null {
    return this.authService.getUserEmail();
  }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    this.apiService.getUserBookings().subscribe({
      next: (data) => {
        this.bookings = data || [];
        this.loading = false;
      },
      error: () => {
        this.bookings = [];
        this.loading = false;
      }
    });
  }

  get filteredBookings(): BookingHistory[] {
    if (this.activeTab === 'all') {
      return this.bookings;
    }
    return this.bookings.filter(b => b.status === this.activeTab);
  }

  cancelBooking(booking: BookingHistory): void {
    // Optimistically update status
    booking.status = 'cancelled';
    this.notificationService.info(`Ticket pass #${booking.ticketId} has been cancelled.`, 'Booking Cancelled');

    this.apiService.cancelBooking(booking.ticketId).subscribe({
      next: () => {
        this.loadBookings();
      },
      error: () => {
        this.loadBookings();
      }
    });
  }

  downloadQR(booking: BookingHistory): void {
    const qrUrl = booking.qrCodeUrl || this.apiService.createSvgQrDataUri(booking.ticketId);
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `cineflow-ticket-${booking.ticketId}.svg`;
    link.click();
  }

  viewTicket(booking: BookingHistory): void {
    this.router.navigate(['/booking-details', booking.ticketId], {
      state: {
        ticketId: booking.ticketId,
        movieTitle: booking.movieTitle,
        movieTitleAmharic: booking.movieTitleAmharic,
        seatNumber: booking.seatNumber,
        scheduleTime: booking.scheduleTime,
        cinemaHall: booking.cinemaHall,
        cinemaLocation: booking.cinemaLocation,
        ticketPrice: booking.price,
        bookingDateTime: booking.bookingDate,
        qrCodeUrl: booking.qrCodeUrl
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'upcoming':
        return 'upcoming';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'upcoming';
    }
  }
}
