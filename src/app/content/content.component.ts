import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { fetchJSON } from '../helper/fetch';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ContentComponent implements OnInit {
  path: string;
  name: string;
  postName: string;
  hasAudio: boolean = false;
  hasVideo: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private location: Location
  ) {}

  async ngOnInit() {
    const posts = await fetchJSON('posts');
    this.route.params.subscribe(params => {
      this.name = params['name'];
      this.path = 'assets/markdown/' + this.name + '.md';
      const name = this.name.split('-').join(' ');
      for (let i = posts.length - 1; i >= 0 ; i--) {
        const post = posts[i];
        if (post.name.toLowerCase() === name) {
          const category = post.category;
          if (category === 'DJ Sets' || category === 'Audio') {
            this.hasAudio = true;
          }
          else if (category === 'Video') {
            this.hasVideo = true;
          }
          this.postName = post.name;
          break;
        }
      }
    });
  }

  onLoad(): void {
    if (this.hasAudio) {
      const audio = document.querySelector('audio');
      const items = Array.from(document.querySelectorAll('ol > li'));
      items.forEach(item => {
        const duration = item.textContent.substring(0, 7);
        const span = document.createElement('span');
        span.className = 'jump';
        span.textContent = duration;
        span.addEventListener('click', event => {
          event.preventDefault();
          if (audio.readyState === 4) {
            audio.currentTime = this.convertDurationtoSeconds(duration);
          }
          if (audio.paused) {
            audio.play();
          }
        }, false);
        item.textContent = item.textContent.substring(7);
        item.insertAdjacentElement('afterbegin', span);
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

  share(event): void {
    if (navigator.share) {
      navigator.share({
        title: 'Flimmerkiste',
        text: this.postName,
        url: window.location.href
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
    }
    else {
      navigator.clipboard.writeText(window.location.href);
    }
    const btn = event.target;
    const img = btn.firstElementChild;
    const iconPath = 'assets/icons/';
    img.src = iconPath + 'clipboard-check.svg';
    setTimeout(() => {
      img.src = iconPath + 'share.svg';
    }, 1337);
  }

  convertDurationtoSeconds(duration: string): number {
    const [hours, minutes, seconds] = duration.split(':');
    return Number(hours) * 60 * 60 + Number(minutes) * 60 + Number(seconds);
  }
}
