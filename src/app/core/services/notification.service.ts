import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  durationMs?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public toasts = signal<ToastMessage[]>([]);

  public show(type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string, durationMs = 4000): void {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, message, title, durationMs };

    this.toasts.update(current => [...current, toast]);

    if (durationMs > 0) {
      setTimeout(() => {
        this.remove(id);
      }, durationMs);
    }
  }

  public success(message: string, title?: string): void {
    this.show('success', message, title || 'Success');
  }

  public error(message: string, title?: string): void {
    this.show('error', message, title || 'Notice');
  }

  public info(message: string, title?: string): void {
    this.show('info', message, title || 'Info');
  }

  public warning(message: string, title?: string): void {
    this.show('warning', message, title || 'Warning');
  }

  public remove(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  public clearAll(): void {
    this.toasts.set([]);
  }
}
