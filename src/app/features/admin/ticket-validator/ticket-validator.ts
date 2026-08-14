import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';
import { Html5Qrcode } from 'html5-qrcode';

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
          this.cdr.detectChanges(); // Force UI update immediately

          setTimeout(() => {
            this.router.navigate(['/catalog']);
          }, 1500);
        } else {
          this.isSuccess = false;
          this.message = responseMsg || 'Invalid ticket reference or already used.';
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Validation API Error:', err);
        this.isSuccess = false;
        this.message = err.error?.message || err.error?.Message || 'Invalid ticket reference or already used.';
        this.cdr.detectChanges();
      }
    });
  }
}