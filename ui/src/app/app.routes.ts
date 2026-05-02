import { Routes } from '@angular/router';

import { Home } from './home/home';
import { NotFound } from './not-found/not-found';
import { Login } from './authentication/login/login';
import { Register } from './authentication/register/register';
import { MovieDetail } from './media-detail/movie-detail/movie-detail';
import { SeriesDetail } from './media-detail/series-detail/series-detail';
import { Search } from './search/search/search';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'search', component: Search },
  { path: 'movie-detail/:id', component: MovieDetail },
  { path: 'series-detail/:id', component: SeriesDetail },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', component: NotFound }
];
