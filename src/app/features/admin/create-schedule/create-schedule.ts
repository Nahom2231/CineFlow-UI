import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';
import { AuthService } from '../../../core/services/auth';
import { MovieResponseDto } from '../../../core/models/CineFlow.model';

@Component({
  selector: 'app-create-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-schedule.html',
  styleUrls: ['./create-schedule.scss']
})
export class CreateSchedule implements OnInit {
  private apiService = inject(CineFlowApiService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  movies: MovieResponseDto[] = [];
  cinemaHalls: any[] = [];
  showtimeInput: string = '';
  loading: boolean = false;
  adminLoginLoading: boolean = false;
  message: string = '';
  isSuccess: boolean = false;

  schedule = {
    movieId: '',
    cinemaHallId: '',
    ticketPrice: 300
  };

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get userEmail(): string | null {
    return this.authService.getUserEmail();
  }

  ngOnInit(): void {
    // Set default showtime to tomorrow 18:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);
    this.showtimeInput = tomorrow.toISOString().slice(0, 16);

    this.loadData();
  }

  loadData(): void {
    this.apiService.getFilteredMovies({}).subscribe({
      next: (data) => {
        this.movies = data || [];
        if (this.movies.length > 0 && !this.schedule.movieId) {
          this.schedule.movieId = this.movies[0].id;
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load movies:', err)
    });

    this.apiService.getCinemaHalls().subscribe({
      next: (data) => {
        this.cinemaHalls = data && data.length > 0 ? data : [
          { id: '11111111-aaaa-1111-aaaa-111111111111', hallName: 'Grand Bole Screen (Dolby Atmos)', branchName: 'Bole Medhanialem', totalCapacity: 36 },
          { id: '22222222-bbbb-2222-bbbb-222222222222', hallName: 'IMAX Laser Bole', branchName: 'Bole', totalCapacity: 40 },
          { id: '33333333-cccc-3333-cccc-333333333333', hallName: 'Edna Mall VIP Lounge', branchName: 'Edna Mall', totalCapacity: 24 }
        ];
        if (this.cinemaHalls.length > 0 && !this.schedule.cinemaHallId) {
          const first = this.cinemaHalls[0];
          this.schedule.cinemaHallId = first.id || first.cinemaHallId;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.cinemaHalls = [
          { id: '11111111-aaaa-1111-aaaa-111111111111', hallName: 'Grand Bole Screen (Dolby Atmos)', branchName: 'Bole Medhanialem', totalCapacity: 36 },
          { id: '22222222-bbbb-2222-bbbb-222222222222', hallName: 'IMAX Laser Bole', branchName: 'Bole', totalCapacity: 40 },
          { id: '33333333-cccc-3333-cccc-333333333333', hallName: 'Edna Mall VIP Lounge', branchName: 'Edna Mall', totalCapacity: 24 }
        ];
        this.schedule.cinemaHallId = this.cinemaHalls[0].id;
        this.cdr.detectChanges();
      }
    });
  }

  getHallDisplayName(hall: any): string {
    if (!hall) return 'Cinema Hall';
    const name = hall.hallName || hall.name || hall.cinemaHallName || hall.title || 'Screen Hall';
    const branch = hall.branchName || hall.branch || hall.location || hall.cinemaBranch || '';
    const capacity = hall.totalCapacity || hall.capacity;
    const capStr = capacity ? ` (${capacity} Seats)` : '';
    return `${name}${branch ? ' – ' + branch : ''}${capStr}`;
  }

  getSelectedHall(): any {
    if (!this.schedule.cinemaHallId) return null;
    const targetId = String(this.schedule.cinemaHallId).toLowerCase().trim();
    return this.cinemaHalls.find(h => {
      const hId = String(h.id || h.cinemaHallId || '').toLowerCase().trim();
      return hId === targetId;
    });
  }

  getSelectedHallDisplayName(): string {
    const hall = this.getSelectedHall();
    return hall ? this.getHallDisplayName(hall) : 'Grand Bole Screen (Dolby Atmos)';
  }

  getSelectedMovie(): MovieResponseDto | undefined {
    return this.movies.find(m => m.id === this.schedule.movieId);
  }

  quickAdminLogin(): void {
    this.adminLoginLoading = true;
    this.authService.loginAsAdmin().subscribe({
      next: () => {
        this.adminLoginLoading = false;
        this.isSuccess = true;
        this.message = '✓ Signed in as Administrator! You can now publish schedules.';
        this.loadData();
      },
      error: () => {
        this.adminLoginLoading = false;
        this.authService.seedAdmin().subscribe(() => {
          this.authService.loginAsAdmin().subscribe({
            next: () => {
              this.isSuccess = true;
              this.message = '✓ Administrator session activated!';
              this.loadData();
            },
            error: () => {
              this.isSuccess = false;
              this.message = 'Please sign in with your Admin credentials on the Login page.';
            }
          });
        });
      }
    });
  }

  onSubmit(): void {
    if (!this.schedule.movieId || !this.schedule.cinemaHallId || !this.showtimeInput) {
      this.isSuccess = false;
      this.message = 'Please fill out all fields.';
      return;
    }

    const parsedDate = new Date(this.showtimeInput);
    if (isNaN(parsedDate.getTime())) {
      this.isSuccess = false;
      this.message = 'Please enter a valid date and time.';
      return;
    }

    this.loading = true;
    this.message = '';

    const payload = {
      movieId: this.schedule.movieId,
      cinemaHallId: this.schedule.cinemaHallId,
      showtime: parsedDate.toISOString(),
      ticketPrice: Number(this.schedule.ticketPrice)
    };

    this.apiService.createSchedule(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.isSuccess = true;
        this.message = res?.message || '🎉 Schedule created successfully! Screening is now active.';
        setTimeout(() => {
          this.router.navigate(['/movie', this.schedule.movieId], {
            state: { movie: this.getSelectedMovie() }
          });
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.isSuccess = false;
        this.message = err.error?.message || 'Schedule creation failed. Please ensure you are logged in as Admin.';
      }
    });
  }
}