# CineFlow - Complete User Journey Architecture

## 🎯 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CineFlow Movie Booking System                         │
│                      Complete Moviegoer User Journey                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ 📱 STEP 1: BROWSE MOVIES & FILTER                                            │
├──────────────────────────────────────────────────────────────────────────────┤
│ Component: MovieCatalog (/movies)                                            │
│ Features:                                                                    │
│  • Search by title                                                          │
│  • Filter by genre (Action, Drama, Comedy, Sci-Fi)                         │
│  • Filter by language (Amharic, English)                                   │
│  • Movie cards with posters                                                │
│  • "My Bookings" quick link                                                │
│ API Calls:                                                                  │
│  → GET /Movies (with filters)                                              │
│ Navigation:                                                                 │
│  → Click "Book Tickets" → /movie/:movieId                                 │
└──────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🎬 STEP 2: VIEW DETAILS & SELECT SHOWTIME                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ Component: MovieDetails (/movie/:movieId)                                    │
│ Features:                                                                    │
│  • Movie poster (large)                                                     │
│  • Title (English & Amharic)                                               │
│  • Director & Cast information                                             │
│  • Synopsis in 2 languages                                                 │
│  • Photo gallery                                                           │
│  • Genre, language, duration badges                                        │
│  • Available showtimes (clickable cards)                                   │
│  • Selected showtime details                                               │
│  • Price per seat display                                                 │
│ API Calls:                                                                  │
│  → GET /Movies/{movieId}                                                   │
│ Navigation:                                                                 │
│  → Click "Proceed to Seat Selection" → /book/:scheduleId                 │
└──────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🎫 STEP 3: PICK A SEAT                                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ Component: SeatPicker (/book/:scheduleId)                                    │
│ Features:                                                                    │
│  • Interactive theater layout (Rows A-E, 6 seats each)                     │
│  • Click to select seat                                                    │
│  • Visual seat feedback                                                    │
│  • 10-minute hold countdown timer                                          │
│  • Payment provider selection:                                             │
│    - Telebirr 📱                                                           │
│    - CBE Birr 💳                                                           │
│    - Chapa 🔗                                                              │
│  • Phone number input                                                      │
│  • "Pay & Confirm" button                                                 │
│ API Calls:                                                                  │
│  → POST /Tickets/hold (seat holding)                                       │
│  → POST /Tickets/book-with-details (with full ticket data)                │
│ Navigation:                                                                 │
│  → Click "Pay & Confirm" → /ticket-confirmation (with state)              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🎫✓ STEP 4: BOOKING CONFIRMATION & QR CODE                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ Component: TicketConfirmation (/ticket-confirmation)                         │
│ Features:                                                                    │
│  • ✓ Booking Confirmed badge                                               │
│  • Large QR code display (scannable)                                        │
│  • "Show this QR code at cinema" message                                    │
│  • Complete ticket details:                                                │
│    - Movie title (English & Amharic)                                       │
│    - Seat number                                                           │
│    - Cinema hall & location                                                │
│    - Show date & time                                                      │
│    - Price                                                                 │
│    - Payment provider                                                      │
│    - Transaction reference                                                 │
│    - Booking timestamp                                                     │
│  • Actions:                                                                │
│    - 📥 Download QR Code                                                   │
│    - 🖨️ Print Ticket                                                       │
│    - Back to Movies                                                        │
│  • Important information box                                               │
│    - Keep QR code safe                                                     │
│    - Arrive 15 minutes early                                               │
│    - One use per QR code                                                   │
│ API Calls:                                                                  │
│  → Payment processing (Telebirr/Chapa/CBE Birr)                           │
│  → QR code generation (from backend)                                       │
│ Navigation Options:                                                         │
│  → Download QR Code (browser download)                                     │
│  → Print Ticket (browser print)                                            │
│  → Back to Movies → /movies                                                │
└──────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│ 📅 STEP 5: MANAGE BOOKINGS                                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ Component: BookingHistory (/booking-history)                                 │
│ Features:                                                                    │
│  • Tab Navigation:                                                          │
│    - 📅 Upcoming Shows (default)                                            │
│    - ✓ Attended Shows                                                       │
│    - 📋 All Bookings                                                        │
│  • Booking Cards (per booking):                                             │
│    - Movie title (English & Amharic)                                       │
│    - Status badge (color-coded):                                           │
│      * 📅 Upcoming (blue)                                                   │
│      * ✓ Attended (green)                                                   │
│      * ✗ Cancelled (red)                                                    │
│    - Seat number                                                           │
│    - Date & time                                                           │
│    - Cinema hall & location                                                │
│    - Price                                                                 │
│    - Booking date                                                          │
│    - Ticket ID                                                             │
│  • Actions (per booking):                                                   │
│    - 📥 Download QR (for upcoming)                                          │
│    - View Details                                                          │
│  • Empty State:                                                             │
│    - Friendly message                                                      │
│    - Link to browse movies                                                 │
│ API Calls:                                                                  │
│  → GET /Tickets/my-bookings                                                │
│  → GET /Tickets/{ticketId}/qrcode (for download)                          │
│ Navigation:                                                                 │
│  → Click "View Details" → /booking-details/:ticketId                      │
└──────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🎬✓ STEP 6: CINEMA ENTRY (Staff Action)                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│ Component: TicketValidator (/admin/validate-ticket)                          │
│ Features (Cinema Staff):                                                     │
│  • QR code scanner                                                          │
│  • Ticket validation                                                        │
│  • Display ticket details                                                   │
│  • One-time use enforcement                                                 │
│ API Calls:                                                                  │
│  → POST /Tickets/validate                                                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Component Dependency Tree

```
App Component
│
├── AppRoutes
│
├── Login (/auth/login)
│   └── AuthService
│
├── Register (/auth/register)
│   └── AuthService
│
├── MovieCatalog (/movies) ⭐ ENHANCED
│   ├── CineFlowApiService
│   │   ├── getFilteredMovies()
│   │   └── [Other methods]
│   └── RouterLink → /movie/:movieId
│
├── MovieDetails (/movie/:movieId) ⭐ NEW
│   ├── ActivatedRoute
│   ├── Router
│   ├── CineFlowApiService
│   │   └── getMovieById()
│   └── RouterLink → /book/:scheduleId
│
├── SeatPicker (/book/:scheduleId) ⭐ ENHANCED
│   ├── ActivatedRoute
│   ├── Router
│   ├── CineFlowApiService
│   │   ├── holdSeat()
│   │   └── bookTicketWithDetails() ⭐ NEW
│   └── Router.navigate() → /ticket-confirmation
│
├── TicketConfirmation (/ticket-confirmation) ⭐ NEW
│   ├── ActivatedRoute
│   ├── Router
│   ├── Navigation State (from SeatPicker)
│   ├── Download QR functionality
│   ├── Print functionality
│   └── Router.navigate() → /movies
│
├── BookingHistory (/booking-history) ⭐ NEW
│   ├── Router
│   ├── CineFlowApiService
│   │   ├── getUserBookings() ⭐ NEW
│   │   └── generateQRCode() ⭐ NEW
│   └── Router.navigate() → /booking-details/:ticketId
│
├── CreateMovie (/admin/create-movie)
│   ├── CineFlowApiService
│   │   └── createMovie()
│   └── CineFlowApiService
│       └── getDirectors()
│
├── CreateSchedule (/admin/create-schedule)
│   └── CineFlowApiService
│       ├── getMovies()
│       ├── getCinemaHalls()
│       └── createSchedule()
│
└── TicketValidator (/admin/validate-ticket)
    └── CineFlowApiService
        └── validateTicket()
```

---

## 📊 Data Flow Architecture

```
┌─────────────────┐
│   USER ACTION   │
└────────┬────────┘
         ↓
┌─────────────────────────────────────┐
│  Angular Component                  │
│  (MovieCatalog/Details/SeatPicker)  │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  CineFlowApiService                 │
│  (HTTP Calls to Backend)            │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Backend API (Node.js/C# Server)    │
│  ✓ GET /Movies                      │
│  ✓ GET /Movies/{movieId}            │
│  ✓ POST /Tickets/hold               │
│  ✓ POST /Tickets/book-with-details  │
│  ✓ GET /Tickets/my-bookings         │
│  ✓ POST /Tickets/validate           │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Database                           │
│  ✓ Movies Table                     │
│  ✓ Schedules Table                  │
│  ✓ Bookings Table                   │
│  ✓ QR Codes Table                   │
│  ✓ Payments Table                   │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  External Services                  │
│  ✓ Telebirr API (Payment)          │
│  ✓ Chapa API (Payment)             │
│  ✓ CBE Birr API (Payment)          │
│  ✓ QR Code Generator (Library)     │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Response Back to Component         │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Component Updates UI               │
│  Navigate to Next Step              │
└─────────────────────────────────────┘
```

---

## 🎨 UI/UX Flow Map

```
┌──────────────────┐
│   App Launches   │
└────────┬─────────┘
         ↓
    ┌────────────┐
    │ Logged In? │
    └───┬────┬───┘
        │NO  │YES
        ↓    ↓
    ┌──────┬──────────────────────┐
    │Login/│MovieCatalog (default)│
    │Reg   ├──────────┬───────────┤
    └──┬───┤         │           │
       │   │      Browse       Quick
       │   │      Movie        Link
       │   │        ↓          ↓
       │   │     Search/    BookingHistory
       │   │     Filter     (View Past
       │   │        ↓       Bookings)
       │   │     MovieDetails
       │   │     (Full Info)
       │   │        ↓
       │   │     SeatPicker
       │   │     (Select)
       │   │        ↓
       │   │     TicketConfirmation
       │   │     (QR Code)
       │   │        ↓
       │   │     ✓ Entry to Cinema
       │   │
       └───┴──────────────────────┘
```

---

## 📱 Responsive Design Breakpoints

```
Desktop (1024px+)
├── Full width layout
├── 4-5 movie cards per row
├── Full filter bar
└── Large seats grid

Tablet (768px - 1023px)
├── 3-4 movie cards per row
├── Flexible filter bar
└── Responsive seats

Mobile (< 768px)
├── 1-2 movie cards per row
├── Stacked filter bar
├── Compact layout
└── Touch-optimized buttons
```

---

## 🔐 Authentication & Security

```
User Login/Register
    ↓
JWT Token Generated
    ↓
Token Stored in localStorage (as 'cineflow_token')
    ↓
JWT Interceptor (jwt-interceptor.ts)
    ├── Intercepts all HTTP requests
    ├── Attaches token to Authorization header
    ├── Handles expired tokens
    └── Redirects to login if unauthorized
    ↓
Protected API Calls
    ├── User-specific bookings
    ├── Personal booking history
    └── Download QR codes
    ↓
Cinema Entry Validation
    └── Staff scans QR code
        └── Backend validates token in QR
```

---

## 🎯 State Management Flow

```
Global State (localStorage)
├── cineflow_token (JWT)
├── user_id (from decoded token)
└── [Other auth data]

Component State (Local)
├── MovieCatalog
│   ├── movies[]
│   ├── filters{}
│   └── loading
├── MovieDetails
│   ├── movie{}
│   ├── selectedSchedule{}
│   └── loading
├── SeatPicker
│   ├── scheduleId
│   ├── seatRows[]
│   ├── selectedSeat
│   ├── holdActive
│   └── timerSeconds
├── TicketConfirmation
│   ├── ticketId
│   ├── qrCodeUrl
│   └── [Other ticket details]
└── BookingHistory
    ├── bookings[]
    ├── activeTab
    └── loading
```

---

## ✨ Key Features & Technologies

### **Frontend Technologies**
- Angular 22
- TypeScript
- RxJS (Observables)
- Bootstrap 5
- SCSS (Styling)
- HTML5

### **Design Pattern**
- Component-based architecture
- Standalone components
- Reactive programming
- Service-based architecture

### **Features**
✓ Responsive design
✓ Smooth animations
✓ Error handling
✓ Loading states
✓ Empty states
✓ User feedback messages
✓ Mobile optimization
✓ Print functionality
✓ Download functionality

---

## 📞 API Endpoints Summary

### **Movies**
- `GET /api/v1/Movies` - Get filtered movies
- `GET /api/v1/Movies/{movieId}` - Get single movie ⭐ NEW

### **Schedules**
- `GET /api/v1/Schedules` - Get schedules
- `POST /api/v1/Schedules` - Create schedule

### **Tickets**
- `POST /api/v1/Tickets/hold` - Hold seat
- `POST /api/v1/Tickets/book` - Book ticket (basic)
- `POST /api/v1/Tickets/book-with-details` - Book ticket ⭐ NEW
- `GET /api/v1/Tickets/my-bookings` - User bookings ⭐ NEW
- `GET /api/v1/Tickets/{ticketId}` - Ticket details ⭐ NEW
- `GET /api/v1/Tickets/{ticketId}/qrcode` - QR code ⭐ NEW
- `POST /api/v1/Tickets/validate` - Validate ticket

### **Cinema**
- `GET /api/v1/CinemaHall` - Get cinema halls

### **Admin**
- `POST /api/v1/Movies` - Create movie
- `GET /api/v1/Directors` - Get directors

---

**Implementation Complete! 🎉**

This architecture ensures a seamless moviegoer experience from browsing to cinema entry, with modern UI/UX and robust backend integration.
