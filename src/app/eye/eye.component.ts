import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-eye',
  templateUrl: './eye.component.html',
  styleUrls: ['./eye.component.scss']
})
export class EyeComponent implements AfterViewInit {
  source: string = 'data:,';

  ngAfterViewInit() {
    this.loop();
  }

  blink = (): void => {
    let eye: string;
    switch (Math.floor(Math.random() * 3))
    {
      case 0:
        eye = 'left';
        break;
      case 1:
        eye = 'right';
        break;
      case 2:
        eye = 'both';
        break;
    }
    this.setEye(eye);
    this.loop();
  }

  setEye = (eye: string): void => {
    this.source = 'assets/images/' + eye + '.png';
    setTimeout(this.clear, 1337);
  }

  clear = (): void => {
    this.source = 'data:,';
  }

  loop = (): void => {
    setTimeout(this.blink, Math.floor(Math.random() * 42000 + 23000));
  }
}
