import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';
import { Html5Qrcode } from 'html5-qrcode';

export interface ValidatedTicket {
  ticketId: string;
  movieTitle: string;
  movieTitleAmharic: string;
  customerName: string;
  seatNumber: string;
  cinemaHall: string;
  cinemaLocation: string;
  scheduleTime: string;
  ticketPrice: number;
  validatedAt?: string;
  validatedBy?: string;
}

@Component({
  selector: 'app-ticket-validator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-validator.html',
  styleUrls: ['./ticket-validator.scss']
})
export class TicketValidator implements OnDestroy {
  private html5QrCode?: Html5Qrcode;
  txnRef: string = '';
  message: string = '';
  isSuccess: boolean = false;
  isProcessingFile: boolean = false;
  validatedTicket: ValidatedTicket | null = null;
  validationHistory: ValidatedTicket[] = [];

  constructor(
    private apiService: CineFlowApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.isProcessingFile = true;
    this.message = 'Scanning image...';

    if (!this.html5QrCode) {
      this.html5QrCode = new Html5Qrcode('qr-reader-temp');
    }

    try {
      const decodedText = await this.html5QrCode.scanFile(file, true);
      this.txnRef = decodedText;
      this.isProcessingFile = false;
      this.validate();
    } catch (err) {
      this.isProcessingFile = false;
      this.isSuccess = false;
      this.message = 'Could not detect a valid QR code in the uploaded image.';
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    if (this.html5QrCode) {
      this.html5QrCode.clear();
    }
  }

  validate(): void {
    if (!this.txnRef.trim()) return;

    let cleanRef = this.txnRef.trim();
    let urlMovieTitle = '';
    let urlMovieTitleAmharic = '';
    let urlSeatNumber = '';
    let urlCinemaHall = '';
    let urlCinemaLocation = '';
    let urlScheduleTime = '';
    let urlTicketPrice = 300;

    // Parse URL if scanned QR code contains full booking-details URL
    if (cleanRef.includes('/booking-details/')) {
      try {
        const urlObj = new URL(cleanRef.startsWith('http') ? cleanRef : `http://${cleanRef}`);
        const pathParts = urlObj.pathname.split('/booking-details/');
        if (pathParts.length > 1) {
          cleanRef = decodeURIComponent(pathParts[1].split('/')[0].split('?')[0]);
        }
        urlMovieTitle = urlObj.searchParams.get('m') || '';
        urlMovieTitleAmharic = urlObj.searchParams.get('am') || '';
        urlSeatNumber = urlObj.searchParams.get('s') || '';
        urlCinemaHall = urlObj.searchParams.get('h') || '';
        urlCinemaLocation = urlObj.searchParams.get('loc') || '';
        urlScheduleTime = urlObj.searchParams.get('t') || '';
        if (urlObj.searchParams.get('p')) {
          urlTicketPrice = Number(urlObj.searchParams.get('p')) || 300;
        }
      } catch {
        const match = cleanRef.match(/booking-details\/([^\/?#]+)/);
        if (match) cleanRef = match[1];
      }
    } else {
      cleanRef = cleanRef.replace(/^https?:\/\//, '').trim();
    }

    this.apiService.validateTicket({ transactionReference: cleanRef, codeOrReference: cleanRef }).subscribe({
      next: (res: any) => {
        console.log('API Response Payload:', res);

        // Flexible response checking for Success / success / boolean
        const isOk = res === true || res?.success === true || res?.Success === true || res?.isValid === true;
        const responseMsg = res?.message || res?.Message;

        if (isOk) {
          this.isSuccess = true;
          this.message = responseMsg || 'Ticket verified! Customer allowed entry!';
          
          let formattedTime = res?.scheduleTime || urlScheduleTime || 'N/A';
          if (formattedTime && formattedTime !== 'N/A' && !isNaN(new Date(formattedTime).getTime())) {
            formattedTime = new Date(formattedTime).toLocaleString();
          }

          // Capture ticket details
          this.validatedTicket = {
            ticketId: res?.ticketId || cleanRef,
            movieTitle: res?.movieTitle || urlMovieTitle || 'CineFlow Ticket',
            movieTitleAmharic: res?.movieTitleAmharic || urlMovieTitleAmharic || '',
            customerName: res?.customerName || 'Verified Customer',
            seatNumber: res?.seatNumber || urlSeatNumber || 'A1',
            cinemaHall: res?.cinemaHall || urlCinemaHall || 'Grand Bole Screen (Dolby Atmos)',
            cinemaLocation: res?.cinemaLocation || urlCinemaLocation || 'Addis Ababa (Bole)',
            scheduleTime: formattedTime,
            ticketPrice: res?.ticketPrice || urlTicketPrice || 300,
            validatedAt: new Date().toLocaleTimeString(),
            validatedBy: localStorage.getItem('staffName') || 'Staff Member'
          };

          // Add to history
          this.validationHistory.unshift(this.validatedTicket);

          // Limit history to last 10 validations
          if (this.validationHistory.length > 10) {
            this.validationHistory.pop();
          }

          this.cdr.detectChanges(); // Force UI update immediately

          setTimeout(() => {
            this.resetForm();
          }, 4000);
        } else {
          this.isSuccess = false;
          this.message = responseMsg || 'Invalid ticket reference or already used.';
          this.validatedTicket = null;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Validation API Error:', err);
        this.isSuccess = false;
        this.message = err.error?.message || err.error?.Message || 'Invalid ticket reference or already used.';
        this.validatedTicket = null;
        this.cdr.detectChanges();
      }
    });
  }

  resetForm(): void {
    this.txnRef = '';
    this.message = '';
    this.isSuccess = false;
    this.validatedTicket = null;
  }
}