import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '',
    loadComponent: () => import('./overview/overview.component').then(mod => mod.OverviewComponent)
  },
  { path: ':name',
    loadChildren: () => import('./content/content.module').then(mod => mod.ContentModule)
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
