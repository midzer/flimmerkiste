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
      '(scroll)': 'onScroll($event)'
    }
})

export class ScreenComponent {
  menu = MENU;
  host: HTMLElement;
  hostScrolled: boolean = false;

  private readonly router = inject(Router);

  constructor(private element: ElementRef) {}

  ngOnInit() {
    this.element.nativeElement.focus();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Reset scroll position
        // after internal navigation
        this.scrollToTop();
      }
    });
  }

  onScroll(event: Event): void {
    this.host = event.target as HTMLElement;
    this.hostScrolled = this.host.scrollTop > 100;
  }

  scrollToTop(): void {
    if (this.host) {
      this.host.scrollTo({ top: 0 });
    }
  }
}
