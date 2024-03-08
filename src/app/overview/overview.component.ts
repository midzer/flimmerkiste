import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, LowerCasePipe } from '@angular/common';

import { Blank2dashPipe } from '../blank2dash.pipe';

import { POSTS } from '../posts';
import { Post } from '../post';

@Component({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss'],
    standalone: true,
    imports: [NgFor, RouterLink, LowerCasePipe, Blank2dashPipe]
})
export class OverviewComponent {
  posts = POSTS;
  active = false;

  constructor() {}

  toggleCategory(category: string): void {
    if (this.active) {
      this.posts = POSTS;
    }
    else {
      this.posts = POSTS.filter((post: Post) => {
        return post.category.includes(category);
      });
    }
    this.active = !this.active;
  }
}
