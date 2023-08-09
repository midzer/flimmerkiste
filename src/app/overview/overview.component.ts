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

  toggleCategory(event) {
    const badge = event.target;
    if (badge.classList.contains('active')) {
      this.posts = POSTS;
    }
    else {
      this.posts = this.posts.filter((post: Post) => {
        return post.category.includes(event.target.textContent);
      });
    }
    badge.classList.toggle('active');
  }
}
