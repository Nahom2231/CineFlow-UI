import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type LanguageCode = 'en' | 'am';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  isoCode: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly STORAGE_KEY = 'cineflow_lang';

  readonly languages: LanguageOption[] = [
    { code: 'en', label: 'English', nativeLabel: 'English', isoCode: 'en-US (ISO 639-1)', flag: '🇺🇸' },
    { code: 'am', label: 'Amharic', nativeLabel: 'አማርኛ', isoCode: 'am-ET (ISO 639-1)', flag: '🇪🇹' }
  ];

  private currentLangSubject = new BehaviorSubject<LanguageCode>(this.getInitialLanguage());
  public currentLang$ = this.currentLangSubject.asObservable();
  public currentLang = signal<LanguageCode>(this.getInitialLanguage());

  private translations: Record<LanguageCode, Record<string, string>> = {
    en: {
      // Navigation
      'NAV_MOVIES': 'Movies & Shows',
      'NAV_MY_TICKETS': 'My Tickets',
      'NAV_ADD_MOVIE': 'Add Movie',
      'NAV_CINEMA_HALLS': 'Cinema Halls',
      'NAV_ADMIN_HUB': 'Admin Hub',
      'NAV_SIGN_IN': 'Sign In',
      'NAV_SIGN_OUT': 'Sign Out',
      'NAV_JOIN_FREE': 'Join Free',
      'NAV_CREATE_ACCOUNT': 'Create Account',
      'NAV_TAGLINE': 'Cinema & Ticketing',
      'NAV_GUEST_ACCESS': 'Guests',
      'NAV_GUEST_HOME': 'Guests / Home',

      // Hero & Catalog
      'HERO_TAG': '✨ CINEMA EXPERIENCE IN ADDIS ABABA',
      'HERO_TITLE': 'Next-Gen Cinema',
      'HERO_TITLE_ACCENT': 'Live Showtimes',
      'HERO_SUBTITLE': 'Immerse yourself in IMAX, Dolby Atmos sound, and instant QR gate passes powered by Chapa payment clearance.',
      'HERO_BROWSE_BTN': 'Browse Movies Now',
      'HERO_SCHEDULE_BTN': 'View Showtimes',
      'CATALOG_TITLE': 'Now Screening & Upcoming',
      'CATALOG_SUBTITLE': 'Select your favorite movie, pick your screening hall and secure your seat instantly.',
      'SEARCH_PLACEHOLDER': 'Search movie by English or Amharic title...',
      'GENRE_ALL': 'All Genres',
      'GENRE_ACTION': 'Action',
      'GENRE_SCI_FI': 'Sci-Fi',
      'GENRE_DRAMA': 'Drama',
      'GENRE_COMEDY': 'Comedy',
      'GENRE_THRILLER': 'Thriller',
      'GENRE_ROMANCE': 'Romance',
      'NO_MOVIES_FOUND': 'No movies found matching your filter.',
      'BOOK_NOW': 'Book Seats',
      'VIEW_DETAILS': 'Details & Times',
      'TRAILER': 'Trailer',
      'DIRECTOR': 'Director',
      'DURATION': 'Duration',
      'MINUTES': 'mins',
      'AGE_RATING': 'Rating',
      'SHOWTIMES': 'Available Showtimes',
      'FROM_PRICE': 'From',
      'ETB': 'ETB',

      // Movie Details
      'MOVIE_SYNOPSIS': 'Movie Synopsis',
      'MOVIE_CAST': 'Cast & Crew',
      'SELECT_CINEMA_HALL': 'Select Cinema Hall & Showtime',
      'SELECT_TIME_PROMPT': 'Choose a convenient showtime below to open the interactive seat layout:',
      'PROCEED_SEAT_SELECTION': 'Proceed to Seat Selection',

      // Seat Picker & Chapa Payment
      'SEAT_PICKER_TITLE': 'Auditorium Seat Selection',
      'SCREEN_THIS_WAY': 'CINEMA SCREEN THIS WAY',
      'SEAT_STANDARD': 'Standard Seat (300 ETB)',
      'SEAT_VIP': 'VIP Recliner Lounge (400 ETB)',
      'SEAT_SELECTED': 'Selected Seat',
      'SEAT_OCCUPIED': 'Occupied',
      'SEAT_HOLD_TIMER': 'Holding your seat for',
      'SUMMARY_TITLE': 'Booking Summary',
      'CHOSEN_SEAT': 'Selected Seat',
      'BASE_PRICE': 'Base Ticket Price',
      'VIP_UPGRADE': 'VIP Recliner Upgrade',
      'VAT_SERVICE': 'VAT & Service (15%)',
      'TOTAL_PAYMENT': 'Total Payment',
      
      // Chapa Gateway Specific
      'CHAPA_GATEWAY_TITLE': 'Chapa Real-Time Payment Gateway',
      'CHAPA_GATEWAY_SUBTITLE': 'Direct API checkout for Telebirr, CBE Birr, Awash, Cards & Mobile Wallets',
      'CHAPA_CUSTOMER_INFO': 'Payment & Receipt Information',
      'CHAPA_EMAIL_LABEL': 'Customer Email (for receipt)',
      'CHAPA_FIRST_NAME': 'First Name',
      'CHAPA_LAST_NAME': 'Last Name',
      'CHAPA_PHONE_LABEL': 'Payment Phone Number',
      'CHAPA_PAY_BUTTON': 'Pay with Chapa Gateway',
      'CHAPA_PROCESSING': 'Connecting to Chapa Gateway...',
      'CHAPA_SECURE_BADGE': '256-Bit Encrypted Real Payment via Chapa API',
      'CHAPA_FREE_API_BADGE': 'Real Chapa Free Sandbox/Production API Clearance',

      // Ticket Confirmation & Pass
      'PASS_VERIFIED': 'VERIFIED AUTHENTIC PASS',
      'PASS_TITLE': 'CineFlow Cinema Admission Pass',
      'PASS_GATE_INSTRUCTION': 'Present this QR pass on your phone at the auditorium entrance.',
      'PASS_SEAT_NUMBER': 'Assigned Seat',
      'PASS_HALL': 'Auditorium Hall',
      'PASS_LOCATION': 'Branch Location',
      'PASS_SHOWTIME': 'Showtime',
      'PASS_PRICE': 'Admission Paid',
      'PASS_TXN_REF': 'Chapa Txn Ref',
      'PASS_DOWNLOAD_QR': 'Download QR Pass',
      'PASS_PRINT': 'Print Ticket',
      'PASS_MY_BOOKINGS': 'Go to My Bookings',

      // Booking History
      'HIST_TITLE': 'My Cinema Bookings & Passes',
      'HIST_SUBTITLE': 'View your digital ticket passes, download QR codes, and review showtimes',
      'HIST_TAB_UPCOMING': 'Upcoming Screenings',
      'HIST_TAB_ATTENDED': 'Attended Shows',
      'HIST_TAB_ALL': 'All Passes',
      'HIST_EMPTY': 'No bookings found.',
      'HIST_VIEW_PASS': 'View Digital Pass',

      // Admin Hub
      'ADMIN_DASHBOARD': 'Executive Cinema Dashboard',
      'ADMIN_STATS_REVENUE': 'Total Box Office Revenue',
      'ADMIN_STATS_TODAY': "Today's Gross Sales",
      'ADMIN_STATS_TICKETS': 'Tickets Sold',
      'ADMIN_STATS_SHOWS': 'Active Showtimes',
      'ADMIN_TOP_MOVIES': 'Top Performing Box Office Movies',
      'ADMIN_WEEKLY_CHART': '7-Day Box Office Revenue Visualizer',
      'ADMIN_QUICK_ACTIONS': 'Quick Actions & Management',
      'ADMIN_ADD_MOVIE_BTN': 'Publish New Movie',
      'ADMIN_CREATE_SCHEDULE_BTN': 'Create Screening Schedule',
      'ADMIN_MANAGE_HALLS_BTN': 'Configure Cinema Halls',
      'ADMIN_VALIDATE_BTN': 'Gate Ticket Scanner',
      'ADMIN_REVENUE_REPORT_BTN': 'Audited Revenue Reports',

      // Theme & Watchlist & Extra
      'THEME_DARK': 'Dark Mode',
      'THEME_LIGHT': 'Light Mode',
      'THEME_TOGGLE_TITLE': 'Toggle Light/Dark Theme',
      'NAV_WATCHLIST': 'My Watchlist',
      'WATCHLIST_FILTER': 'Watchlist Only',
      'ADD_TO_WATCHLIST': 'Add to Watchlist',
      'REMOVE_FROM_WATCHLIST': 'In Watchlist',
      'PASS_SHARE': 'Share Pass',
      'PASS_COPY_REF': 'Copy Ref Code',
      'PASS_COPIED': 'Ticket Reference Copied!',

      // Footer
      'FOOTER_DESC': "Ethiopia's premier next-generation cinema ticketing platform. Experience IMAX, Dolby Atmos sound, and instant QR gate passes seamlessly.",
      'FOOTER_QUICK_NAV': 'Quick Navigation',
      'FOOTER_BRANCHES': 'Cinema Branches',
      'FOOTER_ADMIN': 'Admin & Staff',
      'FOOTER_RIGHTS': '© 2026 CineFlow Digital Cinema Network. All rights reserved.',
      'FOOTER_LIVE': 'Online & Booking Live',

      // Reset Password
      'AUTH_FORGOT_PASSWORD': 'Forgot Password?',
      'AUTH_RESET_PASSWORD_TITLE': 'Reset Account Password',
      'AUTH_RESET_PASSWORD_SUB': 'Enter your registered email and your new password. You will be redirected directly to movies upon completion.',
      'AUTH_NEW_PASSWORD': 'New Password',
      'AUTH_CONFIRM_PASSWORD': 'Confirm New Password',
      'AUTH_RESET_SUBMIT_BTN': 'Reset Password & Go to Movies →',
      'AUTH_BACK_TO_LOGIN': 'Back to Sign In',
      'AUTH_RESET_SUCCESS': 'Password successfully reset! Welcome back.'
    },

    am: {
      // Navigation
      'NAV_MOVIES': 'ፊልሞች እና ፕሮግራሞች',
      'NAV_MY_TICKETS': 'የእኔ ትኬቶች',
      'NAV_ADD_MOVIE': 'ፊልም መዝግብ',
      'NAV_CINEMA_HALLS': 'የሲኒማ አዳራሾች',
      'NAV_ADMIN_HUB': 'አድሚን ዳሽቦርድ',
      'NAV_SIGN_IN': 'ግባ (Sign In)',
      'NAV_SIGN_OUT': 'ውጣ',
      'NAV_JOIN_FREE': 'አካውንት ክፈት',
      'NAV_CREATE_ACCOUNT': 'አዲስ አካውንት',
      'NAV_TAGLINE': 'ዘመናዊ የሲኒማ ትኬት መቁረጫ',
      'NAV_GUEST_ACCESS': 'እንግዳ',
      'NAV_GUEST_HOME': 'እንግዳ (መነሻ ገጽ)',

      // Hero & Catalog
      'HERO_TAG': '✨ በአዲስ አበባ ምርጥ የሲኒማ ተሞክሮ',
      'HERO_TITLE': 'ዘመናዊ የሲኒማ ትኬት',
      'HERO_TITLE_ACCENT': 'የቀጥታ ፕሮግራሞች',
      'HERO_SUBTITLE': 'በአይማክስ እና ዶልቢ አትሞስ ድምፅ ጥራት የታጀቡ ፊልሞችን ይመልከቱ፤ በቻፓ (Chapa) ፈጣን ክፍያ ትኬትዎን በቅጽበት ይቁረጡ።',
      'HERO_BROWSE_BTN': 'ፊልሞችን ተመልከት',
      'HERO_SCHEDULE_BTN': 'የፊልም ሰዓቶችን እይ',
      'CATALOG_TITLE': 'በአሁኑ ሰዓት የሚታዩ እና የሚመጡ ፊልሞች',
      'CATALOG_SUBTITLE': 'የሚወዱትን ፊልም ይምረጡ፣ አዳራሽና መቀመጫዎን ይዘዙ።',
      'SEARCH_PLACEHOLDER': 'ፊልም በእንግሊዝኛ ወይም በአማርኛ ርዕስ ፈልግ...',
      'GENRE_ALL': 'ሁሉም ዘውጎች',
      'GENRE_ACTION': 'አክሽን (Action)',
      'GENRE_SCI_FI': 'ሳይንስ ልብወለድ (Sci-Fi)',
      'GENRE_DRAMA': 'ድራማ (Drama)',
      'GENRE_COMEDY': 'ኮሜዲ (Comedy)',
      'GENRE_THRILLER': 'አስደማሚ (Thriller)',
      'GENRE_ROMANCE': 'የፍቅር (Romance)',
      'NO_MOVIES_FOUND': 'በዚህ ፍለጋ የተገኘ ፊልም የለም።',
      'BOOK_NOW': 'ትኬት ቁረጥ',
      'VIEW_DETAILS': 'ዝርዝር እና ሰዓት',
      'TRAILER': 'ትሬይለር',
      'DIRECTOR': 'ዳይሬክተር',
      'DURATION': 'ርዝማኔ',
      'MINUTES': 'ደቂቃ',
      'AGE_RATING': 'የዕድሜ ገደብ',
      'SHOWTIMES': 'የማሳያ ሰዓታት',
      'FROM_PRICE': 'መነሻ ዋጋ',
      'ETB': 'ብር',

      // Movie Details
      'MOVIE_SYNOPSIS': 'የፊልሙ ማጠቃለያ',
      'MOVIE_CAST': 'ተዋናዮች እና ባለሙያዎች',
      'SELECT_CINEMA_HALL': 'የሲኒማ አዳራሽ እና ሰዓት ይምረጡ',
      'SELECT_TIME_PROMPT': 'የመቀመጫ መምረጫ ገጹን ለመክፈት ከታች ከቀረቡት የማሳያ ሰዓቶች አንዱን ይጫኑ:',
      'PROCEED_SEAT_SELECTION': 'ወደ መቀመጫ መምረጫ ቀጥል',

      // Seat Picker & Chapa Payment
      'SEAT_PICKER_TITLE': 'የአዳራሽ መቀመጫ መምረጫ',
      'SCREEN_THIS_WAY': 'የሲኒማው ስክሪን በዚህ አቅጣጫ ነው',
      'SEAT_STANDARD': 'መደበኛ መቀመጫ (300 ብር)',
      'SEAT_VIP': 'ቪአይፒ ሪክላይነር (400 ብር)',
      'SEAT_SELECTED': 'የመረጡት መቀመጫ',
      'SEAT_OCCUPIED': 'የተያዘ መቀመጫ',
      'SEAT_HOLD_TIMER': 'መቀመጫዎ የተያዘው ለ',
      'SUMMARY_TITLE': 'የትኬት ማጠቃለያ',
      'CHOSEN_SEAT': 'የተመረጠው መቀመጫ',
      'BASE_PRICE': 'የመነሻ ትኬት ዋጋ',
      'VIP_UPGRADE': 'የቪአይፒ ተጨማሪ ዋጋ',
      'VAT_SERVICE': 'ቫት እና አገልግሎት (15%)',
      'TOTAL_PAYMENT': 'ጠቅላላ ክፍያ',

      // Chapa Gateway Specific
      'CHAPA_GATEWAY_TITLE': 'ቻፓ (Chapa) የቀጥታ ክፍያ ስርዓት',
      'CHAPA_GATEWAY_SUBTITLE': 'በቴሌብር፣ በሲቢኢ ብር፣ በአዋሽ፣ በባንክ ካርዶች እና ሞባይል ባንኪንግ በቀጥታ ይክፈሉ',
      'CHAPA_CUSTOMER_INFO': 'የከፋይ መረጃ እና የደረሰኝ ማረጋገጫ',
      'CHAPA_EMAIL_LABEL': 'የኢሜይል አድራሻ (ለቻፓ ደረሰኝ)',
      'CHAPA_FIRST_NAME': 'ስም',
      'CHAPA_LAST_NAME': 'የአባት ስም',
      'CHAPA_PHONE_LABEL': 'የክፍያ ስልክ ቁጥር',
      'CHAPA_PAY_BUTTON': 'በቻፓ (Chapa) ክፍያ ፈጽም',
      'CHAPA_PROCESSING': 'ከቻፓ ክፍያ ስርዓት ጋር እየተገናኘ ነው...',
      'CHAPA_SECURE_BADGE': 'በ256-ቢት የተጠበቀ የቀጥታ የቻፓ ክፍያ',
      'CHAPA_FREE_API_BADGE': 'በቻፓ የቀጥታ ኤፒአይ (Chapa API) የተረጋገጠ',

      // Ticket Confirmation & Pass
      'PASS_VERIFIED': 'ትክክለኛ የሲኒማ ትኬት ማለፊያ',
      'PASS_TITLE': 'የሲኒፍሎው የሲኒማ መግቢያ ትኬት',
      'PASS_GATE_INSTRUCTION': 'ወደ አዳራሹ ሲገቡ ይህንን የQR ኮድ በስልክዎ ያሳዩ።',
      'PASS_SEAT_NUMBER': 'የመቀመጫ ቁጥር',
      'PASS_HALL': 'የሲኒማ አዳራሽ',
      'PASS_LOCATION': 'ቅርንጫፍ',
      'PASS_SHOWTIME': 'የማሳያ ሰዓት',
      'PASS_PRICE': 'የተከፈለበት ዋጋ',
      'PASS_TXN_REF': 'የቻፓ መለያ ቁጥር',
      'PASS_DOWNLOAD_QR': 'የQR ኮድ አውርድ',
      'PASS_PRINT': 'ትኬት አትም',
      'PASS_MY_BOOKINGS': 'ወደ እኔ ትኬቶች ሂድ',

      // Booking History
      'HIST_TITLE': 'የእኔ የሲኒማ ትኬቶች',
      'HIST_SUBTITLE': 'የገዟቸውን ትኬቶች ይመልከቱ፣ QR ኮድ ያውርዱ እና ሰዓቱን ይከታተሉ',
      'HIST_TAB_UPCOMING': 'የሚመጡ ፊልሞች',
      'HIST_TAB_ATTENDED': 'የታዩ ፊልሞች',
      'HIST_TAB_ALL': 'ሁሉም ትኬቶች',
      'HIST_EMPTY': 'ምንም የተገዛ ትኬት አልተገኘም።',
      'HIST_VIEW_PASS': 'ትኬት ተመልከት',

      // Admin Hub
      'ADMIN_DASHBOARD': 'የሲኒማ አስተዳዳሪ ዳሽቦርድ',
      'ADMIN_STATS_REVENUE': 'ጠቅላላ የቦክስ ኦፊስ ገቢ',
      'ADMIN_STATS_TODAY': 'የዛሬ ሽያጭ',
      'ADMIN_STATS_TICKETS': 'የተሸጡ ትኬቶች',
      'ADMIN_STATS_SHOWS': 'ንቁ የፊልም ፕሮግራሞች',
      'ADMIN_TOP_MOVIES': 'ከፍተኛ ገቢ ያስገኙ ፊልሞች',
      'ADMIN_WEEKLY_CHART': 'የ7 ቀናት ገቢ መመልከቻ',
      'ADMIN_QUICK_ACTIONS': 'ፈጣን የአስተዳደር አቋራጮች',
      'ADMIN_ADD_MOVIE_BTN': 'አዲስ ፊልም መዝግብ',
      'ADMIN_CREATE_SCHEDULE_BTN': 'የማሳያ ፕሮግራም ፍጠር',
      'ADMIN_MANAGE_HALLS_BTN': 'አዳራሾችን አስተካክል',
      'ADMIN_VALIDATE_BTN': 'የመግቢያ QR ስካነር',
      'ADMIN_REVENUE_REPORT_BTN': 'የተሟላ የገቢ ሪፖርት',

      // Theme & Watchlist & Extra
      'THEME_DARK': 'የማታ እይታ',
      'THEME_LIGHT': 'የቀን እይታ',
      'THEME_TOGGLE_TITLE': 'የቀን/የማታ እይታን ቀይር',
      'NAV_WATCHLIST': 'የተወደዱ ፊልሞች',
      'WATCHLIST_FILTER': 'የተወደዱ ብቻ',
      'ADD_TO_WATCHLIST': 'ወደ ተወደዱ መዝግብ',
      'REMOVE_FROM_WATCHLIST': 'የተወደደ ፊልም',
      'PASS_SHARE': 'ትኬቱን አጋራ',
      'PASS_COPY_REF': 'መለያ ቁጥር ቅዳ',
      'PASS_COPIED': 'የመለያ ቁጥሩ ተቀድቷል!',

      // Footer
      'FOOTER_DESC': 'የኢትዮጵያ ቀዳሚ የዲጂታል ሲኒማ ትኬት መቁረጫ መድረክ። ምርጥ የአይማክስ እና ዶልቢ አትሞስ ድምፅ ጥራት ከፈጣን QR ትኬት ጋር።',
      'FOOTER_QUICK_NAV': 'ፈጣን ማውጫ',
      'FOOTER_BRANCHES': 'የሲኒማ ቅርንጫፎች',
      'FOOTER_ADMIN': 'የአስተዳዳሪ ክፍል',
      'FOOTER_RIGHTS': '© 2026 ሲኒፍሎው (CineFlow) ዲጂታል ሲኒማ ኔትወርክ። መብቱ በህግ የተጠበቀ ነው።',
      'FOOTER_LIVE': 'ክፍት እና ትኬት እየተቆረጠ ነው',

      // Reset Password
      'AUTH_FORGOT_PASSWORD': 'የይለፍ ቃል ረሱ?',
      'AUTH_RESET_PASSWORD_TITLE': 'የይለፍ ቃል መቀየር',
      'AUTH_RESET_PASSWORD_SUB': 'የተመዘገቡበትን ኢሜይል እና አዲሱን የይለፍ ቃል ያስገቡ። እንደተጠናቀቀ በቀጥታ ወደ ፊልሞች መነሻ ገጽ ይወሰዳሉ።',
      'AUTH_NEW_PASSWORD': 'አዲስ የይለፍ ቃል',
      'AUTH_CONFIRM_PASSWORD': 'አዲሱን የይለፍ ቃል ያረጋግጡ',
      'AUTH_RESET_SUBMIT_BTN': 'የይለፍ ቃል ቀይር እና ወደ ፊልሞች ሂድ →',
      'AUTH_BACK_TO_LOGIN': 'ወደ መግቢያ ተመለስ',
      'AUTH_RESET_SUCCESS': 'የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል! እንኳን ደህና መጡ።'
    }
  };

  constructor() {
    if (typeof localStorage !== 'undefined' && localStorage) {
      const saved = localStorage.getItem(this.STORAGE_KEY) as LanguageCode;
      if (saved && (saved === 'en' || saved === 'am')) {
        this.setLanguage(saved);
      }
    }
  }

  private getInitialLanguage(): LanguageCode {
    if (typeof localStorage !== 'undefined' && localStorage) {
      const saved = localStorage.getItem(this.STORAGE_KEY) as LanguageCode;
      if (saved === 'am' || saved === 'en') {
        return saved;
      }
    }
    return 'en';
  }

  setLanguage(lang: LanguageCode): void {
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.setItem(this.STORAGE_KEY, lang);
    }
    this.currentLang.set(lang);
    this.currentLangSubject.next(lang);
    if (typeof document !== 'undefined' && document?.documentElement) {
      document.documentElement.lang = lang;
    }
  }

  toggleLanguage(): LanguageCode {
    const nextLang = this.currentLang() === 'en' ? 'am' : 'en';
    this.setLanguage(nextLang);
    return nextLang;
  }

  getLanguage(): LanguageCode {
    return this.currentLang();
  }

  t(key: string, defaultText?: string): string {
    const lang = this.currentLang();
    const dictionary = this.translations[lang] || this.translations.en;
    if (dictionary && dictionary[key]) {
      return dictionary[key];
    }
    // Fallback to English if missing in Amharic
    if (this.translations.en[key]) {
      return this.translations.en[key];
    }
    return defaultText || key;
  }

  /**
   * Translates dynamic bilingual text (e.g., Movie title in English vs Amharic)
   */
  dynamic(enText: string, amText?: string): string {
    if (this.currentLang() === 'am' && amText && amText.trim()) {
      return amText.trim();
    }
    return enText || amText || '';
  }
}
