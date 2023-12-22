import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-eye',
  templateUrl: './eye.component.html',
  styleUrls: ['./eye.component.scss']
})
export class EyeComponent implements AfterViewInit {
  eye: string = 'data:,';

  constructor(
    private router: Router
  ) {}

  ngAfterViewInit() {
    this.loop();

    const sequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    let state = 0;
    document.addEventListener('keyup', (ev) => {
      const key = ev.keyCode;

			if (key === sequence[state] || key === sequence[(state = 0)]) {
				// move next
				++state;
				
				if (state === sequence.length) {
          // sequence complete
          this.router.navigateByUrl('/hidden');
          
          // reset
          state = 0;	
				}
			}
    });
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
