import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';

import { gfmHeadingId } from 'marked-gfm-heading-id';

import { ContentRoutingModule } from './content-routing.module';
import { ContentComponent } from './content.component';

import { Mp3filePipe } from '../mp3file.pipe';
import { Mp4filePipe } from '../mp4file.pipe';
import { WebmfilePipe } from '../webmfile.pipe';

@NgModule({ imports: [CommonModule,
        ContentRoutingModule,
        MarkdownModule.forRoot({
            markedExtensions: [gfmHeadingId()],
        }),
        ContentComponent,
        Mp3filePipe,
        Mp4filePipe,
        WebmfilePipe], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class ContentModule { }
