import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlayerComponent } from './player/player.component';
import { EyeComponent } from './eye/eye.component';
import { ScreenComponent } from './screen/screen.component';

import { SanitizedUrlPipe } from './sanitized-url.pipe';

import { APP_CONFIG, APP_DI_CONFIG } from "./app-config";

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    EyeComponent,
    ScreenComponent,
    SanitizedUrlPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
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
