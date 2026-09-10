# CineFlow UI Project Overview

## Purpose

CineFlow is an Angular 22 standalone cinema-ticketing frontend. It supports movie discovery, showtime selection, seat booking, Chapa payment, digital QR tickets, booking history, and cinema administration.

The application currently operates as a hybrid frontend: it calls the backend when possible, but it also contains extensive localStorage fallback behavior for authentication, movies, schedules, bookings, payments, reports, and ticket validation.

## Recommended Reading Order

1. `src/main.ts` - starts the Angular application.
2. `src/app/app.config.ts` - registers routing, HTTP, and the JWT interceptor.
3. `src/app/app.ts` and `src/app/app.html` - global shell, navigation, login state, theme, language, and notifications.
4. `src/app/app.routes.ts` - maps URLs to features and guards.
5. `src/app/core/services/auth.ts` - authentication, JWT storage, refresh, and admin detection.
6. `src/app/core/interceptors/jwt-interceptor.ts` - attaches tokens and retries expired requests.
7. `src/app/core/models/CineFlow.model.ts` - shared business data structures.
8. `src/app/core/services/cineflow-api.service.ts` - main API and local fallback business layer.
9. Customer journey: movie catalog, movie details, seat picker, ticket confirmation, booking history.
10. Admin journey: dashboard, movie management, schedules, halls, reports, and ticket validation.

## Startup Flow

`src/main.ts` imports Zone.js and calls `bootstrapApplication(AppComponent, appConfig)`.

`src/app/app.config.ts` configures:

- Zone event coalescing through `provideZoneChangeDetection`.
- Angular routes through `provideRouter(routes)`.
- HTTP through `provideHttpClient`.
- The functional `jwtInterceptor` through `withInterceptors`.

## Application Shell

`src/app/app.ts` is the root standalone component. It injects:

- `AuthService` for login state, user email, admin status, and logout.
- `TranslationService` for English/Amharic UI text.
- `ThemeService` for light/dark mode.
- `NotificationService` for toast messages.
- Angular `Router` for navigation tracking.

`src/app/app.html` renders the header, navigation, authentication actions, mobile menu, router outlet, footer, and toast component.

## Route Map

### Public

- `/movies` - movie catalog.
- `/movie/:movieId`, `/movie/:id`, `/movies/:id` - movie details aliases.
- `/auth/login` - login.
- `/auth/reset-password` - login component in reset mode.
- `/auth/register` - registration.

### Authenticated

- `/book/:scheduleId` - seat selection.
- `/ticket-confirmation` - digital ticket.
- `/booking-history` - customer bookings.

### Admin

- `/admin/dashboard` - dashboard statistics.
- `/admin/validate-ticket` - gate validation.
- `/admin/manage-halls` - cinema halls and seat matrices.
- `/admin/revenue-report` - revenue report.
- `/admin/create-movie` - add movie.
- `/admin/edit-movie/:id` - edit movie.
- `/admin/create-schedule` - create showtime.

The empty route redirects to `/movies`, and unknown routes also redirect to `/movies`.

## Authentication Flow

`src/app/core/services/auth.ts` calls the backend at:

`http://localhost:5066/api/v1/Auth`

It implements registration, login, password reset, refresh tokens, token expiration checks, role detection, and logout. Tokens are saved in localStorage under:

- `cineflow_token`
- `cineflow_refresh_token`
- `cineflow_refresh_token_exp`

If the backend is unavailable, the service creates a mock JWT and treats the browser session as authenticated. Admin status is inferred from JWT role claims or an email containing `admin`.

`auth.guard.ts` and `admin.guard.ts` currently return `true` even when the user is not authenticated. They call `seedAdmin()` and `loginAsAdmin()` instead. This means the guards do not provide production authorization.

## HTTP Interceptor

`src/app/core/interceptors/jwt-interceptor.ts`:

1. Reads the current token.
2. Adds `Authorization: Bearer <token>` for real backend tokens.
3. Skips login, registration, and refresh-token requests.
4. On a 401 response, attempts a refresh-token request.
5. Logs out when refresh fails.

Mock tokens are not sent to the backend.

## Models

`src/app/core/models/CineFlow.model.ts` defines:

- Auth requests and responses.
- Movie and schedule DTOs.
- Movie filtering parameters.
- Movie and schedule creation commands.
- Seat-hold and ticket-booking commands.
- Ticket-validation commands.
- Cinema-hall models.
- Chapa payment initialization and verification models.

The main business relationship is:

`Movie -> Schedule -> Cinema Hall -> Seat -> Payment -> Ticket -> QR Validation`

## Main Business Service

`src/app/core/services/cineflow-api.service.ts` is the main data and business service. Its backend base URL is:

`http://localhost:5066/api/v1`

### Movies

The service loads movies from `/Movies`, applies search/filter parameters, caches backend results, merges custom local movies, and removes locally deleted IDs.

It also contains six fallback showcase movies with hardcoded images, descriptions, cast, schedules, prices, and halls.

Movie localStorage keys include:

- `cineflow_cached_movies`
- `cineflow_custom_movies`
- `cineflow_deleted_movie_ids`

### Schedules

The service creates, loads, updates, and deletes schedules. Local schedules are attached to local movie data when backend access is unavailable.

There is an endpoint naming inconsistency: creation uses `/Schedule`, while other schedule methods use `/Schedules`.

### Booking

The service supports seat holds, ticket booking, booking history, booking details, cancellation, and occupied-seat lookup. Local bookings are stored under `cineflow_bookings`.

The occupied-seat list includes hardcoded sample seats and locally saved bookings.

### Payment

The service calls Chapa initialization, verification, and configuration endpoints. If those calls fail, local fallback responses can make the payment and booking process appear successful without a real payment.

The implementation uses `/Tickets/book` for detailed booking, while the documented API specifies `/Tickets/book-with-details`.

### QR and Validation

The service creates QR URLs and ticket verification URLs, generates QR images through an external QR service, and calls the ticket-validation endpoint. Offline validation can accept arbitrary references as successful.

### Administration

The service supports cinema-hall CRUD, dashboard statistics, weekly revenue, top movies, local analytics, and watchlists. Revenue reporting is currently calculated from local browser data rather than a secure reporting endpoint.

## Customer Business Flow

### 1. Browse Movies

Implemented by:

- `src/app/features/movies/movie-catalog/movie-catalog.ts`
- `movie-catalog.html`
- `movie-catalog.scss`

The catalog immediately displays local data, then synchronizes with the backend. It supports bilingual search, genre/language/branch filters, sorting, watchlists, showtime display, movie details, and booking navigation.

### 2. View Details

Implemented by the movie-details component. It loads a movie by route ID, displays metadata and showtimes, and sends the selected schedule to the seat picker.

Missing schedules can be replaced with synthetic local schedules.

### 3. Select Seat

Implemented by the seat-picker component. It:

1. Loads schedule information.
2. Creates a fixed five-row, eight-seat layout.
3. Marks occupied seats.
4. Holds the selected seat.
5. Starts a countdown.
6. Calculates VAT and total price.
7. Initializes Chapa payment.
8. Books the ticket after payment or local fallback.

The fixed seat layout does not consume the seat matrix configured by hall management. The UI timer is three minutes while the backend command defaults to ten minutes.

### 4. Confirm Ticket

The ticket-confirmation component accepts data from router state, query parameters, Chapa redirects, or backend/local ticket lookup. It displays the ticket, creates a QR verification URL, supports download/copy/share/print, and stores confirmed bookings locally.

Ticket query parameters are client-controlled and can be modified.

### 5. Booking History

The booking-history component loads bookings, separates upcoming/completed/all tabs, displays ticket details, downloads QR codes, opens ticket details, and cancels upcoming bookings.

## Authentication Features

### Login

The login component supports normal login, reset-password mode, return URLs, demo login, failed-attempt tracking, and a client-side lockout after five failed attempts.

### Registration

The register component validates email and password complexity, calls registration, displays backend validation errors, and redirects to login. Offline registration saves credentials locally, but local login does not fully verify those saved credentials.

## Admin Flow

### Dashboard

Loads revenue, today sales, ticket counts, upcoming shows, weekly revenue, and top movies. Requests are combined with `forkJoin`.

### Movie Management

Create/edit movie supports bilingual metadata, genre, language, duration, director, featured image, and image upload. Cast and gallery image fields are not fully exposed.

### Schedule Management

Creates showtimes by selecting a movie, hall, date/time, and ticket price. It provides fallback halls when the API is unavailable.

### Hall Management

Creates and edits branch names, hall names, capacity, and seat matrices. The configured matrix is not currently consumed by the seat picker.

### Revenue Reports

Displays local revenue summaries, daily rows, movie rankings, CSV export, and print views. Daily, weekly, and monthly selectors do not currently change the underlying local dataset correctly.

### Ticket Validation

Uses `html5-qrcode` to scan QR images and accepts ticket IDs, transaction references, or ticket URLs. It calls ticket validation and keeps the last ten validation results in memory.

## Shared Services

- `translation.service.ts` - English/Amharic dictionaries and dynamic bilingual text.
- `translate.pipe.ts` - template translation pipe.
- `theme.service.ts` - light/dark theme persistence and system preference handling.
- `notification.service.ts` - signal-based toast state.
- `toast.component.ts` - toast rendering and dismissal.
- `cinema.ts` - currently empty injectable service.

## Tests

Tests exist for the root component, authentication, guards, interceptor existence, login, registration construction, movie catalog/details, seat picker construction, ticket confirmation, booking history, movie creation, schedule creation, and ticket validation.

Most tests only verify construction. Important missing tests cover:

- API service methods.
- Route protection.
- Admin authorization.
- Seat-hold expiration.
- Payment failure and cancellation.
- Booking conflicts.
- QR parsing and validation.
- LocalStorage merge/delete behavior.
- JWT refresh behavior.
- Backend integration.

## Important Production Risks

1. Authentication guards allow all routes and automatically log in an admin.
2. Admin credentials are hardcoded in frontend code.
3. Offline login, payment, booking, and validation can report success without backend confirmation.
4. The configured hall seat matrix is disconnected from seat selection.
5. Ticket data in query parameters can be edited by users.
6. Revenue reports are local-only.
7. Schedule endpoint names are inconsistent.
8. Detailed booking uses a different endpoint from the documented contract.
9. Backend database, seat locking, QR signatures, payment security, and one-time ticket use must be enforced server-side.

## Complete Flow Summary

```text
Browse movies
  -> View movie details
  -> Choose showtime
  -> Select seat
  -> Hold seat
  -> Pay through Chapa
  -> Book ticket
  -> Display QR ticket
  -> View booking history
  -> Validate ticket at cinema entrance
```

## Useful Project Commands

```text
npm install
npm start
npm test
npm run build
```

The frontend expects the backend at `http://localhost:5066` unless the service URLs are changed.