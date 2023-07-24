import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '',
    loadChildren: () => import('./overview/overview.module').then(m => m.OverviewModule)
  },
  { path: ':name',
    loadChildren: () => import('./content/content.module').then(m => m.ContentModule)
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
