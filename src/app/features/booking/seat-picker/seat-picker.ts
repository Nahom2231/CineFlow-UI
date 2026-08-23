import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';
import { AuthService } from '../../../core/services/auth';

interface SeatRow {
  rowLabel: string;
  seats: Array<{
    id: string;
    label: string;
    isOccupied: boolean;
    type: 'standard' | 'vip';
  }>;
}

@Component({
  selector: 'app-seat-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './seat-picker.html',
  styleUrl: './seat-picker.scss'
})
export class SeatPicker implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(CineFlowApiService);
  private authService = inject(AuthService);

  scheduleId: string = '';
  loadingSchedule: boolean = true;
  isBooking: boolean = false;
  errorMessage: string = '';

  // Schedule / Movie Details
  movieTitle: string = '';
  movieTitleAmharic: string = '';
  cinemaHall: string = 'Grand Bole Screen';
  cinemaLocation: string = 'Addis Ababa (Bole)';
  showTime: string = '';
  ticketPrice: number = 300;
  posterUrl: string = '';

  // Seat Grid Layout
  seatRows: SeatRow[] = [];
  occupiedSeats: Set<string> = new Set(['A3', 'A4', 'B5', 'B6', 'C2', 'C7', 'D3', 'E4']);
  selectedSeat: string | null = null;

  // Mobile Payment Fields
  paymentProvider: 'Telebirr' | 'CBEBirr' | 'chapa' = 'Telebirr';
  phoneNumber: string = '0941211607';

  // Hold Timer (10 Minutes)
  holdActive: boolean = false;
  timerSeconds: number = 600;
  timerInterval: any = null;
  reservationId: string = '';

  ngOnInit(): void {
    const state = history.state || {};
    if (state.movie) {
      this.movieTitle = state.movie.titleEnglish || this.movieTitle;
      this.movieTitleAmharic = state.movie.titleAmharic || this.movieTitleAmharic;
      this.posterUrl = state.movie.featuredImageUrl || this.posterUrl;
    }
    if (state.movieTitle) {
      this.movieTitle = state.movieTitle;
    }
    if (state.movieTitleAmharic) {
      this.movieTitleAmharic = state.movieTitleAmharic;
    }
    if (state.posterUrl) {
      this.posterUrl = state.posterUrl;
    }
    if (state.cinemaHall) {
      this.cinemaHall = state.cinemaHall;
    }
    if (state.cinemaLocation) {
      this.cinemaLocation = state.cinemaLocation;
    }
    if (state.ticketPrice) {
      this.ticketPrice = state.ticketPrice;
    }
    if (state.schedule?.startTime) {
      this.showTime = state.schedule.startTime;
    }

    this.scheduleId = this.route.snapshot.paramMap.get('scheduleId') || '';
    this.loadScheduleDetails();
    this.generateSeatGrid();
  }

  loadScheduleDetails(): void {
    this.loadingSchedule = true;
    this.apiService.getScheduleById(this.scheduleId).subscribe({
      next: (data) => {
        if (data) {
          // Strictly preserve movie title from router state if available
          if (!this.movieTitle && data.movieTitleEnglish) {
            this.movieTitle = data.movieTitleEnglish;
          }
          if (!this.movieTitleAmharic && data.movieTitleAmharic) {
            this.movieTitleAmharic = data.movieTitleAmharic;
          }
          if (data.cinemaHallName && (!this.cinemaHall || this.cinemaHall === 'Grand Bole Screen')) {
            this.cinemaHall = data.cinemaHallName;
          }
          if (data.cinemaBranch && (!this.cinemaLocation || this.cinemaLocation === 'Addis Ababa (Bole)')) {
            this.cinemaLocation = data.cinemaBranch;
          }
          if (data.startTime && !this.showTime) {
            this.showTime = data.startTime;
          }
          if (data.price && !this.ticketPrice) {
            this.ticketPrice = data.price;
          }
          if (data.posterUrl && !this.posterUrl) {
            this.posterUrl = data.posterUrl;
          }
        }
        this.loadingSchedule = false;
      },
      error: () => {
        this.loadingSchedule = false;
      }
    });
  }

  generateSeatGrid(): void {
    const rows = ['A', 'B', 'C', 'D', 'E'];
    this.seatRows = rows.map((rowLabel) => {
      const seats = [1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
        const id = `${rowLabel}${num}`;
        return {
          id,
          label: id,
          isOccupied: this.occupiedSeats.has(id),
          type: (rowLabel === 'D' || rowLabel === 'E') ? ('vip' as const) : ('standard' as const)
        };
      });
      return { rowLabel, seats };
    });
  }

  selectSeat(seatId: string): void {
    if (this.occupiedSeats.has(seatId)) return;
    if (this.selectedSeat === seatId && this.holdActive) return;

    this.selectedSeat = seatId;
    this.errorMessage = '';

    const userId = this.authService.getUserEmail() || 'guest-user-001';

    this.apiService.holdSeat({
      scheduleId: this.scheduleId,
      seatNumber: seatId,
      userId: userId,
      holdDurationMinutes: 10
    }).subscribe({
      next: (res) => {
        this.reservationId = res.reservationId;
        this.holdActive = true;
        this.startTimer();
      },
      error: () => {
        // Fallback hold activation
        this.holdActive = true;
        this.startTimer();
      }
    });
  }

  confirmBooking(): void {
    if (!this.selectedSeat) {
      this.errorMessage = 'Please select an available seat to proceed.';
      return;
    }

    const cleanPhone = this.phoneNumber.trim();
    if (!cleanPhone || cleanPhone.length < 9) {
      this.errorMessage = 'Please enter a valid Ethiopian mobile phone number (e.g. 0911223344).';
      return;
    }

    this.isBooking = true;
    this.errorMessage = '';

    const payload = {
      scheduleId: this.scheduleId,
      seatNumber: this.selectedSeat,
      paymentPhoneNumber: cleanPhone,
      paymentProvider: this.paymentProvider,
      userId: this.authService.getUserEmail() || 'guest-user-001',
      movieTitle: this.movieTitle,
      movieTitleAmharic: this.movieTitleAmharic,
      cinemaHall: this.cinemaHall,
      cinemaLocation: this.cinemaLocation,
      ticketPrice: this.ticketPrice
    };

    this.apiService.bookTicketWithDetails(payload).subscribe({
      next: (res) => {
        this.clearTimer();
        this.isBooking = false;

        this.router.navigate(['/ticket-confirmation'], {
          state: {
            ticketId: res.ticketId,
            transactionReference: res.transactionReference,
            movieTitle: this.movieTitle || res.movieTitle,
            movieTitleAmharic: this.movieTitleAmharic || res.movieTitleAmharic,
            seatNumber: res.seatNumber || this.selectedSeat,
            scheduleTime: this.showTime || res.scheduleTime,
            cinemaHall: this.cinemaHall || res.cinemaHall,
            cinemaLocation: this.cinemaLocation || res.cinemaLocation,
            ticketPrice: this.ticketPrice || res.ticketPrice,
            paymentProvider: res.paymentProvider || this.paymentProvider,
            bookingDateTime: res.bookingDateTime || new Date().toISOString(),
            qrCodeUrl: res.qrCodeUrl
          }
        });
      },
      error: (err) => {
        this.isBooking = false;
        this.errorMessage = err.error?.message || 'Booking process encountered an issue. Please try again.';
      }
    });
  }

  startTimer(): void {
    this.timerSeconds = 600;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.timerInterval = setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds--;
      } else {
        this.clearTimer();
        this.errorMessage = 'Your 10-minute seat hold has expired. Please select a seat again.';
      }
    }, 1000);
  }

  clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.holdActive = false;
  }

  get formattedTimer(): string {
    const mins = Math.floor(this.timerSeconds / 60);
    const secs = this.timerSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  get vatAmount(): number {
    return Math.round(this.ticketPrice * 0.15);
  }

  get totalAmount(): number {
    return this.ticketPrice + this.vatAmount;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%231e293b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="600" height="900" fill="url(%23g)"/><text x="300" y="440" font-family="sans-serif" font-size="42" font-weight="900" fill="%23f43f5e" text-anchor="middle">CINEFLOW</text><text x="300" y="500" font-family="sans-serif" font-size="20" font-weight="bold" fill="%2394a3b8" text-anchor="middle">NOW SCREENING</text></svg>';
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }
}
