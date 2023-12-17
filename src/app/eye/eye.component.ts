import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-eye',
  templateUrl: './eye.component.html',
  styleUrls: ['./eye.component.scss']
})
export class EyeComponent implements AfterViewInit {
  eye: string = 'data:,';

  ngAfterViewInit() {
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
    this.eye = 'assets/images/' + eye + '.png';
    setTimeout(this.clear, 1337);
  }

  clear = (): void => {
    this.eye = 'data:,';
  }

  loop = (): void => {
    setTimeout(this.blink, Math.floor(Math.random() * 42000 + 23000));
  }
}
