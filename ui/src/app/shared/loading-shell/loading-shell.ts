import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

/**
 * Wraps an async-state UI in a single shell: shows a spinner while loading,
 * an error alert if an error message is provided, and otherwise projects
 * the host's content. Loading takes precedence over error.
 */
@Component({
  selector: 'app-loading-shell',
  imports: [MatProgressSpinner],
  templateUrl: './loading-shell.html',
  host: {
    class: 'contents'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingShell {
  public readonly isLoading = input<boolean>(false);
  public readonly errorMessage = input<string | null>(null);
}
