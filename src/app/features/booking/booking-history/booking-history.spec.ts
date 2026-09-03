import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingHistory } from './booking-history';
import { CineFlowApiService } from '../../../core/services/cineflow-api.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('BookingHistory', () => {
  let component: BookingHistory;
  let fixture: ComponentFixture<BookingHistory>;
  let mockApiService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockApiService = {
      getUserBookings: vi.fn().mockReturnValue(of([]))
    };
    mockRouter = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [BookingHistory],
      providers: [
        { provide: CineFlowApiService, useValue: mockApiService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingHistory);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    mockApiService.getUserBookings.mockReturnValue(of([]));
    expect(component).toBeTruthy();
  });

  it('should load bookings on init', () => {
    const mockBookings = [
      {
        ticketId: 'ticket-1',
        movieTitle: 'Test Movie',
        movieTitleAmharic: 'ሙከራ ሚዲያ',
        seatNumber: 'A1',
        scheduleTime: '2024-12-15T18:30:00',
        cinemaHall: 'Hall 1',
        cinemaLocation: 'Addis Ababa',
        bookingDate: '2024-12-10',
        status: 'upcoming' as const,
        price: 150
      }
    ];

    mockApiService.getUserBookings.mockReturnValue(of(mockBookings));
    component.ngOnInit();

    expect(mockApiService.getUserBookings).toHaveBeenCalled();
    expect(component.bookings).toEqual(mockBookings);
    expect(component.loading).toBe(false);
  });

  it('should filter bookings by active tab', () => {
    component.bookings = [
      { status: 'upcoming', ticketId: 'ticket-1' },
      { status: 'completed', ticketId: 'ticket-2' }
    ] as any;

    component.activeTab = 'upcoming';
    expect(component.filteredBookings.length).toBe(1);

    component.activeTab = 'completed';
    expect(component.filteredBookings.length).toBe(1);

    component.activeTab = 'all';
    expect(component.filteredBookings.length).toBe(2);
  });

  it('should view ticket details', () => {
    const booking = {
      ticketId: 'ticket-123',
      status: 'upcoming'
    } as any;

    component.viewTicket(booking);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/booking-details', 'ticket-123']);
  });
});
