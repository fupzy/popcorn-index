import { Routes } from '@angular/router';

import { authenticatedGuard } from './authentication/authenticated.guard';

export const routes: Routes = [
  { path: 'home', loadComponent: () => import('./home/home').then((m) => m.Home) },
  { path: 'search', loadComponent: () => import('./search/search/search').then((m) => m.Search) },
  {
    path: 'movie-detail/:id',
    loadComponent: () => import('./media-detail/movie-detail/movie-detail').then((m) => m.MovieDetail)
  },
  {
    path: 'series-detail/:id',
    loadComponent: () => import('./media-detail/series-detail/series-detail').then((m) => m.SeriesDetail)
  },
  {
    path: 'my-reviews',
    loadComponent: () => import('./my-reviews/my-reviews').then((m) => m.MyReviews),
    canActivate: [authenticatedGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./authentication/login/login').then((m) => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./authentication/register/register').then((m) => m.Register)
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: '**',
    loadComponent: () => import('./not-found/not-found').then((m) => m.NotFound)
  }
];
