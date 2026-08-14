import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import {Register} from './features/auth/register/register';
import { MovieCatalog } from './features/movies/movie-catalog/movie-catalog';
import { MovieDetails } from './features/movies/movie-details/movie-details';
import { SeatPicker } from './features/booking/seat-picker/seat-picker';
import { TicketConfirmation } from './features/booking/ticket-confirmation/ticket-confirmation';
import { BookingHistory } from './features/booking/booking-history/booking-history';
import { TicketValidator } from './features/admin/ticket-validator/ticket-validator';
import {CreateSchedule} from './features/admin/create-schedule/create-schedule'
import { CreateMovie} from './features/admin/create-movie/create-movie';

export const routes: Routes = [
    {path:'', redirectTo: 'movies', pathMatch:'full'},
    {path:'auth/login', component: Login},
    {path:'auth/register', component: Register},
    {path:'movies', component: MovieCatalog},
    {path:'movie/:movieId', component: MovieDetails},
    {path:'book/:scheduleId', component:SeatPicker},
    {path:'ticket-confirmation', component: TicketConfirmation},
    {path:'booking-history', component: BookingHistory},
    {path:'booking-details/:ticketId', component: TicketConfirmation},
    {path:'admin/validate-ticket', component: TicketValidator},
    {path: 'admin/create-movie', component: CreateMovie},
    {path: 'admin/create-schedule', component: CreateSchedule},
    { path: '**', redirectTo: 'movies' }
];
