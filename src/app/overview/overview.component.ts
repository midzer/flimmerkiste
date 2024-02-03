import { Component, OnInit } from '@angular/core';

import { fetchJSON } from '../helper/fetch';
import { Post } from '../post';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  posts: Post[];
  allPosts: Post[];
  active = false;

  constructor() {}

  async ngOnInit() {
    this.posts = this.allPosts = await fetchJSON('posts');
  }

  toggleCategory(category: string): void {
    if (this.active) {
      this.posts = this.allPosts;
    }
    else {
      this.posts = this.allPosts.filter((post: Post) => {
        return post.category.includes(category);
      });
    }
    this.active = !this.active;
  }
}
