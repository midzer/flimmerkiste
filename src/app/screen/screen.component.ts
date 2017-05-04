import { Component, OnInit } from '@angular/core';

import { MENU } from '../menu'

@Component({
  selector: 'app-screen',
  templateUrl: './screen.component.html',
  styleUrls: ['./screen.component.scss']
})

export class ScreenComponent implements OnInit {
  menu = MENU;
  cursor: string;
  state: string;

  constructor() { }

  ngOnInit() {
  }

  show(): void {
    this.cursor = 'auto';
    this.state = 'running';
  }
}
