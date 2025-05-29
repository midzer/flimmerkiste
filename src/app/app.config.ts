import { HttpClient, provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, SecurityContext } from '@angular/core';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideMarkdown } from 'ngx-markdown';
import { gfmHeadingId } from 'marked-gfm-heading-id';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    provideMarkdown({
      loader: HttpClient,
      markedExtensions: [gfmHeadingId()],
      sanitize: SecurityContext.NONE,
    }),
  ]
};
