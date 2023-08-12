import { Component } from '@angular/core';

import { MENU } from '../menu'

@Component({
  selector: 'app-screen',
  templateUrl: './screen.component.html',
  styleUrls: ['./screen.component.scss']
})

export class ScreenComponent {
  menu = MENU;
}
