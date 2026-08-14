import { Router} from '@angular/router';
import { Component,OnInit, OnDestroy, inject } from '@angular/core';
import {CommonModule } from '@angular/common';
import {FormsModule } from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {CineFlowApiService } from '../../../core/services/cineflow-api.service';


interface SeatRow {
  rowLabel: string;
  seats: string[];
}
@Component({
  selector: 'app-seat-picker',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './seat-picker.html',
  styleUrl: './seat-picker.scss',
})
export class SeatPicker implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(CineFlowApiService);

  scheduleId: string='';
  seatRows: SeatRow[] =[];
  occupiedSeats: string[] =[];

  selectedSeat: string | null =null;
  phoneNumber: string ='';
  paymentProvider: string='Telebirr';

  holdActive: boolean = false;
  timerSeconds: number=680; 
  timerInterval: any;

  constructor() {}
  ngOnInit(): void {
    this.scheduleId= this.route.snapshot.paramMap.get('scheduleId')|| '';
    this.generateDefaultGrid();
  }
  generateDefaultGrid():void {
    const rows= ['A', 'B','C', 'D','E'];
    this.seatRows= rows.map(r=>({
      rowLabel: r,
      seats: [1,2,3,4,5,6].map(num=> `${r}${num}`)
    }));
  }
  selectSeat(seat: string): void {
    if (this.holdActive && this.selectedSeat===seat)
      return;
    this.selectedSeat=seat;
    const userId= 'test-user-guid';

    this.apiService.holdSeat({
      scheduleId: this.scheduleId,
      seatNumber: seat,
      userId: userId,
      holdDurationMinutes: 10
    }).subscribe({
      next: ()=>{
        this.holdActive= true;
        this.startTimer();
      },
      error: (err)=> alert(err.error?.message|| 'Failed to hold seat.')
    });
    
  }
  confirmBooking(): void{
    if(!this.selectedSeat||!this.phoneNumber) return;

    const payload = {
      scheduleId: this.scheduleId,
      seatNumber: this.selectedSeat,
      paymentPhoneNumber: this.phoneNumber,
      paymentProvider: this.paymentProvider,
      userId: 'test-user-guid'
    };

    // Use the enhanced booking method that returns full ticket details
    this.apiService.bookTicketWithDetails(payload).subscribe({
      next: (res: any) => {
        this.clearTimer();
        // Navigate to ticket confirmation with ticket details
        this.router.navigate(['/ticket-confirmation'], {
          state: {
            ticketId: res.ticketId,
            transactionReference: res.transactionReference,
            movieTitle: res.movieTitle,
            movieTitleAmharic: res.movieTitleAmharic,
            seatNumber: res.seatNumber,
            scheduleTime: res.scheduleTime,
            cinemaHall: res.cinemaHall,
            cinemaLocation: res.cinemaLocation,
            ticketPrice: res.ticketPrice,
            paymentProvider: res.paymentProvider,
            bookingDateTime: res.bookingDateTime,
            qrCodeUrl: res.qrCodeUrl
          }
        });
      },
      error: (err) => alert(err.error?.message||'Booking failed.')
    });
  }
  startTimer(): void {
    this.timerSeconds = 680;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.timerInterval = setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds --;
      } else {
        this.clearTimer();
        alert('Seat hold expired!');
      }
    }, 1000);
  }

  clearTimer(): void {
    if (this.timerInterval)  clearInterval(this.timerInterval);
      this.holdActive = false;
      this.selectedSeat=null;
    }
   get formattedTimer(): string {
    const mins= Math.floor(this.timerSeconds / 60);
    const secs = this.timerSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
   }
      ngOnDestroy(): void {
        this.clearTimer();
      }
  }


