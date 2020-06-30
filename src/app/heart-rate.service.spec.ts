import { TestBed } from '@angular/core/testing';

import { HeartRateService } from './heart-rate.service';

describe('HeartRateService', () => {
  let service: HeartRateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeartRateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
