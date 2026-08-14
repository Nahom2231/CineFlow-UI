import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';

@Component({
  selector: 'app-ticket-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ticket-confirmation.html',
  styleUrl: './ticket-confirmation.scss'
})
export class TicketConfirmation implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(CineFlowApiService);
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
  
  // QR Code
  qrCodeUrl: string = '';
  showQR: boolean = true;

  ngOnInit(): void {
    // Get ticket details from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state;
      this.ticketId = state['ticketId'];
      this.transactionReference = state['transactionReference'];
      this.movieTitle = state['movieTitle'];
      this.movieTitleAmharic = state['movieTitleAmharic'];
      this.seatNumber = state['seatNumber'];
      this.scheduleTime = state['scheduleTime'];
      this.cinemaHall = state['cinemaHall'];
      this.cinemaLocation = state['cinemaLocation'];
      this.ticketPrice = state['ticketPrice'];
      this.paymentProvider = state['paymentProvider'];
      this.bookingDateTime = state['bookingDateTime'];
      this.qrCodeUrl = state['qrCodeUrl'];
    }
  }

  // Download QR Code
  downloadQRCode(): void {
    const link = document.createElement('a');
    link.href = this.qrCodeUrl;
    link.download = `ticket-${this.ticketId}.png`;
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
