import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';

import { ContentRoutingModule } from './content-routing.module';
import { ContentComponent } from './content.component';

import { Mp3filePipe } from '../mp3file.pipe';
import { Mp4filePipe } from '../mp4file.pipe';
import { WebmfilePipe } from '../webmfile.pipe';

@NgModule({
  imports: [
    CommonModule,
    ContentRoutingModule,
    HttpClientModule,
    MarkdownModule.forRoot()
  ],
  declarations: [
    ContentComponent,
    Mp3filePipe,
    Mp4filePipe,
    WebmfilePipe
  ]
})
export class ContentModule { }
