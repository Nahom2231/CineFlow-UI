import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';
import { TranslationService } from '../../../core/services/translation.service';
import { NotificationService } from '../../../core/services/notification.service';
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
  private notificationService = inject(NotificationService);
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
  ticketPrice: number = 300;
  paymentProvider: string = 'Chapa Payment Gateway';
  bookingDateTime: string = '';
  qrCodeUrl: string = '';
  customerEmail: string = '';
  customerPhone: string = '';
  loading: boolean = false;

  get seatTier(): string {
    if (this.seatNumber && (this.seatNumber.startsWith('D') || this.seatNumber.startsWith('E'))) {
      return '👑 VIP Recliner';
    }
    return '💺 Standard Seat';
  }

  get vatAmount(): number {
    return Math.round(this.ticketPrice * 0.15);
  }

  get totalAmountPaid(): number {
    return this.ticketPrice + this.vatAmount;
  }

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
          this.paymentProvider = 'Chapa Payment Gateway';
          this.customerEmail = pending?.customerEmail || 'customer@cineflow.et';
          this.customerPhone = pending?.phoneNumber || '0911223344';
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
      this.paymentProvider = state['paymentProvider'] || 'Chapa Payment Gateway';
      this.customerEmail = state['customerEmail'] || 'customer@cineflow.et';
      this.customerPhone = state['phoneNumber'] || state['customerPhone'] || '0911223344';
      this.bookingDateTime = state['bookingDateTime'] || new Date().toISOString();
      this.qrCodeUrl = state['qrCodeUrl'] || this.apiService.createSvgQrDataUri(this.ticketId);
    } else {
      // 3. Fallback for /booking-details/:ticketId route
      const routeTicketId = this.route.snapshot.paramMap.get('ticketId') || 'TKT-849201';
      this.loading = true;
      this.apiService.getBookingDetails(routeTicketId).subscribe({
        next: (data) => {
          this.ticketId = data.ticketId || routeTicketId;
          this.transactionReference = data.transactionReference || 'TXN-CF-' + routeTicketId;
          this.movieTitle = data.movieTitle || 'CineFlow Ticket';
          this.movieTitleAmharic = data.movieTitleAmharic || '';
          this.seatNumber = data.seatNumber || 'D4';
          this.scheduleTime = data.scheduleTime || new Date().toISOString();
          this.cinemaHall = data.cinemaHall || 'Grand Bole Screen';
          this.cinemaLocation = data.cinemaLocation || 'Addis Ababa (Bole)';
          this.ticketPrice = data.ticketPrice || data.price || 300;
          this.paymentProvider = data.paymentProvider || 'Chapa Payment Gateway';
          this.customerEmail = data.customerEmail || 'customer@cineflow.et';
          this.customerPhone = data.phoneNumber || '0911223344';
          this.bookingDateTime = data.bookingDateTime || data.bookingDate || new Date().toISOString();
          this.qrCodeUrl = data.qrCodeUrl || this.apiService.createSvgQrDataUri(this.ticketId);
          this.loading = false;
        },
        error: () => {
          this.ticketId = routeTicketId;
          this.transactionReference = 'TXN-CF-' + routeTicketId;
          this.movieTitle = 'fugitive';
          this.movieTitleAmharic = 'ፊዩጂቲቭ';
          this.seatNumber = 'D4';
          this.cinemaHall = 'Grand Bole Screen (Dolby Atmos)';
          this.cinemaLocation = 'Addis Ababa (Bole)';
          this.ticketPrice = 300;
          this.paymentProvider = 'Chapa Payment Gateway';
          this.scheduleTime = new Date().toISOString();
          this.bookingDateTime = new Date().toISOString();
          this.qrCodeUrl = this.apiService.createSvgQrDataUri(this.ticketId);
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
    this.notificationService.success('QR Code Pass downloaded successfully', 'Ticket Saved');
  }

  // Copy Reference Code
  copyReferenceCode(): void {
    const code = this.transactionReference || this.ticketId;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        this.notificationService.success(this.translationService.t('PASS_COPIED', 'Ticket Reference Copied!'), 'Clipboard');
      });
    } else {
      this.notificationService.info(`Ref Code: ${code}`, 'Ticket Reference');
    }
  }

  // Share Pass
  sharePass(): void {
    if (navigator.share) {
      navigator.share({
        title: `CineFlow Digital Pass - ${this.movieTitle}`,
        text: `My admission pass for ${this.movieTitle} at ${this.cinemaHall}, Seat ${this.seatNumber}. Ref: ${this.ticketId}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      this.copyReferenceCode();
    }
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
