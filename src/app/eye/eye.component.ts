import { Component, OnInit, Inject } from '@angular/core';
import { APP_CONFIG, AppConfig } from '../app-config'

@Component({
  selector: 'app-eye',
  templateUrl: './eye.component.html',
  styleUrls: ['./eye.component.scss']
})
export class EyeComponent implements OnInit {
  imgPath: string;
  leftEye: string = 'left-eye.png';
  rightEye: string = 'right-eye.png';
  bothEyes: string = 'both-eyes.png';
  transparent: string = 'transparent.png';
  minDelay: number = 15000;
  maxDelay: number = 42000;
  duration: number = 500;
  source: string;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.imgPath = config.imgPath;
    this.clear();
   }

  ngOnInit() {
    setTimeout(this.loop, this.minDelay);
  }

  loop= () => {
    switch (Math.floor((Math.random() * 3)))
    {
      case 0:
      this.blink(this.leftEye);
      break;
      case 1:
      this.blink(this.rightEye);
      break;
      case 2:
      this.blink(this.bothEyes);
      break;
    }
    setTimeout(this.loop, Math.floor((Math.random() * this.maxDelay) + this.minDelay));
  }

  blink(eye: string): void {
    this.source = this.imgPath + eye;
    setTimeout(this.clear, this.duration);
  }

  clear= () => {
    this.source = this.imgPath + this.transparent;
  }
}
