import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { POSTS } from '../posts'

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
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

  goBack(): void {
    this.location.back();
  }
}
