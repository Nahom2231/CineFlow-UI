import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';
import { MovieResponseDto, MovieFilterParams, ScheduleDto } from '../../../core/models/CineFlow.model';
import { TranslationService } from '../../../core/services/translation.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-movie-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './movie-catalog.html',
  styleUrl: './movie-catalog.scss'
})
export class MovieCatalog implements OnInit, OnDestroy {
  private apiService = inject(CineFlowApiService);
  public translationService = inject(TranslationService);
  private notificationService = inject(NotificationService);
  public authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private moviesSub?: Subscription;

  allMovies: MovieResponseDto[] = [];
  movies: MovieResponseDto[] = [];
  loading: boolean = false;
  hasRequestedShowtimes: boolean = false;
  cancelledMovieIds = new Set<string>();

  // Hero carousel
  heroMovies: MovieResponseDto[] = [];
  currentHeroIndex: number = 0;
  private autoSlideTimer: any = null;

  // Filter state
  selectedGenreChip: string = 'All';
  genreChips: string[] = ['All', 'Action', 'Sci-Fi', 'Drama', 'Comedy', 'Amharic', 'Watchlist'];

  // Sorting option
  sortBy: 'title' | 'duration' | 'default' = 'default';

  filters: MovieFilterParams = {
    searchTitle: '',
    genre: '',
    audioLanguage: '',
    cinemaBranch: ''
  };

  get isSelectionActive(): boolean {
    return (
      this.hasRequestedShowtimes ||
      !!this.filters.audioLanguage ||
      !!this.filters.cinemaBranch ||
      !!this.filters.searchTitle ||
      (!!this.filters.genre && this.filters.genre !== 'All') ||
      this.selectedGenreChip === 'Watchlist'
    );
  }

  ngOnInit(): void {
    // 0. Load cancelled movies dismissed by user
    this.loadCancelledMovieIds();

    // 1. Initial immediate render from local store
    this.refreshCatalog();
    if (this.heroMovies.length > 0) {
      this.startAutoSlide();
    }
    this.hasRequestedShowtimes = true;

    // 2. Fetch fresh updates in background seamlessly
    this.loadMovies(true);

    // 3. Reactively sync whenever any movie is created, edited, or deleted anywhere in the app
    this.moviesSub = this.apiService.moviesUpdated$.subscribe(() => {
      this.refreshCatalog();
    });
  }

  ngOnDestroy(): void {
    this.moviesSub?.unsubscribe();
    this.stopAutoSlide();
  }

  loadCancelledMovieIds(): void {
    try {
      const raw = localStorage.getItem('cineflow_cancelled_movies');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          this.cancelledMovieIds = new Set(arr);
        }
      }
    } catch (e) {
      console.warn('Failed to load cancelled movies', e);
    }
  }

  saveCancelledMovieIds(): void {
    try {
      localStorage.setItem('cineflow_cancelled_movies', JSON.stringify(Array.from(this.cancelledMovieIds)));
    } catch (e) {
      console.warn('Failed to save cancelled movies', e);
    }
  }

  cancelMovieUser(event: Event, movie: MovieResponseDto): void {
    event.stopPropagation();
    event.preventDefault();

    this.cancelledMovieIds.add(movie.id);
    this.saveCancelledMovieIds();

    // Remove immediately from active view
    this.movies = this.movies.filter(m => m.id !== movie.id);
    this.heroMovies = this.heroMovies.filter(m => m.id !== movie.id);
    this.cdr.detectChanges();
  }

  restoreCancelledMovies(): void {
    this.cancelledMovieIds.clear();
    this.saveCancelledMovieIds();
    this.refreshCatalog();
    this.notificationService.success('All cancelled movies have been restored to your catalog.', 'Catalog Restored');
  }

  refreshCatalog(): void {
    this.allMovies = this.apiService.getAllLocalMovies();
    const visibleMovies = this.allMovies.filter(m => !this.cancelledMovieIds.has(m.id));
    this.heroMovies = visibleMovies.slice(0, Math.min(3, visibleMovies.length));
    if (this.currentHeroIndex >= this.heroMovies.length) {
      this.currentHeroIndex = 0;
    }
    this.applyFiltersInstant();
    this.cdr.detectChanges();
  }

  loadMovies(silent: boolean = false): void {
    if (!silent && this.allMovies.length === 0) {
      this.loading = true;
    }
    this.apiService.getFilteredMovies({}).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.allMovies = data;
          const visibleMovies = this.allMovies.filter(m => !this.cancelledMovieIds.has(m.id));
          this.heroMovies = visibleMovies.slice(0, Math.min(3, visibleMovies.length));
          if (this.currentHeroIndex >= this.heroMovies.length) {
            this.currentHeroIndex = 0;
          }
          if (this.heroMovies.length > 0 && !this.autoSlideTimer) {
            this.startAutoSlide();
          }
          if (this.isSelectionActive) {
            this.applyFiltersInstant();
          }
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('Catalog background sync: using local catalog', err?.status);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFiltersInstant(): void {
    let result = this.apiService.applyLocalFilters(this.allMovies, this.filters);

    // Filter out movies cancelled by user
    if (this.cancelledMovieIds.size > 0) {
      result = result.filter(m => !this.cancelledMovieIds.has(m.id));
    }

    if (this.selectedGenreChip === 'Watchlist') {
      const watchlistIds = this.apiService.getWatchlistIds();
      result = result.filter(m => watchlistIds.includes(m.id));
    }

    if (this.sortBy === 'title') {
      result = [...result].sort((a, b) => a.titleEnglish.localeCompare(b.titleEnglish));
    } else if (this.sortBy === 'duration') {
      result = [...result].sort((a, b) => b.durationMinutes - a.durationMinutes);
    }

    this.movies = result;
  }

  onFilterChange(): void {
    this.hasRequestedShowtimes = true;
    this.applyFiltersInstant();
  }

  onSearch(): void {
    if (this.filters.searchTitle && this.filters.searchTitle.trim() !== '') {
      this.hasRequestedShowtimes = true;
    }
    this.applyFiltersInstant();
  }

  requestAllShowtimes(): void {
    this.hasRequestedShowtimes = true;
    this.applyFiltersInstant();
  }

  selectLanguage(lang: string): void {
    this.filters.audioLanguage = lang;
    this.hasRequestedShowtimes = true;
    this.applyFiltersInstant();
  }

  selectBranch(branch: string): void {
    this.filters.cinemaBranch = branch;
    this.hasRequestedShowtimes = true;
    this.applyFiltersInstant();
  }

  selectGenreChip(chip: string): void {
    this.selectedGenreChip = chip;
    this.hasRequestedShowtimes = true;
    if (chip === 'All' || chip === 'Watchlist') {
      this.filters.genre = '';
      this.filters.audioLanguage = '';
    } else if (chip === 'Amharic') {
      this.filters.genre = '';
      this.filters.audioLanguage = 'Amharic';
    } else {
      this.filters.genre = chip;
      this.filters.audioLanguage = '';
    }
    this.applyFiltersInstant();
  }

  onSortChange(mode: 'title' | 'duration' | 'default'): void {
    this.sortBy = mode;
    this.applyFiltersInstant();
  }

  resetFilters(): void {
    this.hasRequestedShowtimes = false;
    this.selectedGenreChip = 'All';
    this.sortBy = 'default';
    this.filters = {
      searchTitle: '',
      genre: '',
      audioLanguage: '',
      cinemaBranch: ''
    };
    this.movies = [];
  }

  isInWatchlist(movieId: string): boolean {
    return this.apiService.isInWatchlist(movieId);
  }

  toggleWatchlist(event: Event, movie: MovieResponseDto): void {
    event.stopPropagation();
    const added = this.apiService.toggleWatchlist(movie.id);
    const title = this.translationService.dynamic(movie.titleEnglish, movie.titleAmharic);
    if (added) {
      this.notificationService.success(`"${title}" added to Watchlist`, 'Watchlist');
    } else {
      this.notificationService.info(`"${title}" removed from Watchlist`, 'Watchlist');
    }
    if (this.selectedGenreChip === 'Watchlist') {
      this.applyFiltersInstant();
    }
  }

  getRelevantSchedules(movie: MovieResponseDto): ScheduleDto[] {
    if (!movie.schedules || movie.schedules.length === 0) return [];
    if (!this.filters.cinemaBranch || this.filters.cinemaBranch.trim() === '') {
      return movie.schedules;
    }
    const branch = this.filters.cinemaBranch.toLowerCase().trim();
    const matched = movie.schedules.filter((s) => {
      const hall = (s.cinemaHallName || '').toLowerCase();
      const id = (s.cinemaHallId || '').toLowerCase();
      return hall.includes(branch) || id.includes(branch);
    });
    return matched.length > 0 ? matched : movie.schedules;
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

  bookSchedule(movie: MovieResponseDto, schedule: ScheduleDto): void {
    this.router.navigate(['/book', schedule.id], {
      state: {
        movie: movie,
        schedule: schedule,
        movieTitle: movie.titleEnglish,
        movieTitleAmharic: movie.titleAmharic,
        posterUrl: movie.featuredImageUrl,
        ticketPrice: schedule.price || 300,
        cinemaHall: schedule.cinemaHallName || 'Grand Bole Screen (Dolby Atmos)',
        cinemaLocation: this.filters.cinemaBranch ? `${this.filters.cinemaBranch} Screen` : 'Addis Ababa (Bole)'
      }
    });
  }

  bookMovie(movie: MovieResponseDto): void {
    const schedules = this.getRelevantSchedules(movie);
    let schedule: ScheduleDto;
    if (schedules && schedules.length > 0) {
      schedule = schedules[0];
    } else {
      schedule = {
        id: 'sch-' + movie.id + '-1',
        startTime: new Date(Date.now() + 2 * 3600000).toISOString(),
        cinemaHallId: 'hall-1',
        cinemaHallName: 'Grand Bole Screen (Dolby Atmos)',
        price: 300
      };
    }
    this.bookSchedule(movie, schedule);
  }

  viewMovieDetails(movie: MovieResponseDto): void {
    this.router.navigate(['/movie', movie.id], { state: { movie } });
  }

  editMovieAdmin(event: Event, movie: MovieResponseDto): void {
    event.stopPropagation();
    if (!this.authService.isAdmin()) {
      this.notificationService.error('Only Admins are authorized to edit movies.', 'Permission Denied');
      return;
    }
    this.router.navigate(['/admin/edit-movie', movie.id]);
  }

  deleteMovieAdmin(event: Event, movie: MovieResponseDto): void {
    event.stopPropagation();
    if (!this.authService.isAdmin()) {
      this.notificationService.error('Only Admins are authorized to permanently delete movies.', 'Permission Denied');
      return;
    }
    const title = this.translationService.dynamic(movie.titleEnglish, movie.titleAmharic);

    // Optimistically update lists
    this.allMovies = this.allMovies.filter(m => m.id !== movie.id);
    this.movies = this.movies.filter(m => m.id !== movie.id);
    this.heroMovies = this.heroMovies.filter(m => m.id !== movie.id);
    this.notificationService.success(`"${title}" deleted from catalog.`, 'Movie Removed');

    this.apiService.deleteMovie(movie.id).subscribe({
      next: () => {
        this.loadMovies(true);
      },
      error: () => {
        this.loadMovies(true);
      }
    });
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%231e293b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="600" height="900" fill="url(%23g)"/><text x="300" y="430" font-family="sans-serif" font-size="44" font-weight="900" fill="%23f43f5e" text-anchor="middle">CINEFLOW</text><text x="300" y="490" font-family="sans-serif" font-size="22" font-weight="bold" fill="%2394a3b8" text-anchor="middle">NOW SCREENING</text></svg>';
    }
  }
}
