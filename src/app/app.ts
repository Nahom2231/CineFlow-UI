import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from './core/services/auth';
import { TranslationService, LanguageCode } from './core/services/translation.service';
import { TranslatePipe } from './core/pipes/translate.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  authService = inject(AuthService);
  translationService = inject(TranslationService);
  router = inject(Router);

  isLoggedIn$ = this.authService.isLoggedIn$;
  mobileMenuOpen = false;
  langDropdownOpen = false;

  get currentLang(): LanguageCode {
    return this.translationService.getLanguage();
  }

  get languages() {
    return this.translationService.languages;
  }

  toggleLanguage(): void {
    this.translationService.toggleLanguage();
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
