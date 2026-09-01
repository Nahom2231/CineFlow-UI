# 🎬 CineFlow UI — Ethiopia's Premier Digital Cinema & Ticketing Platform

[![Angular](https://img.shields.io/badge/Angular-22.0-DD0031?style=for-the-badge&logo=angular)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=for-the-badge&logo=reactivex)](https://rxjs.dev/)
[![Chapa](https://img.shields.io/badge/Payment-Chapa_Ethiopia-10B981?style=for-the-badge)](https://chapa.co/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

**CineFlow UI** is a state-of-the-art, modern single-page web application (SPA) built with Angular 22 for digital cinema ticketing, auditorium seating management, and instant mobile payment clearance across Ethiopian banking rails (Telebirr, CBE Birr, Awash Birr, Cards, and Bank of Abyssinia via Chapa Payment Gateway).

---

## ✨ Key Features

### 🎟️ Customer Booking Experience
- **Interactive Theater Seat Matrix**:
  - Live seat grid map with distinct **Standard Seats** and **VIP Recliner Lounges**.
  - **3-Minute Seat Hold Expiration Timer** (180s) to prevent double-booking.
  - Automatic seat map layout reset on movie/schedule changes.
- **⚡ Chapa Ethiopian Payment Gateway**:
  - Integrated digital checkout for **Telebirr**, **CBE Birr**, **Awash Birr**, **Visa / MasterCard**, and **Bank of Abyssinia**.
  - Real-time API clearance status and seamless forward navigation to the digital admission pass.
- **📱 Phone-Scannable Digital Admission Pass**:
  - Automatically generates a scannable **QR Code Pass** encoded with ticket verification metadata.
  - Detailed breakdown of selected seats, tier class, auditorium hall, showtime, pricing, VAT, and customer contact.
  - 1-click **SVG Pass Download**, **Reference Copying**, **Share Pass**, and **Print Pass** functionality.
- **🌐 Dynamic Bilingual Localization**:
  - Instant toggle between **English** (`EN`) and **Amharic** (`AM ET`).
  - Localized movie titles (*e.g., The Fugitive / ፊዩጂቲቭ*), genres, and dates.
- **🍿 Movie Catalog & Showtime Finder**:
  - Filter movies by release status, genre, auditorium branch, and date schedules.
  - Trailer video popups, rating tags, and screening details.
- **📜 Booking History Hub**:
  - Comprehensive dashboard listing active, upcoming, and past cinema passes with instant status tags.

---

### 👑 Admin Management Hub
- **🔑 Staff Manager Verification & Bypass**:
  - Box Office Cash clearance and Direct Bank Transfer verification mode for cinema management staff.
- **📅 Screening Schedule Creator**:
  - Assign movies to cinema halls, configure screening dates/times, and set ticket pricing with real-time live preview cards.
- **🏛️ Auditorium Hall Manager**:
  - Configure cinema hall seating maps, row capacity, and VIP lounge allocations.
- **🎫 Ticket Validator Tool**:
  - Staff gate scanner interface for validating customer QR passes or transaction reference codes.
- **📊 Revenue & Analytics Dashboard**:
  - Sales metrics, hall occupancy rates, earnings breakdown, and screening performance statistics.

---

## 🎨 Design System & Aesthetics

- **Modern Glassmorphism & High-Contrast Typography**:
  - Vibrant Dark Mode with neon glow accents.
  - High-contrast Zero-Shadow Light Mode with curated typography (Inter / Plus Jakarta Sans) and vibrant colored text (`#0284C7`, `#3730A3`, `#BE123C`, `#047857`).
- **Modern Vector SVG Graphics**:
  - Crisp inline vector SVG icons across headers, seat statuses, payment rails, action buttons, and admission badges.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Angular 22](https://angular.dev/) (Standalone Components, Signals, RxJS) |
| **Language** | [TypeScript 6.0](https://www.typescriptlang.org/) |
| **Styling** | Vanilla SCSS (Design Tokens, Utility Classes, CSS Variables) |
| **Payment Gateway** | [Chapa API](https://chapa.co/) (Telebirr, CBE Birr, Cards, BOA) |
| **QR Code Engine** | Dynamic SVG Data URI & QRServer API |
| **Routing** | Angular Router with State Navigation & Query Parameters |
| **Build System** | `@angular/build` (esbuild / Vite engine) |

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed on your machine:
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Nahom2231/CineFlow-UI.git
   cd CineFlow-UI
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm start
   ```
   Navigate to `http://localhost:4200/` in your browser. The application will automatically reload if you change any of the source files.

---

## 📜 Build & Deployment

To compile the application bundle for production:

```bash
npm run build
```

The compiled build artifacts will be stored in the `dist/CineFlow-UI/` directory, ready for deployment to any static hosting provider (Vercel, Netlify, Firebase, AWS S3, or Nginx).

---

## 📁 Project Directory Structure

```text
CineFlow-UI/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── models/           # TypeScript interfaces & DTOs
│   │   │   ├── pipes/            # Translation & formatting pipes
│   │   │   └── services/         # API Service, Auth, Theme, Language
│   │   ├── features/
│   │   │   ├── admin/            # Admin Hub, Schedule Creator, Hall Manager, Validator
│   │   │   ├── auth/             # Login & Register views
│   │   │   ├── booking/          # Seat Picker, Ticket Confirmation, Booking History
│   │   │   └── movies/           # Movie Catalog & Movie Details
│   │   ├── app.routes.ts         # Application routing configuration
│   │   └── app.ts                # Main root component
│   └── styles.scss               # Global design tokens, light/dark themes & SVG utilities
├── angular.json                  # Angular CLI project configuration
└── package.json                  # Dependencies and scripts
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Nahom2231/CineFlow-UI/issues).

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Crafted with ❤️ for Ethiopia's Entertainment & Cinema Industry
</p>
