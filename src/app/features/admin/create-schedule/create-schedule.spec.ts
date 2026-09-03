import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { CreateSchedule } from './create-schedule';

describe('CreateSchedule', () => {
  let component: CreateSchedule;
  let fixture: ComponentFixture<CreateSchedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSchedule],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSchedule);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
