import { Component } from '@angular/core';

import { POSTS } from '../posts';
import { Post } from '../post';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
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
