import { Component, OnInit } from '@angular/core';
import {CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {CineFlowApiService} from '../../../core/services/cineflow-api.service';
import { MovieResponseDto, MovieFilterParams } from '../../../core/models/CineFlow.model';
@Component({
  selector: 'app-movie-catalog',
  standalone:true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './movie-catalog.html',
  styleUrl: './movie-catalog.scss',
})
export class MovieCatalog implements OnInit{
  movies: MovieResponseDto[] = [];
  loading: boolean = false;

  filters: MovieFilterParams = {
    searchTitle: '',
    genre: '',
    audioLanguage: '',
    cinemaBranch: ''
  };
  constructor (private apiService: CineFlowApiService) {}
  ngOnInit():void {
    this.loadMovies();
  }
  loadMovies(): void {
    this.loading = true;
    this.apiService.getFilteredMovies(this.filters).subscribe({
      next: (data) => {
        this.movies = data;
        this.loading = false;
      },
      error: (err)=> {
        console.error('Failed to load Movies', err);
        this.loading=false;
      }
    });
  }
  onSearch(): void {
    this.loadMovies();
}
}
