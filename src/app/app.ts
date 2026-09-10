import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth';
import { TranslationService, LanguageCode } from './core/services/translation.service';
import { ThemeService, ThemeMode } from './core/services/theme.service';
import { NotificationService } from './core/services/notification.service';
import { TranslatePipe } from './core/pipes/translate.pipe';
import { ToastComponent } from './core/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  authService = inject(AuthService);
  translationService = inject(TranslationService);
  themeService = inject(ThemeService);
  notificationService = inject(NotificationService);
  router = inject(Router);

  isLoggedIn$ = this.authService.isLoggedIn$;
  mobileMenuOpen = false;
  langDropdownOpen = false;
  currentUrl = signal<string>(this.router.url || '');

  constructor() {
    this.router.events
      .pipe(filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl.set(event.urlAfterRedirects || event.url);
      });
  }

  isLoginPage(): boolean {
    const url = this.currentUrl().toLowerCase();
    return url.includes('/auth/login') || url.includes('/auth');
  }

  get currentLang(): LanguageCode {
    return this.translationService.getLanguage();
  }

  get languages() {
    return this.translationService.languages;
  }

  get currentTheme(): ThemeMode {
    return this.themeService.currentTheme();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleLanguage(): void {
    const nextLang = this.translationService.toggleLanguage();
    const langLabel = nextLang === 'am' ? 'አማርኛ' : 'English';
    this.notificationService.info(`Language set to ${langLabel}`, 'Language');
  }

  setLanguage(lang: LanguageCode): void {
    this.translationService.setLanguage(lang);
    this.langDropdownOpen = false;
  }

  toggleLangDropdown(): void {
    this.langDropdownOpen = !this.langDropdownOpen;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    this.langDropdownOpen = false;
  }

  getUserEmail(): string {
    return this.authService.getUserEmail() || 'Member';
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
    this.router.navigate(['/movies']);
  }
}
