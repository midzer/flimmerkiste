import { Component, OnInit, Inject } from '@angular/core';
import { APP_CONFIG, AppConfig } from '../app-config'

@Component({
  selector: 'app-eye',
  templateUrl: './eye.component.html',
  styleUrls: ['./eye.component.scss']
})
export class EyeComponent implements OnInit {
  imgPath: string;
  source: string;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.imgPath = config.imgPath;
    this.clear();
   }

  ngOnInit() {
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
    this.source = this.imgPath + eye + '.png';
    setTimeout(this.clear, 5000);
  }

  clear = (): void => {
    this.source = this.imgPath + 'transparent.png';
  }

  loop = (): void => {
    setTimeout(this.blink, Math.floor(Math.random() * 42000 + 23000));
  }
}
