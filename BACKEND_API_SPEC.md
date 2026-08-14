# Backend API Implementation Requirements

## 🔌 API Specification for CineFlow Backend

This document specifies all API endpoints required for the CineFlow moviegoer booking system.

---

## 📋 Table of Contents

1. Movies Endpoints
2. Schedules Endpoints
3. Tickets Endpoints (Enhanced)
4. Cinema Hall Endpoints
5. Directors Endpoints
6. Error Handling
7. Response Format Standards

---

## 🎬 Movies Endpoints

### 1. Get Filtered Movies
```
GET /api/v1/Movies
```

**Query Parameters:**
- `searchTitle` (optional, string) - Search by movie title
- `genre` (optional, string) - Filter by genre
- `audioLanguage` (optional, string) - Filter by language
- `cinemaBranch` (optional, string) - Filter by cinema branch

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "titleEnglish": "The Movie Title",
    "titleAmharic": "ፊልም ርዕስ",
    "descriptionEnglish": "A thrilling movie about...",
    "descriptionAmharic": "ስለ...ስጋታማ ፊልም",
    "durationMinutes": 120,
    "genre": "Drama",
    "audioLanguage": "English",
    "featuredImageUrl": "https://...",
    "galleryImageUrl": ["https://...", "https://..."],
    "directorName": "Director Name",
    "starName": ["Actor 1", "Actor 2"],
    "schedules": []
  }
]
```

---

### 2. Get Single Movie (NEW)
```
GET /api/v1/Movies/{movieId}
```

**Path Parameters:**
- `movieId` (required, UUID) - Movie identifier

**Response (200 OK):**
```json
{
  "id": "uuid",
  "titleEnglish": "The Movie Title",
  "titleAmharic": "ፊልም ርዕስ",
  "descriptionEnglish": "A thrilling movie about...",
  "descriptionAmharic": "ስለ...ስጋታማ ፊልም",
  "durationMinutes": 120,
  "genre": "Drama",
  "audioLanguage": "English",
  "featuredImageUrl": "https://...",
  "galleryImageUrl": ["https://...", "https://..."],
  "directorName": "Director Name",
  "starName": ["Actor 1", "Actor 2"],
  "schedules": [
    {
      "id": "schedule-uuid",
      "startTime": "2024-12-20T18:30:00Z",
      "cinemaHallId": "hall-uuid",
      "cinemaHallName": "Hall 1 - Addis Ababa",
      "price": 150
    },
    {
      "id": "schedule-uuid",
      "startTime": "2024-12-20T21:00:00Z",
      "cinemaHallId": "hall-uuid",
      "cinemaHallName": "Hall 2 - Addis Ababa",
      "price": 150
    }
  ]
}
```

**Error Responses:**
- 404 Not Found - Movie doesn't exist
- 400 Bad Request - Invalid movieId format

---

### 3. Create Movie (Existing)
```
POST /api/v1/Movies
```

**Request Body (multipart/form-data):**
```
- titleEnglish (string, required)
- titleAmharic (string, optional)
- descriptionEnglish (string, optional)
- descriptionAmharic (string, optional)
- durationMinutes (integer, required)
- genre (string, required)
- audioLanguage (string, required)
- directorId (uuid, optional)
- starIds (uuid[], optional)
- featuredImageUrl (string, optional)
- galleryImageUrls (file[], optional)
```

**Response (201 Created):**
```json
"movie-uuid"
```

**Auth:** Requires Admin role

---

## 📅 Schedules Endpoints

### 1. Get All Schedules
```
GET /api/v1/Schedules
```

**Response (200 OK):**
```json
[
  {
    "id": "schedule-uuid",
    "movieId": "movie-uuid",
    "startTime": "2024-12-20T18:30:00Z",
    "cinemaHallId": "hall-uuid",
    "cinemaHallName": "Hall 1",
    "price": 150
  }
]
```

---

### 2. Create Schedule
```
POST /api/v1/Schedules
```

**Request Body:**
```json
{
  "movieId": "uuid",
  "cinemaHallId": "uuid",
  "showtime": "2024-12-20T18:30:00Z",
  "ticketPrice": 150
}
```

**Response (201 Created):**
```json
{
  "scheduleId": "schedule-uuid",
  "message": "Schedule created successfully"
}
```

**Auth:** Requires Admin role

---

## 🎫 Tickets Endpoints (Enhanced)

### 1. Hold Seat
```
POST /api/v1/Tickets/hold
```

**Request Body:**
```json
{
  "scheduleId": "uuid",
  "seatNumber": "A1",
  "userId": "uuid",
  "holdDurationMinutes": 10
}
```

**Response (200 OK):**
```json
{
  "reservationId": "reservation-uuid",
  "message": "Seat held for 10 minutes"
}
```

**Behavior:**
- Lock seat for specified duration
- Prevent double-booking
- Automatically release after timeout
- Use Redis/Cache for fast access

**Error Responses:**
- 400 Bad Request - Seat already occupied
- 404 Not Found - Schedule doesn't exist

---

### 2. Book Ticket (Basic - Existing)
```
POST /api/v1/Tickets/book
```

**Request Body:**
```json
{
  "scheduleId": "uuid",
  "seatNumber": "A1",
  "paymentPhoneNumber": "0941234567",
  "paymentProvider": "Telebirr",
  "userId": "uuid"
}
```

**Response (200 OK):**
```json
{
  "ticketId": "ticket-uuid",
  "message": "Ticket successfully booked"
}
```

---

### 3. Book Ticket with Full Details (NEW) ⭐
```
POST /api/v1/Tickets/book-with-details
```

**Request Body:**
```json
{
  "scheduleId": "uuid",
  "seatNumber": "A1",
  "paymentPhoneNumber": "0941234567",
  "paymentProvider": "Telebirr",
  "userId": "uuid"
}
```

**Response (200 OK):**
```json
{
  "ticketId": "ticket-uuid",
  "transactionReference": "TXN-20241220-001",
  "movieTitle": "The Movie Title",
  "movieTitleAmharic": "ፊልም ርዕስ",
  "seatNumber": "A1",
  "scheduleTime": "2024-12-20T18:30:00Z",
  "cinemaHall": "Hall 1",
  "cinemaLocation": "Addis Ababa",
  "ticketPrice": 150,
  "paymentProvider": "Telebirr",
  "bookingDateTime": "2024-12-15T10:30:00Z",
  "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "message": "Ticket successfully booked"
}
```

**Processing Steps:**
1. Validate seat availability
2. Process payment with selected provider
3. Generate ticket record in database
4. Generate QR code
5. Send confirmation email/SMS
6. Return complete ticket details

**Payment Integration:**
- Implement Telebirr API integration
- Implement Chapa API integration
- Implement CBE Birr API integration
- Handle payment status tracking
- Generate unique transaction reference

**QR Code Generation:**
- Include: ticketId, movieTitle, seatNumber, scheduleTime, cinemaHall
- Format: PNG or Base64 image
- Scannable by standard QR readers
- Include checksum validation

**Error Responses:**
- 400 Bad Request - Invalid request data
- 402 Payment Required - Payment failed
- 409 Conflict - Seat already booked

---

### 4. Get User Bookings (NEW) ⭐
```
GET /api/v1/Tickets/my-bookings
```

**Headers:**
- Authorization: Bearer `{jwt_token}`

**Query Parameters (optional):**
- `status` (string) - Filter by status: "upcoming", "completed", "cancelled"
- `limit` (integer) - Max results (default: 50)
- `offset` (integer) - Pagination offset (default: 0)

**Response (200 OK):**
```json
[
  {
    "ticketId": "ticket-uuid",
    "movieTitle": "The Movie Title",
    "movieTitleAmharic": "ፊልም ርዕስ",
    "seatNumber": "A1",
    "scheduleTime": "2024-12-20T18:30:00Z",
    "cinemaHall": "Hall 1",
    "cinemaLocation": "Addis Ababa",
    "bookingDate": "2024-12-15T10:30:00Z",
    "status": "upcoming",
    "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "price": 150
  }
]
```

**Status Values:**
- `upcoming` - Show is in the future
- `completed` - Show date has passed and user attended
- `cancelled` - Booking was cancelled

**Auth Required:** Yes (User only sees own bookings)

---

### 5. Get Ticket Details (NEW) ⭐
```
GET /api/v1/Tickets/{ticketId}
```

**Path Parameters:**
- `ticketId` (required, UUID) - Ticket identifier

**Headers:**
- Authorization: Bearer `{jwt_token}`

**Response (200 OK):**
```json
{
  "ticketId": "ticket-uuid",
  "userId": "user-uuid",
  "scheduleId": "schedule-uuid",
  "movieId": "movie-uuid",
  "movieTitle": "The Movie Title",
  "movieTitleAmharic": "ፊልም ርዕስ",
  "seatNumber": "A1",
  "scheduleTime": "2024-12-20T18:30:00Z",
  "cinemaHall": "Hall 1",
  "cinemaLocation": "Addis Ababa",
  "cinemaHallId": "hall-uuid",
  "bookingDate": "2024-12-15T10:30:00Z",
  "status": "upcoming",
  "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "price": 150,
  "paymentProvider": "Telebirr",
  "transactionReference": "TXN-20241220-001",
  "paymentStatus": "completed",
  "notes": ""
}
```

**Error Responses:**
- 404 Not Found - Ticket doesn't exist
- 403 Forbidden - User doesn't own this ticket

---

### 6. Generate QR Code (NEW) ⭐
```
GET /api/v1/Tickets/{ticketId}/qrcode
```

**Path Parameters:**
- `ticketId` (required, UUID) - Ticket identifier

**Query Parameters (optional):**
- `format` (string) - "png", "svg", "base64" (default: "base64")
- `size` (integer) - QR code size in pixels (default: 200)

**Response (200 OK):**
```json
{
  "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

**Alt Response (for PNG/SVG):**
```
Content-Type: image/png
[Binary image data]
```

**QR Code Content (Encoded):**
```
{
  "ticketId": "ticket-uuid",
  "transactionRef": "TXN-20241220-001",
  "movieTitle": "The Movie Title",
  "seatNumber": "A1",
  "scheduleTime": "2024-12-20T18:30:00Z",
  "cinemaHall": "Hall 1",
  "validity": "2024-12-20"
}
```

**Auth Required:** Yes (User can only get own ticket QR code)

---

### 7. Validate Ticket
```
POST /api/v1/Tickets/validate
```

**Request Body:**
```json
{
  "transactionReference": "TXN-20241220-001"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Ticket is valid",
  "ticketDetails": {
    "ticketId": "ticket-uuid",
    "movieTitle": "The Movie Title",
    "seatNumber": "A1",
    "customerName": "John Doe",
    "scheduleTime": "2024-12-20T18:30:00Z",
    "cinemaHall": "Hall 1"
  }
}
```

**Validation Logic:**
- Decode and verify QR code
- Check ticket existence in database
- Verify one-time use (mark as scanned)
- Check ticket date/time validity
- Check if already scanned (prevent duplicate entry)

**Error Responses:**
- 400 Bad Request - Invalid QR code
- 404 Not Found - Ticket doesn't exist
- 410 Gone - Ticket already used
- 403 Forbidden - Ticket expired

**Auth Required:** Yes (Cinema staff role)

---

## 🏢 Cinema Hall Endpoints

### Get All Cinema Halls
```
GET /api/v1/CinemaHall
```

**Response (200 OK):**
```json
[
  {
    "id": "hall-uuid",
    "branchName": "Addis Ababa Branch",
    "hallName": "Hall 1",
    "totalCapacity": 36,
    "seatMapMatrixJson": {
      "rows": ["A", "B", "C", "D", "E"],
      "seatsPerRow": 6
    }
  }
]
```

---

## 👥 Directors Endpoints

### Get All Directors
```
GET /api/v1/Directors
```

**Response (200 OK):**
```json
[
  {
    "id": "director-uuid",
    "name": "Director Name"
  }
]
```

---

## 🔐 Authentication

### Login
```
POST /api/v1/Auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiration": "2024-12-21T10:30:00Z"
}
```

### Register
```
POST /api/v1/Auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully"
}
```

---

## 📋 Error Handling Standards

### Standard Error Response
```json
{
  "statusCode": 400,
  "message": "Detailed error message",
  "details": "Additional context if applicable"
}
```

### Common HTTP Status Codes
- `200 OK` - Successful GET/PUT
- `201 Created` - Successful POST creating resource
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid auth
- `403 Forbidden` - Authorized but no permission
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Business logic violation
- `500 Internal Server Error` - Server error

---

## 📝 Response Format Standards

### All responses include:
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success message"
}
```

### Pagination (for list endpoints):
```json
{
  "statusCode": 200,
  "data": [],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

---

## 🔔 Database Schema Requirements

### Bookings Table
```sql
CREATE TABLE bookings (
  ticket_id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  schedule_id UUID NOT NULL,
  seat_number VARCHAR(5) NOT NULL,
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_provider VARCHAR(50),
  payment_status VARCHAR(20),
  transaction_reference VARCHAR(100) UNIQUE,
  price DECIMAL(10,2),
  status VARCHAR(20), -- upcoming, completed, cancelled
  qr_code_url TEXT,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (schedule_id) REFERENCES schedules(id),
  UNIQUE (schedule_id, seat_number)
);

CREATE TABLE qr_codes (
  qr_code_id UUID PRIMARY KEY,
  ticket_id UUID NOT NULL UNIQUE,
  qr_code_data TEXT NOT NULL,
  qr_code_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  scanned_at TIMESTAMP,
  is_valid BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (ticket_id) REFERENCES bookings(ticket_id)
);

CREATE TABLE seat_reservations (
  reservation_id UUID PRIMARY KEY,
  schedule_id UUID NOT NULL,
  seat_number VARCHAR(5) NOT NULL,
  user_id UUID NOT NULL,
  held_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  hold_expires_at TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## ✅ Implementation Checklist

- [ ] Movies endpoints (GET /Movies, GET /Movies/{id})
- [ ] Schedules endpoints
- [ ] Seat hold functionality (10-minute timeout)
- [ ] Basic booking endpoint
- [ ] **NEW:** Enhanced booking with full details
- [ ] **NEW:** User bookings endpoint
- [ ] **NEW:** Ticket details endpoint
- [ ] **NEW:** QR code generation
- [ ] Payment provider integrations (Telebirr, Chapa, CBE Birr)
- [ ] Ticket validation (one-time use)
- [ ] Authentication & JWT
- [ ] Error handling
- [ ] Database schema implementation
- [ ] API documentation (Swagger)
- [ ] Testing (unit & integration)

---

**Backend API Specification Complete!** 🚀

Use this specification to implement all required endpoints for seamless frontend-backend integration.
