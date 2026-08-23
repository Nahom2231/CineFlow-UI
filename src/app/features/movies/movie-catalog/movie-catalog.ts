import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';
import { MovieResponseDto, MovieFilterParams, ScheduleDto } from '../../../core/models/CineFlow.model';

@Component({
  selector: 'app-movie-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './movie-catalog.html',
  styleUrl: './movie-catalog.scss'
})
export class MovieCatalog implements OnInit, OnDestroy {
  private apiService = inject(CineFlowApiService);
  private router = inject(Router);

  movies: MovieResponseDto[] = [];
  loading: boolean = true;

  // Hero carousel
  heroMovies: MovieResponseDto[] = [];
  currentHeroIndex: number = 0;
  private autoSlideTimer: any = null;

  // Filter state
  selectedGenreChip: string = 'All';
  genreChips: string[] = ['All', 'Action', 'Sci-Fi', 'Drama', 'Comedy', 'Amharic'];

  filters: MovieFilterParams = {
    searchTitle: '',
    genre: '',
    audioLanguage: '',
    cinemaBranch: ''
  };

  ngOnInit(): void {
    this.loadMovies();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  loadMovies(): void {
    this.loading = true;
    this.apiService.getFilteredMovies(this.filters).subscribe({
      next: (data) => {
        this.movies = data || [];
        this.loading = false;

        // Set hero banner movies
        if (this.movies.length > 0) {
          this.heroMovies = this.movies.slice(0, 3);
          this.startAutoSlide();
        }
      },
      error: (err) => {
        console.error('Failed to load Movies', err);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.loadMovies();
  }

  selectGenreChip(chip: string): void {
    this.selectedGenreChip = chip;
    if (chip === 'All') {
      this.filters.genre = '';
      this.filters.audioLanguage = '';
    } else if (chip === 'Amharic') {
      this.filters.genre = '';
      this.filters.audioLanguage = 'Amharic';
    } else {
      this.filters.genre = chip;
      this.filters.audioLanguage = '';
    }
    this.loadMovies();
  }

  resetFilters(): void {
    this.selectedGenreChip = 'All';
    this.filters = {
      searchTitle: '',
      genre: '',
      audioLanguage: '',
      cinemaBranch: ''
    };
    this.loadMovies();
  }

  setHeroIndex(index: number): void {
    this.currentHeroIndex = index;
    this.resetAutoSlide();
  }

  nextHero(): void {
    if (this.heroMovies.length > 0) {
      this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroMovies.length;
      this.resetAutoSlide();
    }
  }

  prevHero(): void {
    if (this.heroMovies.length > 0) {
      this.currentHeroIndex = (this.currentHeroIndex - 1 + this.heroMovies.length) % this.heroMovies.length;
      this.resetAutoSlide();
    }
  }

  private startAutoSlide(): void {
    this.stopAutoSlide();
    this.autoSlideTimer = setInterval(() => {
      if (this.heroMovies.length > 1) {
        this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroMovies.length;
      }
    }, 6000);
  }

  private stopAutoSlide(): void {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
      this.autoSlideTimer = null;
    }
  }

  private resetAutoSlide(): void {
    this.startAutoSlide();
  }

  bookMovie(movie: MovieResponseDto): void {
    let schedule: ScheduleDto;
    if (movie.schedules && movie.schedules.length > 0) {
      schedule = movie.schedules[0];
    } else {
      schedule = {
        id: 'sch-' + movie.id + '-1',
        startTime: new Date(Date.now() + 2 * 3600000).toISOString(),
        cinemaHallId: 'hall-1',
        cinemaHallName: 'Grand Bole Screen (Dolby Atmos)',
        price: 300
      };
    }

    this.router.navigate(['/book', schedule.id], {
      state: {
        movie: movie,
        schedule: schedule,
        movieTitle: movie.titleEnglish,
        movieTitleAmharic: movie.titleAmharic,
        posterUrl: movie.featuredImageUrl,
        ticketPrice: schedule.price || 300,
        cinemaHall: schedule.cinemaHallName || 'Grand Bole Screen (Dolby Atmos)',
        cinemaLocation: 'Addis Ababa (Bole)'
      }
    });
  }

  viewMovieDetails(movie: MovieResponseDto): void {
    this.router.navigate(['/movie', movie.id], { state: { movie } });
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%231e293b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="600" height="900" fill="url(%23g)"/><text x="300" y="430" font-family="sans-serif" font-size="44" font-weight="900" fill="%23f43f5e" text-anchor="middle">CINEFLOW</text><text x="300" y="490" font-family="sans-serif" font-size="22" font-weight="bold" fill="%2394a3b8" text-anchor="middle">NOW SCREENING</text></svg>';
    }
  }
}
