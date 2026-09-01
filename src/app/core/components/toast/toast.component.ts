import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ToastMessage } from '../../services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="toasts().length > 0">
      <div 
        *ngFor="let toast of toasts()" 
        class="toast-item" 
        [ngClass]="'toast-' + toast.type"
      >
        <div class="toast-icon">
          <span *ngIf="toast.type === 'success'">✅</span>
          <span *ngIf="toast.type === 'error'">🚨</span>
          <span *ngIf="toast.type === 'warning'">⚠️</span>
          <span *ngIf="toast.type === 'info'">ℹ️</span>
        </div>
        <div class="toast-content">
          <h4 class="toast-title" *ngIf="toast.title">{{ toast.title }}</h4>
          <p class="toast-message">{{ toast.message }}</p>
        </div>
        <button class="toast-close" (click)="remove(toast.id)" aria-label="Close notification">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 420px;
      width: calc(100vw - 48px);
      pointer-events: none;
    }

    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 16px 20px;
      border-radius: 14px;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      animation: slideInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      transition: all 0.3s ease;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .toast-success {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95));
      border-color: rgba(52, 211, 153, 0.4);
    }

    .toast-error {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95));
      border-color: rgba(248, 113, 113, 0.4);
    }

    .toast-warning {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(217, 119, 6, 0.95));
      border-color: rgba(252, 211, 77, 0.4);
    }

    .toast-info {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(79, 70, 229, 0.95));
      border-color: rgba(165, 180, 252, 0.4);
    }

    .toast-icon {
      font-size: 1.4rem;
      flex-shrink: 0;
      line-height: 1;
      margin-top: 2px;
    }

    .toast-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .toast-title {
      font-size: 0.95rem;
      font-weight: 700;
      margin: 0;
      color: #ffffff;
    }

    .toast-message {
      font-size: 0.88rem;
      margin: 0;
      line-height: 1.4;
      color: rgba(255, 255, 255, 0.92);
    }

    .toast-close {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      font-size: 1.4rem;
      cursor: pointer;
      line-height: 1;
      padding: 0 4px;
      margin-left: 4px;
      transition: color 0.2s;
    }

    .toast-close:hover {
      color: #ffffff;
    }
  `]
})
export class ToastComponent {
  private notificationService = inject(NotificationService);

  get toasts() {
    return this.notificationService.toasts;
  }

  remove(id: string): void {
    this.notificationService.remove(id);
  }
}
