import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor() {}

  ngOnInit() {
    const container = document.querySelector('.container') as HTMLElement;
    container.style.visibility = 'visible';
  }
}
