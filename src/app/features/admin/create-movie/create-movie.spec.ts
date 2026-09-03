import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { CreateMovie } from './create-movie';

describe('CreateMovie', () => {
  let component: CreateMovie;
  let fixture: ComponentFixture<CreateMovie>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateMovie],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateMovie);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
