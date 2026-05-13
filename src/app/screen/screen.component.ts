import { Component, ElementRef, OnInit } from '@angular/core';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';

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

export class ScreenComponent implements OnInit {
  menu = MENU;
  host: HTMLElement;
  hostScrolled: boolean = false;

  constructor(private element: ElementRef) {}

  ngOnInit() {
    this.element.nativeElement.focus();
  }

  onScroll(event: Event): void {
    this.host = event.target as HTMLElement;
    this.hostScrolled = this.host.scrollTop > 100;
  }

  scrollToTop(): void {
    this.host.scrollTo({ top: 0 });
  }
}
