import { TestBed } from '@angular/core/testing';

import { DEFAULT_LANGUAGE, DEFAULT_MEDIA_TYPE } from './search-bar/search-bar';
import { SearchStateService } from './search-state.service';

describe('SearchStateService', () => {
  let service: SearchStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({ teardown: { destroyAfterEach: true } });
    service = TestBed.inject(SearchStateService);
  });

  it('should default to empty query, default language/media type and no results', () => {
    expect(service.query()).toEqual('');
    expect(service.language()).toEqual(DEFAULT_LANGUAGE);
    expect(service.mediaType()).toEqual(DEFAULT_MEDIA_TYPE);
    expect(service.results()).toEqual([]);
    expect(service.isSearching()).toEqual(false);
    expect(service.errorMessage()).toBeNull();
  });

  it('should retain values written to its signals across re-injection (singleton)', () => {
    service.query.set('matrix');
    service.language.set('en');

    const reinjected = TestBed.inject(SearchStateService);

    expect(reinjected.query()).toEqual('matrix');
    expect(reinjected.language()).toEqual('en');
  });
});
