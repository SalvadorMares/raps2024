import { TestBed } from '@angular/core/testing';

import { ActaService } from './acta.service';

describe('ApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ActaService = TestBed.get(ActaService);
    expect(service).toBeTruthy();
  });
});
