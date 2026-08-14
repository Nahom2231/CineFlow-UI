export interface RegisterRequest{
    email: string;
    password?: string;

}
export interface LoginRequest{
    email: string;
    password?: string;
}

export interface AuthResponse{
    token: string;
    expiration:string;
}

 export interface ScheduleDto {
    id: string;
    startTime: string;
    cinemaHallId: string;
    cinemaHallName?: string;
    price: number;
 }

export interface MovieResponseDto{
    id:string;
    titleEnglish: string;
    titleAmharic: string;
    descriptionEnglish: string;
    descriptionAmharic: string;
    durationMinutes: number;
    genre: string;
    audioLanguage: string;
    featuredImageUrl: string;
    galleryImageUrl: string[];
    directorName: string;
    starName: string[];
    schedules?: ScheduleDto[];
}
export interface MovieFilterParams {
    searchTitle?: string;
    genre?: string;
    audioLanguage?: string;
    cinemaBranch?: string;

}

export interface CreateScheduleCommand {
    movieId: string;
    cinemaHallId: string;
    showtime: string;
    ticketPrice: number;
}
export interface BookTicketCommand {
    scheduleId: string;
    seatNumber: string;
    paymentPhoneNumber: string;
    paymentProvider: string;

}
 export interface HoldSeatCommand {
    scheduleId: string;
    seatNumber: string;
    userId: string;
    holdDurationMinutes?: number;

 }
 export interface ValidateTicketCommand{
    transactionReference: string;
 }
 export interface CinemaHall {
    id: string;
    branchName: string;
    hallName: string;
    totalCapacity: number;
    seatMapMatrixJson: string;
 }
 export interface CreateMovieDto {
  titleEnglish: string;
  titleAmharic?: string;
  descriptionEnglish?: string;
  descriptionAmharic?: string;
  durationMinutes: number;
  genre: string;
  audioLanguage: string;
  directorId?: string |null;
  starIds?: string[] | null;
  featuredImageUrl?: string;
}