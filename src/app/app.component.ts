import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';

import { EyeComponent } from './eye/eye.component';
import { PlayerComponent } from './player/player.component';
import { ScreenComponent } from './screen/screen.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [ScreenComponent, PlayerComponent, EyeComponent]
})
export class AppComponent {
  @ViewChild('video') video?: ElementRef<HTMLVideoElement>;

  videoPlaying = false;

  private readonly router = inject(Router);

  private sequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  private state = 0;

  toggleVideo(): void {
    if (this.videoPlaying) {
      this.video.nativeElement.pause();
    }
    else {
      this.video.nativeElement.play();
    }
    this.videoPlaying = !this.videoPlaying;
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(ev: KeyboardEvent): void {
    const key = (ev as KeyboardEvent).keyCode;

    if (key === this.sequence[this.state] || key === this.sequence[(this.state = 0)]) {
      ++this.state;

      if (this.state === this.sequence.length) {
        this.state = 0;
        this.router.navigateByUrl('/ninja');
      }
    } else {
      this.state = 0;
    }
  }
}
