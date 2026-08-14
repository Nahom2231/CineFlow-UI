import { Component, OnInit } from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router } from '@angular/router';
import {CineFlowApiService} from '../../../core/services/cineflow-api.service';
import {CreateMovieDto} from '../../../core/models/CineFlow.model';

@Component({
  selector: 'app-create-movie',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-movie.html',
  styleUrls: ['./create-movie.scss'],
})
export class CreateMovie implements OnInit {

 directors: Array<{ id: string; name: string }> =[]

  movie: CreateMovieDto = {
    titleEnglish: '',
    titleAmharic: '',
    descriptionEnglish: '',
    descriptionAmharic: '',
    durationMinutes: 120,
    genre: 'Action',
    audioLanguage: 'English',
    directorId: null,
    featuredImageUrl: ''
  };

  loading = false;
  errorMessage = '';
  successMessage='';

  constructor(
    private apiService: CineFlowApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.apiService.getDirectors().subscribe({
      next: (data: any) => (this.directors = data),
      error: () => (this.directors = [])
    });
  }
  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    formData.append('titleEnglish', this.movie.titleEnglish ?? '');
    formData.append('titleAmharic', this.movie.titleAmharic ?? '');
    formData.append('descriptionEnglish', this.movie.descriptionEnglish ?? '');
   formData.append('descriptionAmharic', this.movie.descriptionAmharic?.trim() || this.movie.descriptionEnglish || 'N/A');
    formData.append('durationMinutes', String(this.movie.durationMinutes ?? ''));
    formData.append('genre', this.movie.genre ?? '');
    formData.append('audioLanguage', this.movie.audioLanguage ?? '');
   if (this.movie.directorId) {
    formData.append('directorId', this.movie.directorId);
  }

  // 2. Append starIds individually if any exist (DO NOT append an empty Guid string)
  if (this.movie.starIds && this.movie.starIds.length > 0) {
    this.movie.starIds.forEach((id) => formData.append('starIds', id));
  }

  if (this.movie.featuredImageUrl) {
    formData.append('featuredImageUrl', this.movie.featuredImageUrl);
  }

    this.apiService.createMovie(formData).subscribe({
      next: () => {
        this.loading =false;
        this.successMessage='Movie created successfully!';
        setTimeout(() => this.router
        
        
        .navigate(['/movies']), 1500);
      },
      error: (err) => {
        this.loading = false;
        if(err.error?.errors) {
          const firstkey= Object.keys(err.error.errors)[0];
          this.errorMessage=`${firstkey}: ${err.error.errors[firstkey][0]}`;
        }else {
        this.errorMessage= err.error?.message || 'Failed to create movie. ';
        }
      }
    });
  }
}
