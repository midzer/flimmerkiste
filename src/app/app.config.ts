import { HttpClient, provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, SecurityContext } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { MARKED_EXTENSIONS, provideMarkdown, SANITIZE } from 'ngx-markdown';
import { gfmHeadingId } from 'marked-gfm-heading-id';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    provideMarkdown({
      loader: HttpClient,
      markedExtensions: [{
        provide: MARKED_EXTENSIONS,
        useFactory: gfmHeadingId,
        multi: true
      }],
      sanitize: {
        provide: SANITIZE,
        useValue: SecurityContext.NONE
      },
    })
  ]
};
