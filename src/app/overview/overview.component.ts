import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LowerCasePipe } from '@angular/common';

import { Blank2dashPipe } from '../blank2dash.pipe';

import { POSTS } from '../posts';
import { Post } from '../post';

@Component({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss'],
    standalone: true,
    imports: [RouterLink, LowerCasePipe, Blank2dashPipe]
})

export class OverviewComponent implements OnInit {
  posts = POSTS;
  active = false;

  constructor() {}

  ngOnInit() {
    const query = window.location.search;
    if (!query) {
      return;
    }
    const params = new URLSearchParams(query);
    const category = params.get('cat');
    if (!category) {
      return;
    }
    this.posts = POSTS.filter((post: Post) => {
      return post.category.includes(category);
    });
    this.active = true;
  }

  toggleCategory(category: string): void {
    this.active = !this.active;
    const searchParams = new URLSearchParams(window.location.search);
    if (this.active) {
      this.posts = POSTS.filter((post: Post) => {
        return post.category.includes(category);
      });
      searchParams.set('cat', category);
    }
    else {
      this.posts = POSTS;
      searchParams.delete('cat');
    }
    const params = searchParams.toString();
    const newRelativePathQuery = window.location.pathname + (params ? '?' + params : '');
    window.history.replaceState({}, '', newRelativePathQuery);
  }
}
