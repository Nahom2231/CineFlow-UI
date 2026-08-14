import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieDetails } from './movie-details';
import { ActivatedRoute, Router } from '@angular/router';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';
import { of, throwError } from 'rxjs';

describe('MovieDetails', () => {
  let component: MovieDetails;
  let fixture: ComponentFixture<MovieDetails>;
  let mockApiService: jasmine.SpyObj<CineFlowApiService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('CineFlowApiService', ['getMovieById']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('movie-123')
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
    mockApiService.getMovieById.and.returnValue(of({
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

    mockApiService.getMovieById.and.returnValue(of(mockMovie));
    component.ngOnInit();

    expect(mockApiService.getMovieById).toHaveBeenCalledWith('movie-123');
    expect(component.movie).toEqual(mockMovie);
    expect(component.loading).toBe(false);
  });

  it('should handle movie loading error', () => {
    mockApiService.getMovieById.and.returnValue(throwError(() => ({ error: 'Not found' })));
    component.ngOnInit();

    expect(component.loading).toBe(false);
  });

  it('should navigate back to movies', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/movies']);
  });
});
