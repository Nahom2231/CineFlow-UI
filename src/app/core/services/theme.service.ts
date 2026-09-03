import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeMode = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'cineflow_theme';

  private currentThemeSubject = new BehaviorSubject<ThemeMode>(this.getInitialTheme());
  public currentTheme$ = this.currentThemeSubject.asObservable();
  public currentTheme = signal<ThemeMode>(this.getInitialTheme());

  constructor() {
    this.applyTheme(this.currentTheme());
    this.listenToSystemPreference();
  }

  private getInitialTheme(): ThemeMode {
    const saved = localStorage.getItem(this.STORAGE_KEY) as ThemeMode;
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    // Default to dark mode for cinema experience, or system preference
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  public toggleTheme(): ThemeMode {
    const newTheme: ThemeMode = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    return newTheme;
  }

  public setTheme(mode: ThemeMode): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, mode);
    }
    this.currentTheme.set(mode);
    this.currentThemeSubject.next(mode);
    this.applyTheme(mode);
  }

  public isDarkMode(): boolean {
    return this.currentTheme() === 'dark';
  }

  private applyTheme(mode: ThemeMode): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-theme', mode);
    if (mode === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }

  private listenToSystemPreference(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        // Only auto-switch if user hasn't explicitly set a preference
        if (!saved) {
          const newTheme: ThemeMode = e.matches ? 'dark' : 'light';
          this.setTheme(newTheme);
        }
      });
    }
  }
}
