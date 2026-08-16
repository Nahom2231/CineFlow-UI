import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';

export interface RevenueReport {
  date: string;
  totalRevenue: number;
  totalTickets: number;
  averageTicketPrice: number;
  topMovie: string;
}

export interface MovieStats {
  movieName: string;
  ticketsSold: number;
  totalRevenue: number;
  screenings: number;
}

@Component({
  selector: 'app-revenue-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './revenue-report.html',
  styleUrl: './revenue-report.scss'
})
export class RevenueReport implements OnInit {
  private apiService = inject(CineFlowApiService);

  revenueReport: RevenueReport[] = [];
  movieStats: MovieStats[] = [];
  loading: boolean = true;
  
  // Filters
  filterType: 'daily' | 'weekly' | 'monthly' = 'daily';
  filterMonthYear: string = '';
  
  summary = {
    totalRevenue: 0,
    totalTickets: 0,
    averageTicketPrice: 0,
    topMovie: ''
  };

  ngOnInit(): void {
    const now = new Date();
    this.filterMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.loadRevenueReport();
  }

  loadRevenueReport(): void {
    this.loading = true;
    
    const filters = {
      filterType: this.filterType,
      monthYear: this.filterMonthYear
    };

    this.apiService.getRevenueReport(filters).subscribe({
      next: (data: any) => {
        this.revenueReport = data.dailyReport || [];
        this.movieStats = data.movieStats || [];
        this.summary = data.summary;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load revenue report', err);
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.loadRevenueReport();
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-ET', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  exportReport(): void {
    let csv = 'Date,Revenue,Tickets,Avg Price,Top Movie\n';
    
    this.revenueReport.forEach(row => {
      csv += `${row.date},${row.totalRevenue},${row.totalTickets},${row.averageTicketPrice},${row.topMovie}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `revenue-report-${this.filterMonthYear}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  printReport(): void {
    window.print();
  }
}
