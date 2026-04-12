import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-menu',
  imports: [MatButton, RouterLink],
  templateUrl: './menu.html'
})
export class Menu {}
