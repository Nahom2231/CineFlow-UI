import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, finalize, Subscription } from 'rxjs';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';
import { MovieResponseDto } from '../../../core/models/CineFlow.model';
import { NotificationService } from '../../../core/services/notification.service';

export interface DashboardStats {
  totalTicketsSold: number;
  totalRevenue: number;
  todayRevenue: number;
  upcomingShowsCount: number;
  mostPopularMovie: string;
  averageTicketPrice: number;
  todayTickets: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  ticketsSold: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit, OnDestroy {
  private apiService = inject(CineFlowApiService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);
  private moviesSub?: Subscription;

  stats: DashboardStats = {
    totalTicketsSold: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    upcomingShowsCount: 0,
    mostPopularMovie: '',
    averageTicketPrice: 0,
    todayTickets: 0
  };

  weeklyRevenue: RevenueData[] = [];
  topMovies: Array<{ name: string; ticketsSold: number; revenue: number }> = [];
  moviesList: MovieResponseDto[] = [];
  loading: boolean = true;
  deletingMovieId: string | null = null;

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadMovies();

    this.moviesSub = this.apiService.moviesUpdated$.subscribe(() => {
      this.loadMovies();
      this.loadDashboardStats();
    });
  }

  ngOnDestroy(): void {
    this.moviesSub?.unsubscribe();
  }

  loadMovies(): void {
    this.apiService.getFilteredMovies({}).subscribe({
      next: (data) => {
        this.moviesList = data || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.moviesList = this.apiService.getAllLocalMovies();
        this.cdr.detectChanges();
      }
    });
  }

  loadDashboardStats(): void {
    this.loading = true;

    forkJoin({
      stats: this.apiService.getDashboardStats(),
      revenue: this.apiService.getWeeklyRevenue(),
      movies: this.apiService.getTopMovies()
    })
    .pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (res: any) => {
        if (res.stats) {
          const s = res.stats;
          this.stats = {
            totalTicketsSold: s.totalTicketsSold ?? s.TotalTicketsSold ?? 0,
            totalRevenue: s.totalRevenue ?? s.TotalRevenue ?? 0,
            todayRevenue: s.todayRevenue ?? s.TodayRevenue ?? 0,
            upcomingShowsCount: s.upcomingShowsCount ?? s.UpcomingShowsCount ?? 0,
            mostPopularMovie: s.mostPopularMovie ?? s.MostPopularMovie ?? 'No data yet',
            averageTicketPrice: s.averageTicketPrice ?? s.AverageTicketPrice ?? 0,
            todayTickets: s.todayTickets ?? s.TodayTickets ?? 0
          };
        }
        if (res.revenue) this.weeklyRevenue = res.revenue;
        if (res.movies) this.topMovies = res.movies;
      },
      error: (err) => {
        console.error('Failed to load dashboard data:', err);
      }
    });
  }

  deleteMovie(movie: MovieResponseDto): void {
    const title = movie.titleEnglish || 'this movie';

    this.deletingMovieId = movie.id;
    // Optimistically remove from list immediately
    this.moviesList = this.moviesList.filter(m => m.id !== movie.id);
    this.notificationService.success(`"${title}" deleted from catalog.`, 'Movie Removed');
    this.cdr.detectChanges();

    this.apiService.deleteMovie(movie.id).subscribe({
      next: () => {
        this.deletingMovieId = null;
        this.loadMovies();
        this.loadDashboardStats();
      },
      error: () => {
        this.deletingMovieId = null;
        this.loadMovies();
      }
    });
  }

  formatCurrency(value?: number): string {
    const amount = value ?? 0;
    return amount.toLocaleString('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
}