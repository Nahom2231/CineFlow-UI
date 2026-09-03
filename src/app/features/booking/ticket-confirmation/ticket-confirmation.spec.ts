import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketConfirmation } from './ticket-confirmation';
import { Router } from '@angular/router';

describe('TicketConfirmation', () => {
  let component: TicketConfirmation;
  let fixture: ComponentFixture<TicketConfirmation>;
  let mockRouter: any;

  beforeEach(async () => {
    mockRouter = {
      navigate: vi.fn(),
      getCurrentNavigation: vi.fn().mockReturnValue(null)
    };

    await TestBed.configureTestingModule({
      imports: [TicketConfirmation],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TicketConfirmation);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should download QR code', () => {
    component.qrCodeUrl = 'data:image/png;base64,...';
    component.ticketId = 'test-123';
    
    const clickSpy = vi.fn();
    vi.spyOn(document, 'createElement').mockReturnValue({
      click: clickSpy,
      href: '',
      download: ''
    } as any);

    component.downloadQRCode();
    expect(document.createElement).toHaveBeenCalledWith('a');
  });

  it('should navigate back to movies', () => {
    component.goToMovies();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/movies']);
  });
});
