import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { POSTS } from '../posts'

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ContentComponent implements OnInit {
  path: string;
  name: string;
  posts = POSTS;
  hasAudio: boolean = false;
  hasVideo: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.name = params['name'];
      this.path = 'assets/markdown/' + this.name + '.md';
      var name = this.name.split('-').join(' ');
      for (var i = 0; i < this.posts.length; i++) {
        if ((this.posts[i].category == 'DJ Sets' || this.posts[i].category == 'Audio')
            && this.posts[i].name.toLowerCase() == name) {
          this.hasAudio = true;
          break;
        }
        if (this.posts[i].category == 'Video'
            && this.posts[i].name.toLowerCase() == name) {
          this.hasVideo = true;
          break;
        }
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.hasAudio) {
      window.setTimeout(() => {
        const audio = document.querySelector('audio');
        const items = Array.from(document.querySelectorAll('ol > li'));
        items.forEach(item => {
          item.innerHTML = '<span class="jump">' + item.textContent.substring(0, 7) + '</span> ' + item.textContent.substring(8);
        });
        const jumpers = Array.from(document.querySelectorAll('ol > li > span'));
        jumpers.forEach(jumper => {
          jumper.addEventListener('click', event => {
            event.preventDefault();
            if (audio.readyState === 4) {
              audio.currentTime = this.convertDurationtoSeconds(jumper.textContent.substring(0, 7));
            }
            if (audio.paused) {
              audio.play();
            }
          }, false);
        });
      }, 500);
    }
  }

  goBack(): void {
    this.location.back();
  }

  convertDurationtoSeconds(duration: string): number {
    const [hours, minutes, seconds] = duration.split(':');
    return Number(hours) * 60 * 60 + Number(minutes) * 60 + Number(seconds);
  }
}
