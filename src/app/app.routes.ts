import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: ':name',
    loadComponent: () =>
      import('./content/content.component').then(m => m.ContentComponent)
  },
  {
    path: '',
    loadComponent: () =>
      import('./overview/overview.component').then(m => m.OverviewComponent)
  }
];
