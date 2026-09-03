import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieDetails } from './movie-details';
import { ActivatedRoute, Router } from '@angular/router';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';
import { of, throwError } from 'rxjs';

describe('MovieDetails', () => {
  let component: MovieDetails;
  let fixture: ComponentFixture<MovieDetails>;
  let mockApiService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockApiService = {
      getMovieById: vi.fn().mockReturnValue(of(null)),
      getAllLocalMovies: vi.fn().mockReturnValue([])
    };
    mockRouter = {
      navigate: vi.fn()
    };
    mockActivatedRoute = {
      paramMap: of({
        get: (key: string) => 'movie-123'
      }),
      snapshot: {
        paramMap: {
          get: (key: string) => 'movie-123'
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [MovieDetails],
      providers: [
        { provide: CineFlowApiService, useValue: mockApiService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MovieDetails);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    mockApiService.getMovieById.mockReturnValue(of({
      id: 'movie-123',
      titleEnglish: 'Test Movie',
      titleAmharic: 'ሙከራ ሚዲያ',
      descriptionEnglish: 'A test movie',
      descriptionAmharic: '',
      durationMinutes: 120,
      genre: 'Drama',
      audioLanguage: 'English',
      featuredImageUrl: '',
      galleryImageUrl: [],
      directorName: '',
      starName: [],
      schedules: []
    }));

    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load movie details on init', () => {
    const mockMovie = {
      id: 'movie-123',
      titleEnglish: 'Test Movie',
      titleAmharic: 'ሙከራ ሚዲያ',
      descriptionEnglish: 'A test movie',
      descriptionAmharic: '',
      durationMinutes: 120,
      genre: 'Drama',
      audioLanguage: 'English',
      featuredImageUrl: '',
      galleryImageUrl: [],
      directorName: '',
      starName: [],
      schedules: []
    };

    mockApiService.getMovieById.mockReturnValue(of(mockMovie));
    component.ngOnInit();

    expect(mockApiService.getMovieById).toHaveBeenCalledWith('movie-123');
    expect(component.movie).toEqual(mockMovie);
    expect(component.loading).toBe(false);
  });

  it('should handle movie loading error', () => {
    mockApiService.getMovieById.mockReturnValue(throwError(() => ({ error: 'Not found' })));
    component.ngOnInit();

    expect(component.loading).toBe(false);
  });

  it('should navigate back to movies', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/movies']);
  });
});
