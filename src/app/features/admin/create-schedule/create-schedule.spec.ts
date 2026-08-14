import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSchedule } from './create-schedule';

describe('CreateSchedule', () => {
  let component: CreateSchedule;
  let fixture: ComponentFixture<CreateSchedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSchedule],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSchedule);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
