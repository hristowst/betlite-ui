import { TestBed } from '@angular/core/testing';

import { BetslipService } from './betslip.service';

describe('BetslipService', () => {
  let service: BetslipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BetslipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
