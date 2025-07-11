import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';

import { MarkdownComponent } from 'ngx-markdown';

import { POSTS } from '../posts';
import { WebmfilePipe } from '../webmfile.pipe';
import { Mp4filePipe } from '../mp4file.pipe';
import { Mp3filePipe } from '../mp3file.pipe';

@Component({
    selector: 'app-content',
    templateUrl: './content.component.html',
    styleUrls: ['./content.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [MarkdownComponent, Mp3filePipe, Mp4filePipe, WebmfilePipe]
})
export class ContentComponent implements OnInit {
  path: string;
  name: string;
  posts = POSTS;
  hasAudio: boolean = false;
  hasVideo: boolean = false;
  baseTitle = "midzer's Flimmerkiste";

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.name = params['name'];
      this.path = '/assets/markdown/' + this.name + '.md';
      let pageTitle = this.name;
      const name = this.name.split('-').join(' ');
      for (let i = this.posts.length - 1; i >= 0 ; i--) {
        const post = this.posts[i];
        if (post.name.toLowerCase() === name) {
          pageTitle = post.name;
          switch (post.category) {
            case 'DJ Sets':
            case 'Audio':
              this.hasAudio = true;
              break;
            case 'Video':
              this.hasVideo = true;
              break;
          }
          break;
        }
      }
      this.titleService.setTitle(pageTitle + ' | ' + this.baseTitle);
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
    const hash = window.location.hash;
    if (hash) {
      const id = window.decodeURIComponent(hash).replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView();
      }
    }
    const elements = document.querySelectorAll('[id]:not(h1)');
    elements.forEach(element => {
      const id = element.id;
      const anchor = document.createElement('a');
      anchor.className = 'anchor-link';
      anchor.href = window.location.origin + window.location.pathname + '#' + id;
      anchor.textContent = '#';
      element.append(anchor);
    });
  }

  goBack(): void {
    this.location.back();
  }

  share(event): void {
    if (navigator.share) {
      navigator.share({
        title: this.titleService.getTitle(),
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
    const iconPath = '/assets/icons/';
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
