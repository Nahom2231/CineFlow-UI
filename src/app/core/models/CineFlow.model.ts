export interface RegisterRequest {
    email: string;
    password?: string;
}

export interface LoginRequest {
    email: string;
    password?: string;
}

export interface ResetPasswordRequest {
    email: string;
    newPassword: string;
}

export interface AuthResponse {
    token: string;
    expiration: string;
    refreshToken?: string;
    refreshTokenExpiration?: string;
    email?: string;
    roles?: string[];
    userId?: string;
    isLockedOut?: boolean;
    remainingSeconds?: number;
    remainingAttempts?: number;
    failedAttempts?: number;
    message?: string;
}

export interface RefreshTokenRequest {
    token?: string;
    refreshToken: string;
}

export interface ScheduleDto {
    id: string;
    startTime: string;
    cinemaHallId: string;
    cinemaHallName?: string;
    price: number;
}

export interface MovieResponseDto {
    id: string;
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
    transactionReference?: string;
    userId?: string;
    movieTitle?: string;
    movieTitleAmharic?: string;
    cinemaHall?: string;
    cinemaLocation?: string;
    ticketPrice?: number;
}

export interface HoldSeatCommand {
    scheduleId: string;
    seatNumber: string;
    userId: string;
    holdDurationMinutes?: number;
}

export interface ValidateTicketCommand {
    transactionReference?: string;
    codeOrReference?: string;
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
    directorId?: string | null;
    directorName?: string;
    starIds?: string[] | null;
    featuredImageUrl?: string;
}

export interface InitializePaymentRequest {
    amount: number;
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    currency?: string;
    reference?: string;
    scheduleId?: string | null;
    seatNumber?: string | null;
}

export interface InitializePaymentResponse {
    success: boolean;
    message: string;
    reference: string;
    encryptedReference?: string;
    checkoutUrl?: string;
    publicKey?: string;
    callbackUrl?: string;
}

export interface VerifyPaymentResponse {
    success: boolean;
    reference: string;
    status: string;
    message: string;
}

export interface PaymentConfigResponse {
    publicKey: string;
    baseUrl: string;
    callbackUrl: string;
}

