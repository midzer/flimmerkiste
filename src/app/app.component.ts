import { Component, ViewChild, ElementRef } from '@angular/core';

import { EyeComponent } from './eye/eye.component';
import { PlayerComponent } from './player/player.component';
import { ScreenComponent } from './screen/screen.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [ScreenComponent, PlayerComponent, EyeComponent]
})

export class AppComponent {

  @ViewChild('video') video: ElementRef<HTMLVideoElement>;

  videoPlaying: boolean = false;

  constructor() {}

  toggleVideo(): void {
    if (this.videoPlaying) {
      this.video.nativeElement.pause();
    }
    else {
      this.video.nativeElement.play();
    }
    this.videoPlaying = !this.videoPlaying;
  }

}
