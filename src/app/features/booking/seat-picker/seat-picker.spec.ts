import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { SeatPicker } from './seat-picker';

describe('SeatPicker', () => {
  let component: SeatPicker;
  let fixture: ComponentFixture<SeatPicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatPicker],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SeatPicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
