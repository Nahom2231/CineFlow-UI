import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';
import { MovieResponseDto, ScheduleDto } from '../../../core/models/CineFlow.model';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-details.html',
  styleUrl: './movie-details.scss'
})
export class MovieDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(CineFlowApiService);
  private router = inject(Router);

  movie: MovieResponseDto | null = null;
  loading: boolean = true;
  selectedSchedule: ScheduleDto | null = null;

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('movieId');
    if (movieId) {
      this.loadMovieDetails(movieId);
    }
  }

  loadMovieDetails(movieId: string): void {
    this.apiService.getMovieById(movieId).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.loading = false;
        // Auto-select first schedule if available
        if (movie.schedules && movie.schedules.length > 0) {
          this.selectedSchedule = movie.schedules[0];
        }
      },
      error: (err) => {
        console.error('Failed to load movie details', err);
        this.loading = false;
      }
    });
  }

  selectSchedule(schedule: ScheduleDto): void {
    this.selectedSchedule = schedule;
  }

  bookNow(): void {
    if (this.selectedSchedule) {
      this.router.navigate(['/book', this.selectedSchedule.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/movies']);
  }
}
