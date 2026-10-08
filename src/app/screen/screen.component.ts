import { Component, ElementRef, inject } from '@angular/core';
import { RouterLinkActive, RouterLink, RouterOutlet, Router, NavigationEnd } from '@angular/router';

import { MENU } from '../menu';

@Component({
    selector: 'app-screen',
    templateUrl: './screen.component.html',
    styleUrls: ['./screen.component.scss'],
    standalone: true,
    imports: [RouterLinkActive, RouterLink, RouterOutlet],
    host: {
      'tabindex': '-1',
      '(scroll)': 'onScroll()'
    }
})

export class ScreenComponent {
  menu = MENU;

  private readonly router = inject(Router);
  private readonly host = inject(ElementRef).nativeElement;


  ngOnInit() {
    this.host.focus();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Reset scroll position
        // after internal navigation
        this.scrollToTop();
      }
    });
  }

  onScroll(): void {}

  scrollToTop(): void {
    this.host.scrollTo({ top: 0 });
  }
}
