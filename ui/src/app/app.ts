import { Component } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent, RouterOutlet],
  templateUrl: './app.html',
  host: {
    class: 'h-screen w-full flex flex-1'
  }
})
export class App {}
