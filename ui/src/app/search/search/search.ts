import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';

import { SearchBar, SearchRequest } from '../search-bar/search-bar';
import { SearchResult } from '../search-result/search-result';
import { SearchStateService } from '../search-state.service';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-search',
  imports: [SearchBar, SearchResult, MatCard, MatCardHeader, MatCardContent],
  templateUrl: './search.html',
  host: {
    class: 'flex flex-col flex-1 h-full w-full min-h-0'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Search {
  protected readonly state = inject(SearchStateService);

  private readonly searchService = inject(SearchService);

  protected onSearch(request: SearchRequest): void {
    if (this.state.isSearching()) {
      return;
    }

    this.state.query.set(request.query);
    this.state.language.set(request.language);
    this.state.mediaType.set(request.mediaType);
    this.state.isSearching.set(true);
    this.state.errorMessage.set(null);

    this.searchService.search(request.query, request.language, request.mediaType).subscribe({
      next: (response) => {
        this.state.results.set(response.results);
        this.state.isSearching.set(false);
      },
      error: () => {
        this.state.results.set([]);
        this.state.errorMessage.set('Unable to search movies. Please try again.');
        this.state.isSearching.set(false);
      }
    });
  }
}
