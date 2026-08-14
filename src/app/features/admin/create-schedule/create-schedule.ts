import { Component, OnInit } from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CineFlowApiService } from '../../../core/services/cineflow-api.service';
import { MovieResponseDto } from '../../../core/models/CineFlow.model';
import {Router} from '@angular/router'
@Component({
  selector: 'app-create-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-schedule.html',
  styleUrls: ['./create-schedule.scss']
})
export class CreateSchedule implements OnInit {
  movies: MovieResponseDto[] = [];
  cinemaHalls: any[] = [];
  showtimeInput: string = '';
  loading: boolean = false;
  message: string = '';
  isSuccess: boolean = false;

  schedule= {
    movieId: '',
    cinemaHallId: '',
    ticketPrice: 200
  };
  constructor (private apiService: CineFlowApiService,
               private router: Router
  ) {}

  ngOnInit(): void {
    this.apiService.getFilteredMovies({}).subscribe({
      next: (data)=> this.movies=data,
      error: (err)=> console.error('Failed to load movies:', err)

    });
    this.apiService.getCinemaHalls().subscribe({
      next: (data) => this.cinemaHalls = data,
      error: (err) => console.error('Failed to load cinema halls:', err)
    });
  }
  
  
  onSubmit(): void{
    if(!this.schedule.movieId|| !this.schedule.cinemaHallId ||!this.showtimeInput){
      this.isSuccess= false;
      this.message = 'Please fill out all fields.';
       return;
    }
    this.loading = true;
    this.message= '';
    const payload ={
      movieId: this.schedule.movieId,
      cinemaHallId: this.schedule.cinemaHallId,
      showtime: new Date(this.showtimeInput).toISOString(),
      ticketPrice: this.schedule.ticketPrice
    };

    this.apiService.createSchedule(payload).subscribe({
      next: (res)=> {
        this.loading = false;
        this.isSuccess = true;
        this.message = res.message || 'schedule created successfully!';
        setTimeout(() => {
          this.router.navigate(['/catalog']); // Adjust route path to your catalog route
        }, 1000);
      
      },
      
      error: (err)=> {
        this.loading = false;
        this.isSuccess = false;
        this.message = err.error?.message || 'Failed to create schedule. Make sure you are logged in as Admin';
      }
    });
  }
  resetForm(): void {
    this.schedule = { movieId: '', cinemaHallId: '', ticketPrice: 200 };
    this.showtimeInput = '';
  }
}
