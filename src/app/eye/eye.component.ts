import { Component, signal } from '@angular/core';

import { SanitizedUrlPipe } from '../sanitized-url.pipe';

@Component({
    selector: 'app-eye',
    templateUrl: './eye.component.html',
    styleUrls: ['./eye.component.scss'],
    standalone: true,
    imports: [SanitizedUrlPipe]
})

export class EyeComponent {
  eye = signal('data:,');

  ngOnInit() {
    this.loop();
  }

  blink = (): void => {
    switch (Math.floor(Math.random() * 3))
    {
      case 0:
        this.setEye('left');
        break;
      case 1:
        this.setEye('right');
        break;
      case 2:
        this.setEye('both');
        break;
    }
    this.loop();
  }

  setEye = (eye: string): void => {
    this.eye.set('/assets/images/' + eye + '.png');
    setTimeout(this.clear, 1337);
  }

  clear = (): void => {
    this.eye.set('data:,');
  }

  loop = (): void => {
    setTimeout(this.blink, Math.floor(Math.random() * 42000 + 23000));
  }
}
