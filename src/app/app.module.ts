import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { MarkdownModule } from 'angular2-markdown';
import { RoutingModule } from './routing/routing.module';

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
    MarkdownModule.forRoot(),
    RoutingModule
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
