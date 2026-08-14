# CineFlow - Moviegoer User Journey Implementation Guide

## 📱 Complete Flow Implementation

This document outlines the complete implementation of the CineFlow moviegoer booking flow for regular customers (moviegoers) in Addis Ababa and other cities.

---

## 🎯 User Journey: Step-by-Step

### **Step 1: Browse Movies & Trailers** 📽️
**Component:** `MovieCatalog` (Enhanced)
- **Location:** `/movies`
- **Features Implemented:**
  - Search movies by title
  - Filter by genre (Action, Drama, Comedy, Sci-Fi)
  - Filter by audio language (Amharic, English)
  - Beautiful gradient UI with movie posters
  - Link to booking history
  - "My Bookings" quick link

- **User Actions:**
  1. Opens the app → redirects to `/movies`
  2. Browses through available movies
  3. Uses filters to find preferred movies
  4. Clicks "Book Tickets" → navigates to Movie Details page

---

### **Step 2: View Movie Details & Select Showtime** 🎬
**Component:** `MovieDetails` (New)
- **Location:** `/movie/:movieId`
- **Features Implemented:**
  - Full movie information (English & Amharic titles)
  - Movie synopsis in both languages
  - Cast & crew information
  - Photo gallery
  - Genre, language, duration badges
  - **Available Showtimes Display:**
    - Show time cards with cinema hall, date, price
    - Click to select showtime
    - Real-time selection feedback
  - Interactive booking section with selected details

- **User Actions:**
  1. Clicks "Book Tickets" from movie catalog
  2. Views complete movie information
  3. Sees all available showtimes
  4. Selects preferred showtime
  5. Clicks "Proceed to Seat Selection" → navigates to Seat Picker

---

### **Step 3: Pick a Seat** 🎫
**Component:** `SeatPicker` (Enhanced)
- **Location:** `/book/:scheduleId`
- **Features Implemented:**
  - Interactive seat layout (Rows A-E, 6 seats per row)
  - Click to select seat
  - **10-minute seat hold** with countdown timer
  - Payment provider selection:
    - Telebirr 📱
    - CBE Birr 💳
    - Chapa 🔗
  - Phone number input for payment
  - **Enhanced Booking Process:**
    - Calls `bookTicketWithDetails` instead of basic `bookTicket`
    - Returns complete ticket information for confirmation

- **User Actions:**
  1. Sees interactive theater layout
  2. Clicks to select preferred seat (e.g., middle row, center)
  3. Seat is held for 10 minutes
  4. Selects payment provider (Telebirr, Chapa, CBE Birr)
  5. Enters mobile phone number
  6. Clicks "Pay & Confirm"

---

### **Step 4: Payment & Ticket Generation** 💳
**Component:** `TicketConfirmation` (New)
- **Location:** `/ticket-confirmation`
- **Features Implemented:**
  - **✓ Booking Confirmed** success badge
  - **QR Code Display:**
    - Large, scannable QR code
    - "Show this QR code at the cinema" message
    - Download QR code button 📥
    - Print ticket button 🖨️
  
  - **Complete Ticket Details:**
    - Movie title (English & Amharic)
    - Seat information
    - Cinema hall & location
    - Showtime
    - Payment provider & transaction reference
    - Booking timestamp
    - Ticket price
  
  - **Digital Pass Information:**
    - Instructions to show QR code at entry
    - Arrive 15 minutes early reminder
    - QR code validity information

- **User Actions:**
  1. After successful payment
  2. Views digital pass with QR code
  3. Can download or print QR code
  4. Gets confirmation with all booking details
  5. Can return to movies or view booking history

---

### **Step 5: View Booking History & Manage Tickets** 📅
**Component:** `BookingHistory` (New)
- **Location:** `/booking-history`
- **Features Implemented:**
  - **Three View Tabs:**
    - 📅 Upcoming Shows
    - ✓ Attended Shows
    - 📋 All Bookings
  
  - **Booking Cards Display:**
    - Movie title & subtitle
    - Seat number
    - Date & time
    - Cinema hall & location
    - Price
    - Booking date
    - Status badge (color-coded)
  
  - **Actions:**
    - 📥 Download QR (for upcoming shows)
    - View ticket details
  
  - **Empty State:**
    - Friendly message when no bookings
    - Link to browse movies

- **User Actions:**
  1. Accesses "My Bookings" from any page
  2. Views upcoming shows
  3. Downloads QR code for entry
  4. Can view past bookings
  5. Can see attended shows history

---

### **Step 6: Entry to Cinema** 🎫✓
**Component:** `TicketValidator` (Existing - for cinema staff)
- **Location:** `/admin/validate-ticket`
- **Features:**
  - Cinema staff scans QR code from customer's phone
  - Validates ticket
  - One-time use per QR code
  - Shows movie, seat, showtime details

---

## 🔄 Complete Data Flow

```
Browse Movies
    ↓
Select Movie → Movie Details Page
    ↓
Select Showtime
    ↓
Proceed to Seat Selection → Seat Picker Page
    ↓
Select Seat + Payment Provider + Phone Number
    ↓
Confirm Booking (Payment Processing)
    ↓
Ticket Confirmation Page (QR Code Generation)
    ↓
Show QR at Cinema / Download / Print / View Booking History
    ↓
Cinema Staff Scans QR Code
    ↓
Entry to Cinema ✓
```

---

## 🛠️ Technical Implementation Details

### **New Components Created:**

1. **TicketConfirmation** (`ticket-confirmation/`)
   - Displays ticket details after successful booking
   - Shows QR code for entry
   - Download/Print functionality
   - Files: `.ts`, `.html`, `.scss`, `.spec.ts`

2. **MovieDetails** (`movie-details/`)
   - Shows complete movie information
   - Displays all showtimes
   - Allows showtime selection
   - Files: `.ts`, `.html`, `.scss`, `.spec.ts`

3. **BookingHistory** (`booking-history/`)
   - Shows user's booking history
   - Filters by status (upcoming/completed/all)
   - Download QR codes
   - Files: `.ts`, `.html`, `.scss`, `.spec.ts`

### **Enhanced Components:**

1. **SeatPicker** (`seat-picker.ts`)
   - Updated `confirmBooking()` to use `bookTicketWithDetails()`
   - Passes complete ticket data to confirmation page

2. **MovieCatalog** (`movie-catalog/`)
   - Updated HTML with better layout
   - Added "My Bookings" link
   - Enhanced styling
   - Links to Movie Details instead of direct booking

3. **App Routes** (`app.routes.ts`)
   - Added `/movie/:movieId` → MovieDetails
   - Added `/ticket-confirmation` → TicketConfirmation
   - Added `/booking-history` → BookingHistory
   - Added `/booking-details/:ticketId` → TicketConfirmation

### **Enhanced API Service** (`cineflow-api.service.ts`)

**New Methods Added:**

```typescript
// Get a single movie by ID
getMovieById(movieId: string): Observable<MovieResponseDto>

// Get user's booking history
getUserBookings(): Observable<any[]>

// Get booking details by ticket ID
getBookingDetails(ticketId: string): Observable<any>

// Generate QR code for a ticket
generateQRCode(ticketId: string): Observable<{qrCodeUrl: string}>

// Enhanced bookTicket method returning full ticket details
bookTicketWithDetails(command: BookTicketCommand): Observable<{
    ticketId: string;
    transactionReference: string;
    movieTitle: string;
    movieTitleAmharic: string;
    seatNumber: string;
    scheduleTime: string;
    cinemaHall: string;
    cinemaLocation: string;
    ticketPrice: number;
    paymentProvider: string;
    bookingDateTime: string;
    qrCodeUrl: string;
    message: string;
}>
```

---

## 🔌 Backend Integration Requirements

The frontend is designed to work with these backend endpoints:

### **Movies Endpoints**
```
GET  /api/v1/Movies             // Get filtered movies
GET  /api/v1/Movies/{movieId}   // Get single movie by ID
POST /api/v1/Movies             // Create movie (admin)
```

### **Schedules Endpoints**
```
GET  /api/v1/Schedules
POST /api/v1/Schedules          // Create schedule
```

### **Tickets Endpoints**
```
POST /api/v1/Tickets/hold       // Hold seat for 10 minutes
POST /api/v1/Tickets/book       // Book ticket
POST /api/v1/Tickets/book-with-details  // NEW: Book with full details
GET  /api/v1/Tickets/my-bookings        // NEW: Get user bookings
GET  /api/v1/Tickets/{ticketId}         // NEW: Get ticket details
GET  /api/v1/Tickets/{ticketId}/qrcode  // NEW: Generate QR code
POST /api/v1/Tickets/validate   // Validate ticket (for cinema staff)
```

### **Backend Implementation Checklist**

- [ ] **bookTicketWithDetails Endpoint**
  - Accept: scheduleId, seatNumber, paymentPhoneNumber, paymentProvider, userId
  - Return: ticketId, transactionReference, movieTitle, movieTitleAmharic, seatNumber, scheduleTime, cinemaHall, cinemaLocation, ticketPrice, paymentProvider, bookingDateTime, qrCodeUrl, message
  - Trigger payment processing with selected provider (Telebirr, Chapa, CBE Birr)
  - Generate QR code with ticket information
  - Store booking in database

- [ ] **getUserBookings Endpoint**
  - Return: Array of bookings with status (upcoming/completed/cancelled)
  - Filter by user ID (from JWT token)
  - Include: ticketId, movieTitle, movieTitleAmharic, seatNumber, scheduleTime, cinemaHall, cinemaLocation, bookingDate, status, qrCodeUrl, price

- [ ] **getMovieById Endpoint**
  - Accept: movieId parameter
  - Return: Complete movie object with schedules array
  - Include schedules with startTime, cinemaHallName, cinemaHallId, price

- [ ] **getTicketDetails Endpoint**
  - Return: Complete ticket information
  - Include: All booking details, QR code URL, status

- [ ] **generateQRCode Endpoint**
  - Accept: ticketId
  - Generate scannable QR code
  - Return: QR code URL (as base64 or image URL)

- [ ] **Payment Integration**
  - Integrate with Telebirr API
  - Integrate with Chapa API
  - Integrate with CBE Birr API
  - Track payment status
  - Generate transaction reference

---

## 🎨 UI/UX Features Implemented

### **Color Scheme**
- Primary: Gradient #667eea → #764ba2 (Purple/Blue)
- Success: #4caf50 (Green)
- Accent: #1976d2 (Blue)

### **Responsive Design**
- Mobile-first approach
- Breakpoint: 768px for tablet/mobile
- Flexible layouts
- Touch-friendly buttons

### **Animations**
- Hover effects on cards
- Smooth transitions
- Loading spinner
- Timer countdown

### **Accessibility**
- Semantic HTML
- Proper label associations
- Color-coded status badges
- Large clickable areas

---

## 📊 Database Schema (Backend Considerations)

### **Bookings Table**
```
- ticket_id (PK)
- user_id (FK)
- schedule_id (FK)
- seat_number
- booking_date
- payment_provider (Telebirr/Chapa/CBEBirr)
- payment_status (Pending/Completed/Failed)
- transaction_reference
- price
- status (Upcoming/Completed/Cancelled)
- qr_code_url
```

### **QR Codes Table**
```
- qr_code_id (PK)
- ticket_id (FK)
- qr_code_data
- qr_code_url
- created_at
- scanned_at (nullable)
- is_valid
```

---

## 🚀 How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📝 API Configuration

Backend URL is configured in `src/app/core/services/cineflow-api.service.ts`:
```typescript
private readonly baseUrl = 'http://localhost:5066/api/v1';
```

Update this URL to match your backend server.

---

## ✅ What This Implementation Provides

✓ **Browse & Filter Movies** - Search by title, genre, language
✓ **Movie Details** - Full information, trailers, showtimes
✓ **Interactive Seat Selection** - Visual theater layout with 10-min hold
✓ **Payment Processing** - Support for Telebirr, Chapa, CBE Birr
✓ **Digital QR Pass** - Instant QR code generation for entry
✓ **Booking Management** - View, download, print tickets
✓ **Booking History** - Track attended and upcoming shows
✓ **Beautiful UI** - Gradient design, smooth animations
✓ **Responsive Design** - Works on mobile, tablet, desktop
✓ **Error Handling** - User-friendly error messages

---

## 🔐 Authentication

The app uses JWT token-based authentication:
- Token stored in `localStorage` as `cineflow_token`
- Sent via JWT interceptor in HTTP headers
- Required for booking and viewing personal bookings

---

## 📞 Support Information

For implementing the backend:
1. Review the endpoint specifications above
2. Ensure database schema matches requirements
3. Implement payment provider integrations
4. Generate QR codes with ticket data
5. Test complete flow end-to-end

---

**Implementation Complete! 🎉**

All frontend components for the moviegoer booking flow are now in place and ready to connect with your backend services.
