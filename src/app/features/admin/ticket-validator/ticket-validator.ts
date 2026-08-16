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

    // Clean URL prefixes or whitespace
    const cleanRef = this.txnRef.replace('https://', '').trim();

    this.apiService.validateTicket({ transactionReference: cleanRef }).subscribe({
      next: (res: any) => {
        console.log('API Response Payload:', res);

        // Flexible response checking for Success / success / boolean
        const isOk = res === true || res?.success === true || res?.Success === true || res?.isValid === true;
        const responseMsg = res?.message || res?.Message;

        if (isOk) {
          this.isSuccess = true;
          this.message = responseMsg || 'Ticket verified! Customer allowed entry!';
          
          // Capture ticket details
          this.validatedTicket = {
            ticketId: res?.ticketId || cleanRef,
            movieTitle: res?.movieTitle || 'N/A',
            movieTitleAmharic: res?.movieTitleAmharic || 'N/A',
            customerName: res?.customerName || 'Guest',
            seatNumber: res?.seatNumber || 'N/A',
            cinemaHall: res?.cinemaHall || 'N/A',
            cinemaLocation: res?.cinemaLocation || 'N/A',
            scheduleTime: res?.scheduleTime || 'N/A',
            ticketPrice: res?.ticketPrice || 0,
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