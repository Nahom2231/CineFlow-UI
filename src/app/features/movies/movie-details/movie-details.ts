import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';
import { MovieResponseDto, ScheduleDto } from '../../../core/models/CineFlow.model';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './movie-details.html',
  styleUrl: './movie-details.scss'
})
export class MovieDetails implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private apiService = inject(CineFlowApiService);
  public translationService = inject(TranslationService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private routeSub?: Subscription;

  movie: MovieResponseDto | null = null;
  loading: boolean = true;
  selectedSchedule: ScheduleDto | null = null;

  ngOnInit(): void {
    // Check if movie state was passed from router navigation
    const stateMovie = history.state?.movie;
    if (stateMovie && stateMovie.id) {
      this.setMovie(stateMovie);
    }

    this.routeSub = this.route.paramMap.subscribe((params) => {
      const movieId = params.get('movieId') || params.get('id');
      if (movieId) {
        this.loadMovieDetails(movieId);
      } else if (!this.movie) {
        const localMovies = this.apiService.getAllLocalMovies();
        if (localMovies.length > 0) {
          this.setMovie(localMovies[0]);
        } else {
          this.loading = false;
          this.cdr.detectChanges();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private setMovie(movie: MovieResponseDto): void {
    if (!movie) return;

    // Normalize movie properties
    const normalizedMovie: MovieResponseDto = {
      ...movie,
      featuredImageUrl: movie.featuredImageUrl && movie.featuredImageUrl.trim() !== '' 
        ? movie.featuredImageUrl 
        : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
      starName: Array.isArray(movie.starName) ? movie.starName : [],
      schedules: movie.schedules && movie.schedules.length > 0 
        ? movie.schedules 
        : [
            {
              id: 'sch-' + movie.id + '-1',
              startTime: new Date(Date.now() + 3 * 3600000).toISOString(),
              cinemaHallId: 'hall-1',
              cinemaHallName: 'Grand Bole Screen (Dolby Atmos)',
              price: 300
            },
            {
              id: 'sch-' + movie.id + '-2',
              startTime: new Date(Date.now() + 6 * 3600000).toISOString(),
              cinemaHallId: 'hall-2',
              cinemaHallName: 'IMAX Laser Bole Medhanialem',
              price: 350
            },
            {
              id: 'sch-' + movie.id + '-3',
              startTime: new Date(Date.now() + 9 * 3600000).toISOString(),
              cinemaHallId: 'hall-3',
              cinemaHallName: 'Edna Mall VIP Lounge',
              price: 400
            }
          ]
    };

    this.movie = normalizedMovie;
    this.loading = false;

    if (normalizedMovie.schedules && normalizedMovie.schedules.length > 0) {
      this.selectedSchedule = normalizedMovie.schedules[0];
    }
    this.cdr.detectChanges();
  }

  loadMovieDetails(movieId: string): void {
    this.loading = true;
    this.apiService.getMovieById(movieId).subscribe({
      next: (movie) => {
        if (movie) {
          this.setMovie(movie);
        } else {
          const allMovies = this.apiService.getAllLocalMovies();
          const fallback = allMovies.find((m) => m.id === movieId) || allMovies[0];
          this.setMovie(fallback);
        }
      },
      error: (err) => {
        console.warn('Failed to load movie details from backend, using fallback:', err);
        const allMovies = this.apiService.getAllLocalMovies();
        const fallback = allMovies.find((m) => m.id === movieId) || allMovies[0];
        this.setMovie(fallback);
      }
    });
  }

  selectSchedule(schedule: ScheduleDto): void {
    this.selectedSchedule = schedule;
    this.cdr.detectChanges();
  }

  bookNow(): void {
    if (this.selectedSchedule && this.movie) {
      this.router.navigate(['/book', this.selectedSchedule.id], {
        state: {
          movie: this.movie,
          schedule: this.selectedSchedule,
          movieTitle: this.movie.titleEnglish,
          movieTitleAmharic: this.movie.titleAmharic,
          posterUrl: this.movie.featuredImageUrl,
          ticketPrice: this.selectedSchedule.price || 300,
          cinemaHall: this.selectedSchedule.cinemaHallName || 'Grand Bole Screen',
          cinemaLocation: 'Addis Ababa (Bole)'
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/movies']);
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%231e293b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="600" height="900" fill="url(%23g)"/><text x="300" y="430" font-family="sans-serif" font-size="44" font-weight="900" fill="%23f43f5e" text-anchor="middle">CINEFLOW</text><text x="300" y="490" font-family="sans-serif" font-size="22" font-weight="bold" fill="%2394a3b8" text-anchor="middle">NOW SCREENING</text></svg>';
    }
  }
}
