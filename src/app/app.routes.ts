import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { MovieCatalog } from './features/movies/movie-catalog/movie-catalog';
import { MovieDetails } from './features/movies/movie-details/movie-details';
import { SeatPicker } from './features/booking/seat-picker/seat-picker';
import { TicketConfirmation } from './features/booking/ticket-confirmation/ticket-confirmation';
import { BookingHistory } from './features/booking/booking-history/booking-history';
import { TicketValidator } from './features/admin/ticket-validator/ticket-validator';
import { CreateSchedule } from './features/admin/create-schedule/create-schedule';
import { CreateMovie } from './features/admin/create-movie/create-movie';
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';
import { ManageHalls } from './features/admin/manage-halls/manage-halls';
import { RevenueReport } from './features/admin/revenue-report/revenue-report';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'movies', pathMatch: 'full' },
  { path: 'auth/login', component: Login },
  { path: 'auth/reset-password', component: Login },
  { path: 'auth/register', component: Register },
  { path: 'movies', component: MovieCatalog },
  { path: 'movie/:movieId', component: MovieDetails },
  { path: 'movie/:id', component: MovieDetails },
  { path: 'movies/:id', component: MovieDetails },
  { path: 'book/:scheduleId', component: SeatPicker, canActivate: [authGuard] },
  { path: 'ticket-confirmation', component: TicketConfirmation, canActivate: [authGuard] },
  { path: 'booking-history', component: BookingHistory, canActivate: [authGuard] },
  { path: 'booking-details/:ticketId', component: TicketConfirmation },
  { path: 'admin/dashboard', component: AdminDashboard, canActivate: [adminGuard] },
  { path: 'admin/validate-ticket', component: TicketValidator, canActivate: [adminGuard] },
  { path: 'admin/manage-halls', component: ManageHalls, canActivate: [adminGuard] },
  { path: 'admin/revenue-report', component: RevenueReport, canActivate: [adminGuard] },
  { path: 'admin/create-movie', component: CreateMovie, canActivate: [adminGuard] },
  { path: 'admin/edit-movie/:id', component: CreateMovie, canActivate: [adminGuard] },
  { path: 'admin/create-schedule', component: CreateSchedule, canActivate: [adminGuard] },
  { path: '**', redirectTo: 'movies' }
];

