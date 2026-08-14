import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketValidator } from './ticket-validator';

describe('TicketValidator', () => {
  let component: TicketValidator;
  let fixture: ComponentFixture<TicketValidator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketValidator],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketValidator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
