import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { Routes, RouterModule } from '@angular/router';

import { NgxMdModule } from 'ngx-md';

import { AppComponent } from './app.component';
import { PlayerComponent } from './player/player.component';
import { EyeComponent } from './eye/eye.component';
import { ScreenComponent } from './screen/screen.component';
import { SocialComponent } from './social/social.component';
import { OverviewComponent } from './overview/overview.component';
import { Blank2dashPipe } from './blank2dash.pipe';
import { APP_CONFIG, APP_DI_CONFIG } from "./app-config";
import { ContentComponent } from './content/content.component';
import { Mp3filePipe } from './mp3file.pipe';

const routes: Routes = [
  { path: '', component: OverviewComponent },
  { path: ':name', component: ContentComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    EyeComponent,
    ScreenComponent,
    SocialComponent,
    OverviewComponent,
    Blank2dashPipe,
    ContentComponent,
    Mp3filePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(routes),
    NgxMdModule.forRoot()
  ],
  providers: [
    {
      provide: APP_CONFIG,
      useValue: APP_DI_CONFIG
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
