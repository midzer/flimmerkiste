import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OverviewRoutingModule } from './overview-routing.module';
import { OverviewComponent } from './overview.component';

import { Blank2dashPipe } from '../blank2dash.pipe';

@NgModule({
    imports: [
        CommonModule,
        OverviewRoutingModule,
        OverviewComponent,
        Blank2dashPipe
    ]
})
export class OverviewModule { }
