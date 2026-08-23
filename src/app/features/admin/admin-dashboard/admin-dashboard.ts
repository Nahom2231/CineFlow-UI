import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, finalize } from 'rxjs';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';

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
export class AdminDashboard implements OnInit {
  private apiService = inject(CineFlowApiService);
  private cdr = inject(ChangeDetectorRef);

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
  loading: boolean = true;

  ngOnInit(): void {
    this.loadDashboardStats();
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