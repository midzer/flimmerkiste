import { Component } from '@angular/core';

import { EyeComponent } from './eye/eye.component';
import { PlayerComponent } from './player/player.component';
import { ScreenComponent } from './screen/screen.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [ScreenComponent, PlayerComponent, EyeComponent]
})
export class AppComponent {

  constructor() {}

}
