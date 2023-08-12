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

  toggleCategory(category) {
    const badges = Array.from(document.querySelectorAll('.badge'));
    if (badges[0].classList.contains('active')) {
      this.posts = POSTS;
    }
    else {
      this.posts = this.posts.filter((post: Post) => {
        return post.category.includes(category);
      });
    }
    window.requestAnimationFrame(() => {
      badges.forEach(badge => {
        badge.classList.toggle('active');
      });
    });
  }
}
