import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MovieCatalog } from './movie-catalog';

describe('MovieCatalog', () => {
  let component: MovieCatalog;
  let fixture: ComponentFixture<MovieCatalog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieCatalog],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MovieCatalog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
