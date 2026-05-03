import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

/**
 * Renders a Material icon button that navigates back through browser history,
 * leaning on `Location.back()` so any preserved state on the previous page
 * (form values, scroll position, etc.) stays intact.
 */
@Component({
  selector: 'app-back-button',
  imports: [MatIconButton, MatIcon],
  templateUrl: './back-button.html',
  host: {
    class: 'block mb-4'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackButton {
  private readonly location = inject(Location);

  protected goBack(): void {
    this.location.back();
  }
}
