import { TestBed } from '@angular/core/testing';

import { Cinema } from './cinema';

describe('Cinema', () => {
  let service: Cinema;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cinema);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
