import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OverviewComponent }   from '../overview/overview.component';
import { ContentComponent }   from '../content/content.component';

const routes: Routes = [
  { path: '', component: OverviewComponent },
  { path: ':name', component: ContentComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class RoutingModule { }
