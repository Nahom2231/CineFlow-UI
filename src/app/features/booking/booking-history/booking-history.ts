import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';

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
  private router = inject(Router);

  bookings: BookingHistory[] = [];
  loading: boolean = true;
  activeTab: 'upcoming' | 'completed' | 'all' = 'upcoming';

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.apiService.getUserBookings().subscribe({
      next: (data) => {
        this.bookings = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load bookings', err);
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

  downloadQR(booking: BookingHistory): void {
    if (booking.qrCodeUrl) {
      const link = document.createElement('a');
      link.href = booking.qrCodeUrl;
      link.download = `ticket-${booking.ticketId}.png`;
      link.click();
    }
  }

  viewTicket(booking: BookingHistory): void {
    this.router.navigate(['/booking-details', booking.ticketId]);
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
