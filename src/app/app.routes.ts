import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.Home)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
  },
  {
    path: 'catalogue',
    loadComponent: () => import('./features/catalog/catalog').then(m => m.Catalog),
    canActivate: [authGuard]
  },
  {
    path: 'books/:id',
    loadComponent: () => import('./features/book-detail/book-detail').then(m => m.BookDetail),
    canActivate: [authGuard]
  },

  {
    path: 'profil',
    loadComponent: () => import('./features/profile/profile').then(m => m.Profile),
    canActivate: [authGuard]
  },

  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'favoris', pathMatch: 'full' },
      {
        path: 'favoris',
        loadComponent: () => import('./features/dashboard/tabs/favorites-tab/favorites-tab').then(m => m.FavoritesTab)
      },
      {
        path: 'notes',
        loadComponent: () => import('./features/dashboard/tabs/ratings-tab/ratings-tab').then(m => m.RatingsTab)
      },
      {
        path: 'a-lire',
        loadComponent: () => import('./features/dashboard/tabs/reading-list-tab/reading-list-tab').then(m => m.ReadingListTab)
      },
      {
        path: 'affinites',
        loadComponent: () => import('./features/similar-users/similar-users').then(m => m.SimilarUsers)
      },
    ],
  },

  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin').then(m => m.Admin),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'stats', pathMatch: 'full' },
      {
        path: 'stats',
        loadComponent: () => import('./features/admin/tabs/admin-stats/admin-stats').then(m => m.AdminStats)
      },
      {
        path: 'utilisateurs',
        loadComponent: () => import('./features/admin/tabs/admin-users/admin-users').then(m => m.AdminUsers)
      },
    ],
  },

  {
    path: 'utilisateurs-similaires',
    redirectTo: '/dashboard/affinites',
    pathMatch: 'full'
  },

  {
  path: 'confidentialite',
  loadComponent: () =>
    import('./features/privacy/privacy').then(m => m.Privacy),
},
];