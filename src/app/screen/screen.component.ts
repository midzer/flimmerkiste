import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';

import { MENU } from '../menu';

@Component({
    selector: 'app-screen',
    templateUrl: './screen.component.html',
    styleUrls: ['./screen.component.scss'],
    standalone: true,
    imports: [RouterLinkActive, RouterLink, NgFor, RouterOutlet]
})

export class ScreenComponent {
  menu = MENU;
}
