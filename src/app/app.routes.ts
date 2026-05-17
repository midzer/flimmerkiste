import { Routes } from '@angular/router';

import { OverviewComponent } from './overview/overview.component';

export const routes: Routes = [
  {
    path: '',
    component: OverviewComponent,
    title: 'Flimmerkiste'
  },
  {
    path: ':name',
    loadComponent: () =>
      import('./content/content.component').then(m => m.ContentComponent)
  }
];
