import { provideExperimentalZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';
import { FormsModule } from '@angular/forms';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';

bootstrapApplication(AppComponent, {
    providers: [provideExperimentalZonelessChangeDetection(), importProvidersFrom(BrowserModule, FormsModule, AppRoutingModule)]
});
