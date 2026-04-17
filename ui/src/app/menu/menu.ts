import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';

import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-menu',
  imports: [MatButton, RouterLink],
  templateUrl: './menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'w-full flex flex-1'
  }
})
export class Menu {
  protected readonly isAuthenticated;

  private readonly authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);

  constructor() {
    this.isAuthenticated = this.authenticationService.isAuthenticated;
  }

  protected logout(): void {
    this.authenticationService.logout();
    this.router.navigate(['/home']);
  }
}
