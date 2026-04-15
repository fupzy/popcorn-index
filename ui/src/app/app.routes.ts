import { Routes } from '@angular/router';

import { Home } from './home/home';
import { NotFound } from './not-found/not-found';
import { Register } from './authentication/register/register';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'register', component: Register },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', component: NotFound }
];
