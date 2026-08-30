import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-ticket-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './ticket-confirmation.html',
  styleUrl: './ticket-confirmation.scss'
})
export class TicketConfirmation implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(CineFlowApiService);
  public translationService = inject(TranslationService);
  private router = inject(Router);

  // Ticket details
  ticketId: string = '';
  transactionReference: string = '';
  movieTitle: string = '';
  movieTitleAmharic: string = '';
  seatNumber: string = '';
  scheduleTime: string = '';
  cinemaHall: string = '';
  cinemaLocation: string = '';
  ticketPrice: number = 0;
  paymentProvider: string = '';
  bookingDateTime: string = '';
  qrCodeUrl: string = '';
  loading: boolean = false;

  ngOnInit(): void {
    // 1. Check if returning directly from Chapa redirect (?tx_ref=... or ?trx_ref=...)
    const qParams = this.route.snapshot.queryParams;
    const txRef = qParams['tx_ref'] || qParams['trx_ref'] || qParams['reference'];

    if (txRef) {
      this.loading = true;
      const pendingStr = sessionStorage.getItem(`cineflow_pending_chapa_${txRef}`);
      const pending = pendingStr ? JSON.parse(pendingStr) : null;

      this.apiService.verifyChapaPayment(txRef).subscribe({
        next: (verifyRes) => {
          this.ticketId = pending?.ticketId || ('TKT-' + Math.floor(100000 + Math.random() * 900000));
          this.transactionReference = verifyRes.reference || txRef;
          this.movieTitle = pending?.movieTitle || 'CineFlow Ticket';
          this.movieTitleAmharic = pending?.movieTitleAmharic || '';
          this.seatNumber = pending?.seatNumber || 'C4';
          this.scheduleTime = pending?.scheduleTime || new Date().toISOString();
          this.cinemaHall = pending?.cinemaHall || 'Grand Bole Screen';
          this.cinemaLocation = pending?.cinemaLocation || 'Bole, Addis Ababa';
          this.ticketPrice = pending?.ticketPrice || 300;
          this.paymentProvider = 'chapa';
          this.bookingDateTime = new Date().toISOString();
          this.qrCodeUrl = this.apiService.createSvgQrDataUri(this.ticketId);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
      return;
    }

    // 2. Retrieve state passed from SeatPicker router navigation
    const state = history.state || {};

    if (state && state['ticketId']) {
      this.ticketId = state['ticketId'];
      this.transactionReference = state['transactionReference'] || 'TXN-CF-CONFIRMED';
      this.movieTitle = state['movieTitle'] || 'CineFlow Ticket';
      this.movieTitleAmharic = state['movieTitleAmharic'] || '';
      this.seatNumber = state['seatNumber'] || 'C4';
      this.scheduleTime = state['scheduleTime'] || new Date().toISOString();
      this.cinemaHall = state['cinemaHall'] || 'Grand Bole Screen';
      this.cinemaLocation = state['cinemaLocation'] || 'Bole, Addis Ababa';
      this.ticketPrice = state['ticketPrice'] || 300;
      this.paymentProvider = state['paymentProvider'] || 'Telebirr';
      this.bookingDateTime = state['bookingDateTime'] || new Date().toISOString();
      this.qrCodeUrl = state['qrCodeUrl'] || this.apiService.createSvgQrDataUri(this.ticketId);
    } else {
      // 3. Check if opened via /booking-details/:ticketId route
      const routeTicketId = this.route.snapshot.paramMap.get('ticketId') || 'TKT-849201';
      this.loading = true;
      this.apiService.getBookingDetails(routeTicketId).subscribe({
        next: (data) => {
          this.ticketId = data.ticketId;
          this.transactionReference = data.transactionReference || 'TXN-CF-' + data.ticketId;
          this.movieTitle = data.movieTitle;
          this.movieTitleAmharic = data.movieTitleAmharic || '';
          this.seatNumber = data.seatNumber;
          this.scheduleTime = data.scheduleTime;
          this.cinemaHall = data.cinemaHall;
          this.cinemaLocation = data.cinemaLocation || 'Bole Medhanialem';
          this.ticketPrice = data.ticketPrice || data.price || 300;
          this.paymentProvider = data.paymentProvider || 'Telebirr';
          this.bookingDateTime = data.bookingDateTime || data.bookingDate || new Date().toISOString();
          this.qrCodeUrl = data.qrCodeUrl || this.apiService.createSvgQrDataUri(this.ticketId);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  // Download QR Code
  downloadQRCode(): void {
    const link = document.createElement('a');
    link.href = this.qrCodeUrl || this.apiService.createSvgQrDataUri(this.ticketId);
    link.download = `cineflow-ticket-${this.ticketId}.svg`;
    link.click();
  }

  // Print Ticket
  printTicket(): void {
    window.print();
  }

  // Navigate back to movies
  goToMovies(): void {
    this.router.navigate(['/movies']);
  }
}
