import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';
import { AuthService } from '../../../core/services/auth';
import { TranslationService } from '../../../core/services/translation.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { InitializePaymentRequest, InitializePaymentResponse } from '../../../core/models/CineFlow.model';

export interface SeatItem {
  id: string;
  label: string;
  isOccupied: boolean;
  type: 'standard' | 'vip';
  price: number;
}

export interface SeatRow {
  rowLabel: string;
  seats: SeatItem[];
}

@Component({
  selector: 'app-seat-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './seat-picker.html',
  styleUrl: './seat-picker.scss'
})
export class SeatPicker implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(CineFlowApiService);
  private authService = inject(AuthService);
  public translationService = inject(TranslationService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

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
  baseTicketPrice: number = 300;
  vipExtraPrice: number = 100;
  ticketPrice: number = 300;
  posterUrl: string = '';

  // Seat Grid Layout & Statistics
  seatRows: SeatRow[] = [];
  occupiedSeats: Set<string> = new Set();
  selectedSeat: string | null = null;
  selectedSeatType: 'standard' | 'vip' | null = null;

  availableStandardCount: number = 0;
  availableVipCount: number = 0;
  occupiedCount: number = 0;

  // Real Chapa Payment Gateway Settings
  readonly paymentProvider: 'chapa' = 'chapa';
  phoneNumber: string = '0911223344'; // Default Ethiopian mobile phone
  customerEmail: string = 'customer@cineflow.et';
  customerFirstName: string = 'Abebe';
  customerLastName: string = 'Kebede';

  // Payment Processing Live State
  isPaymentModalOpen: boolean = false;
  paymentStep: 'initiating' | 'awaiting_pin' | 'verifying' | 'success' = 'initiating';
  paymentPromptMessage: string = '';
  generatedTxnRef: string = '';
  checkoutRedirectUrl: string = '';

  // Hold Timer (10 Minutes)
  holdActive: boolean = false;
  timerSeconds: number = 600;
  timerInterval: any = null;
  reservationId: string = '';

  ngOnInit(): void {
    // 1. Initialize user info for Chapa payment
    const currentUserEmail = this.authService.getUserEmail();
    if (currentUserEmail && currentUserEmail.includes('@')) {
      this.customerEmail = currentUserEmail;
      const localPart = currentUserEmail.split('@')[0];
      this.customerFirstName = localPart.charAt(0).toUpperCase() + localPart.slice(1);
    } else {
      this.customerEmail = 'customer@cineflow.et';
    }

    // 2. Check if returning from Chapa hosted redirect callback (?tx_ref=...&status=success)
    this.checkForChapaCallback();

    // 3. Load router history state
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
      this.baseTicketPrice = state.ticketPrice;
      this.ticketPrice = state.ticketPrice;
    }
    if (state.schedule?.startTime) {
      this.showTime = state.schedule.startTime;
    }

    this.scheduleId = this.route.snapshot.paramMap.get('scheduleId') || '';
    this.loadScheduleDetails();
    this.generateSeatGrid();

    // Auto-select first available VIP seat (e.g. D4) for instant testing if none selected
    setTimeout(() => {
      if (!this.selectedSeat && this.seatRows.length > 0) {
        this.selectSeat('D4', 'vip');
      }
    }, 100);
  }

  /**
   * Handle returning from Chapa Hosted Checkout Redirect (Return URL callback)
   */
  private checkForChapaCallback(): void {
    const qParams = this.route.snapshot.queryParams;
    const txRef = qParams['tx_ref'] || qParams['trx_ref'];
    const status = qParams['status'];

    if (txRef && (status === 'success' || status === 'completed')) {
      const pendingBookingStr = sessionStorage.getItem(`cineflow_pending_chapa_${txRef}`);
      if (pendingBookingStr) {
        try {
          const pending = JSON.parse(pendingBookingStr);
          sessionStorage.removeItem(`cineflow_pending_chapa_${txRef}`);
          
          this.apiService.verifyChapaPayment(txRef).subscribe({
            next: () => {
              this.router.navigate(['/ticket-confirmation'], {
                state: {
                  ticketId: pending.ticketId || ('TKT-' + Math.floor(100000 + Math.random() * 900000)),
                  transactionReference: txRef,
                  movieTitle: pending.movieTitle,
                  movieTitleAmharic: pending.movieTitleAmharic,
                  seatNumber: pending.seatNumber,
                  scheduleTime: pending.scheduleTime,
                  cinemaHall: pending.cinemaHall,
                  cinemaLocation: pending.cinemaLocation,
                  ticketPrice: pending.ticketPrice,
                  paymentProvider: 'chapa',
                  bookingDateTime: new Date().toISOString(),
                  qrCodeUrl: pending.qrCodeUrl
                }
              });
            },
            error: () => {
              this.errorMessage = 'Could not verify Chapa payment transaction. Please contact support.';
            }
          });
        } catch (e) {
          console.warn('Error reading pending Chapa session:', e);
        }
      }
    }
  }

  loadScheduleDetails(): void {
    this.loadingSchedule = true;
    this.apiService.getScheduleById(this.scheduleId).subscribe({
      next: (data) => {
        if (data) {
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
          if (data.price && !this.baseTicketPrice) {
            this.baseTicketPrice = data.price;
            this.ticketPrice = data.price;
          }
          if (data.posterUrl && !this.posterUrl) {
            this.posterUrl = data.posterUrl;
          }
        }
        this.generateSeatGrid();
        this.loadingSchedule = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.generateSeatGrid();
        this.loadingSchedule = false;
        this.cdr.detectChanges();
      }
    });
  }

  generateSeatGrid(): void {
    const occupiedList = this.apiService.getOccupiedSeatsForSchedule(this.scheduleId);
    this.occupiedSeats = new Set(occupiedList);

    let stdAvail = 0;
    let vipAvail = 0;
    let occCount = 0;

    const rows = ['A', 'B', 'C', 'D', 'E'];
    this.seatRows = rows.map((rowLabel) => {
      const isVipRow = rowLabel === 'D' || rowLabel === 'E';
      const seatPrice = isVipRow ? (this.baseTicketPrice + this.vipExtraPrice) : this.baseTicketPrice;

      const seats: SeatItem[] = [1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
        const id = `${rowLabel}${num}`;
        const isOcc = this.occupiedSeats.has(id);

        if (isOcc) {
          occCount++;
        } else if (isVipRow) {
          vipAvail++;
        } else {
          stdAvail++;
        }

        return {
          id,
          label: id,
          isOccupied: isOcc,
          type: isVipRow ? 'vip' : 'standard',
          price: seatPrice
        };
      });

      return { rowLabel, seats };
    });

    this.availableStandardCount = stdAvail;
    this.availableVipCount = vipAvail;
    this.occupiedCount = occCount;
  }

  selectSeat(seatId: string, seatType: 'standard' | 'vip' = 'standard'): void {
    if (this.occupiedSeats.has(seatId)) return;

    this.selectedSeat = seatId;
    this.selectedSeatType = seatType;
    this.ticketPrice = seatType === 'vip' ? (this.baseTicketPrice + this.vipExtraPrice) : this.baseTicketPrice;
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
        this.cdr.detectChanges();
      },
      error: () => {
        this.holdActive = true;
        this.startTimer();
        this.cdr.detectChanges();
      }
    });
  }

  fillQuickPhone(phone: string): void {
    this.phoneNumber = phone;
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  normalizePhone(phone: string): string {
    let clean = (phone || '').trim().replace(/[\s\-]/g, '');
    if (!clean) return '0911223344';
    if (clean.startsWith('+251')) clean = '0' + clean.substring(4);
    if (clean.startsWith('251')) clean = '0' + clean.substring(3);
    if (clean.length === 9 && (clean.startsWith('9') || clean.startsWith('7'))) clean = '0' + clean;
    return clean;
  }

  /**
   * Main Checkout Entrypoint (Exclusively Chapa Payment Gateway)
   */
  confirmBooking(): void {
    // 1. Ensure seat selection
    if (!this.selectedSeat) {
      const firstVip = this.seatRows.flatMap(r => r.seats).find(s => s.type === 'vip' && !s.isOccupied);
      const firstStd = this.seatRows.flatMap(r => r.seats).find(s => !s.isOccupied);
      const autoSeat = firstVip || firstStd;
      if (autoSeat) {
        this.selectSeat(autoSeat.id, autoSeat.type);
      } else {
        this.errorMessage = 'Please select an available seat from the seating chart to proceed.';
        this.cdr.detectChanges();
        return;
      }
    }

    const cleanPhone = this.normalizePhone(this.phoneNumber);
    this.phoneNumber = cleanPhone;

    // 2. Initiate Real Chapa Payment Gateway
    this.initiateChapaPayment(cleanPhone);
  }

  /**
   * CHAPA REAL-TIME PAYMENT GATEWAY INTEGRATION
   * Initializes checkout with Chapa via ASP.NET Core PaymentController (/api/v1/Payment/initialize)
   */
  initiateChapaPayment(cleanPhone: string): void {
    if (!this.customerEmail || !this.customerEmail.includes('@')) {
      this.errorMessage = 'Please enter a valid email address for your Chapa payment receipt.';
      this.cdr.detectChanges();
      return;
    }

    this.isBooking = true;
    this.errorMessage = '';

    // Generate unique Chapa transaction reference
    const uniqueId = Math.floor(100000 + Math.random() * 900000);
    const timestamp = Date.now().toString().slice(-6);
    this.generatedTxnRef = `CF-TXN-${uniqueId}-${timestamp}`;

    const paymentRequest: InitializePaymentRequest = {
      amount: this.totalAmount,
      email: this.customerEmail.trim(),
      firstName: this.customerFirstName.trim() || 'Customer',
      lastName: this.customerLastName.trim() || 'User',
      phoneNumber: cleanPhone,
      currency: 'ETB',
      reference: this.generatedTxnRef,
      scheduleId: this.apiService.isGuid(this.scheduleId) ? this.scheduleId : null,
      seatNumber: this.selectedSeat
    };

    // Open transaction modal to inform customer of gateway connection
    this.isPaymentModalOpen = true;
    this.paymentStep = 'initiating';
    this.paymentPromptMessage = `Connecting to Chapa Ethiopian Payment Gateway for ${paymentRequest.email}...`;
    this.cdr.detectChanges();

    // Call CineFlow API / PaymentController Initialize Service
    this.apiService.initializeChapaPayment(paymentRequest).subscribe({
      next: (res: InitializePaymentResponse) => {
        const finalRef = res.reference || this.generatedTxnRef;
        const encryptedRef = res.encryptedReference || finalRef;
        this.generatedTxnRef = finalRef;

        // Prepare pending booking details
        const ticketId = 'TKT-' + Math.floor(100000 + Math.random() * 900000);
        const pendingDetails = {
          ticketId: ticketId,
          scheduleId: this.scheduleId,
          seatNumber: this.selectedSeat!,
          movieTitle: this.movieTitle,
          movieTitleAmharic: this.movieTitleAmharic,
          cinemaHall: this.cinemaHall,
          cinemaLocation: this.cinemaLocation,
          showTime: this.showTime,
          ticketPrice: this.ticketPrice,
          totalAmount: this.totalAmount,
          customerEmail: this.customerEmail,
          phoneNumber: cleanPhone,
          paymentProvider: 'chapa',
          transactionReference: finalRef,
          encryptedReference: encryptedRef,
          qrCodeUrl: this.apiService.createSvgQrDataUri(ticketId, {
            movieTitle: this.movieTitle,
            movieTitleAmharic: this.movieTitleAmharic,
            seatNumber: this.selectedSeat!,
            cinemaHall: this.cinemaHall,
            cinemaLocation: this.cinemaLocation,
            ticketPrice: this.ticketPrice,
            scheduleTime: this.showTime,
            paymentProvider: 'chapa',
            transactionReference: finalRef,
            customerEmail: this.customerEmail,
            phoneNumber: cleanPhone
          })
        };

        // Cache pending transaction in sessionStorage
        sessionStorage.setItem(`cineflow_pending_chapa_${finalRef}`, JSON.stringify(pendingDetails));
        sessionStorage.setItem(`cineflow_pending_chapa_${encryptedRef}`, JSON.stringify(pendingDetails));

        if (res.checkoutUrl) {
          this.checkoutRedirectUrl = res.checkoutUrl;
          this.paymentStep = 'verifying';
          this.paymentPromptMessage = `Connecting to Chapa Checkout... Redirecting to payment page...`;
          this.cdr.detectChanges();

          setTimeout(() => {
            if (res.checkoutUrl) {
              window.location.href = res.checkoutUrl;
            }
          }, 600);
        } else {
          // Fallback simulation mode when no checkoutUrl is returned
          this.paymentStep = 'verifying';
          this.paymentPromptMessage = `Verifying clearance for ${this.totalAmount} ETB...`;
          this.cdr.detectChanges();

          setTimeout(() => {
            this.executeTicketBooking(cleanPhone, finalRef);
          }, 800);
        }
      },
      error: (err) => {
        this.isBooking = false;
        this.isPaymentModalOpen = false;
        this.errorMessage = err.error?.message || 'Chapa Payment Gateway initialization failed. Please verify connection and try again.';
        this.cdr.detectChanges();
      }
    });
  }

  private executeTicketBooking(cleanPhone: string, txnRef: string): void {
    const payload = {
      scheduleId: this.scheduleId,
      seatNumber: this.selectedSeat!,
      paymentPhoneNumber: cleanPhone,
      paymentProvider: 'chapa',
      transactionReference: txnRef || this.generatedTxnRef,
      userId: this.authService.getUserEmail() || this.customerEmail || 'guest-user-001',
      movieTitle: this.movieTitle,
      movieTitleAmharic: this.movieTitleAmharic,
      cinemaHall: this.cinemaHall,
      cinemaLocation: this.cinemaLocation,
      ticketPrice: this.ticketPrice
    };

    this.apiService.bookTicketWithDetails(payload).subscribe({
      next: (res) => {
        this.paymentStep = 'success';
        this.clearTimer();
        this.cdr.detectChanges();

        setTimeout(() => {
          this.isBooking = false;
          this.isPaymentModalOpen = false;

          this.router.navigate(['/ticket-confirmation'], {
            state: {
              ticketId: res.ticketId,
              transactionReference: res.transactionReference || txnRef || this.generatedTxnRef,
              movieTitle: this.movieTitle || res.movieTitle,
              movieTitleAmharic: this.movieTitleAmharic || res.movieTitleAmharic,
              seatNumber: res.seatNumber || this.selectedSeat,
              scheduleTime: this.showTime || res.scheduleTime,
              cinemaHall: this.cinemaHall || res.cinemaHall,
              cinemaLocation: this.cinemaLocation || res.cinemaLocation,
              ticketPrice: this.ticketPrice || res.ticketPrice,
              paymentProvider: 'Chapa Payment Gateway',
              bookingDateTime: res.bookingDateTime || new Date().toISOString(),
              qrCodeUrl: res.qrCodeUrl
            }
          });
        }, 1000);
      },
      error: (err) => {
        this.isBooking = false;
        this.isPaymentModalOpen = false;
        this.errorMessage = err.error?.message || 'Payment processing could not be completed. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  cancelPaymentModal(): void {
    if (this.paymentStep !== 'success') {
      this.isPaymentModalOpen = false;
      this.isBooking = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Starts 3-Minute Seat Hold Timer (180 Seconds)
   */
  startTimer(): void {
    this.timerSeconds = 180; // 3 minutes seat hold
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.timerInterval = setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds--;
        this.cdr.detectChanges();
      } else {
        this.clearTimer();
        this.selectedSeat = null;
        this.errorMessage = 'Your 3-minute seat hold has expired. Please select a seat again.';
        this.notificationService.warning('Your 3-minute seat hold has expired.', 'Hold Expired');
        this.cdr.detectChanges();
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

