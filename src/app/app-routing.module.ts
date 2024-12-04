import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: ':name',
    loadChildren: () => import('./content/content.module').then(mod => mod.ContentModule)
  },
  { path: '',
    loadComponent: () => import('./overview/overview.component').then(m => m.OverviewComponent)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
