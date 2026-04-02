import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';

@Component({
  selector: 'app-root',
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent, RouterOutlet],
  templateUrl: './app.html',
  host: {
    class: 'h-screen w-full flex flex-1'
  }
})
export class App {}
