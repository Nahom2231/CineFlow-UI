import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';
import { CreateMovieDto } from '../../../core/models/CineFlow.model';

@Component({
  selector: 'app-create-movie',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-movie.html',
  styleUrls: ['./create-movie.scss']
})
export class CreateMovie implements OnInit {
  isEditing = false;
  editingMovieId: string | null = null;

  directors: Array<{ id: string; name: string }> = [];
  suggestedDirectors: string[] = [
    'Christopher Nolan',
    'Denis Villeneuve',
    'Yidnekachew Shumete',
    'Hermon Hailay',
    'James Cameron',
    'Greta Gerwig',
    'Ryan Coogler'
  ];

  movie: CreateMovieDto = {
    titleEnglish: '',
    titleAmharic: '',
    descriptionEnglish: '',
    descriptionAmharic: '',
    durationMinutes: 120,
    genre: 'Action',
    audioLanguage: 'English',
    directorId: null,
    directorName: '',
    featuredImageUrl: ''
  };

  selectedFile: File | null = null;
  imagePreviewUrl: string = '';

  loading = false;
  errorMessage = '';
  successMessage = '';

  genres = ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Romance', 'Historical', 'Thriller', 'Animation'];
  languages = ['English', 'Amharic', 'Oromo', 'Tigrinya', 'French'];

  constructor(
    private apiService: CineFlowApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const movieIdParam = this.route.snapshot.paramMap.get('id');
    if (movieIdParam) {
      this.isEditing = true;
      this.editingMovieId = movieIdParam;
      this.loadMovieToEdit(movieIdParam);
    }

    this.apiService.getDirectors().subscribe({
      next: (data: any) => {
        this.directors = data || [];
        if (data && data.length > 0) {
          const names = data.map((d: any) => d.name).filter(Boolean);
          this.suggestedDirectors = Array.from(new Set([...this.suggestedDirectors, ...names]));
        }
      },
      error: () => (this.directors = [])
    });
  }

  loadMovieToEdit(movieId: string): void {
    this.loading = true;
    this.apiService.getMovieById(movieId).subscribe({
      next: (m) => {
        this.loading = false;
        if (m) {
          this.movie = {
            titleEnglish: m.titleEnglish || '',
            titleAmharic: m.titleAmharic || '',
            descriptionEnglish: m.descriptionEnglish || '',
            descriptionAmharic: m.descriptionAmharic || '',
            durationMinutes: m.durationMinutes || 120,
            genre: m.genre || 'Action',
            audioLanguage: m.audioLanguage || 'English',
            directorName: m.directorName || '',
            featuredImageUrl: m.featuredImageUrl || ''
          };
          this.imagePreviewUrl = m.featuredImageUrl || '';
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  selectSuggestedDirector(name: string): void {
    this.movie.directorName = name;
    const match = this.directors.find(d => d.name.toLowerCase() === name.toLowerCase());
    if (match) {
      this.movie.directorId = match.id;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onImageUrlChange(): void {
    if (this.movie.featuredImageUrl) {
      this.imagePreviewUrl = this.movie.featuredImageUrl;
    }
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%231e293b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="600" height="900" fill="url(%23g)"/><text x="300" y="430" font-family="sans-serif" font-size="44" font-weight="900" fill="%23f43f5e" text-anchor="middle">CINEFLOW</text><text x="300" y="490" font-family="sans-serif" font-size="22" font-weight="bold" fill="%2394a3b8" text-anchor="middle">POSTER PREVIEW</text></svg>';
    }
  }

  private createFallbackImageBlob(): Blob {
    // 1x1 minimal valid JPEG binary
    const bytes = new Uint8Array([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
      0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
      0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
      0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
      0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
      0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
      0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F,
      0x00, 0xBF, 0x00, 0xFF, 0xD9
    ]);
    return new Blob([bytes], { type: 'image/jpeg' });
  }

  onSubmit(): void {
    if (!this.movie.titleEnglish?.trim()) {
      this.errorMessage = 'Please provide an English movie title.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    formData.append('TitleEnglish', this.movie.titleEnglish.trim());
    formData.append('TitleAmharic', this.movie.titleAmharic?.trim() || this.movie.titleEnglish.trim());
    formData.append('DescriptionEnglish', this.movie.descriptionEnglish?.trim() || 'No description provided.');
    formData.append('DescriptionAmharic', this.movie.descriptionAmharic?.trim() || this.movie.descriptionEnglish?.trim() || 'N/A');
    formData.append('DurationMinutes', String(this.movie.durationMinutes || 120));
    formData.append('Genre', this.movie.genre || 'Action');
    formData.append('AudioLanguage', this.movie.audioLanguage || 'English');

    const enteredDirectorName = (this.movie.directorName || '').trim() || 'Special Feature';
    formData.append('DirectorName', enteredDirectorName);
    formData.append('Director', enteredDirectorName);

    // If matching director exists in registered directors list, append GUID as well
    const matchedDirector = this.directors.find(d => d.name.toLowerCase() === enteredDirectorName.toLowerCase());
    if (matchedDirector) {
      formData.append('DirectorId', matchedDirector.id);
    } else if (this.movie.directorId) {
      formData.append('DirectorId', this.movie.directorId);
    }

    // Always ensure FeaturedImage contains a multipart file for ASP.NET IFormFile
    if (this.selectedFile) {
      formData.append('FeaturedImage', this.selectedFile, this.selectedFile.name);
    } else {
      const fallbackBlob = this.createFallbackImageBlob();
      formData.append('FeaturedImage', fallbackBlob, 'poster.jpg');
    }

    if (this.movie.featuredImageUrl) {
      formData.append('FeaturedImageUrl', this.movie.featuredImageUrl);
    }

    const request$: import('rxjs').Observable<any> = this.isEditing && this.editingMovieId
      ? this.apiService.updateMovie(this.editingMovieId, formData)
      : this.apiService.createMovie(formData);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = this.isEditing
          ? 'Movie details updated successfully!'
          : 'Movie published successfully to the CineFlow catalog!';
        setTimeout(() => this.router.navigate(['/movies']), 1500);
      },
      error: (err: any) => {
        this.loading = false;
        if (err?.error?.errors) {
          const firstkey = Object.keys(err.error.errors)[0];
          this.errorMessage = `${firstkey}: ${err.error.errors[firstkey][0]}`;
        } else {
          this.errorMessage = err?.error?.message || 'Failed to save movie. Please verify your inputs.';
        }
      }
    });
  }
}

