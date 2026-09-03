import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { TicketValidator } from './ticket-validator';

describe('TicketValidator', () => {
  let component: TicketValidator;
  let fixture: ComponentFixture<TicketValidator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketValidator],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TicketValidator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
