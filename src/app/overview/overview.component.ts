import { Component, inject } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { LowerCasePipe } from '@angular/common';

import { Blank2dashPipe } from '../blank2dash.pipe';
import { POSTS } from '../posts';
import { Post } from '../post';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  standalone: true,
  imports: [RouterLink, LowerCasePipe, Blank2dashPipe],
})
export class OverviewComponent {
  posts = POSTS;
  active = false;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit() {
    const category = this.route.snapshot.queryParamMap.get('cat');
    if (!category) return;

    this.posts = POSTS.filter((post: Post) => post.category.includes(category));
    this.active = true;
  }

  toggleCategory(category: string): void {
    this.active = !this.active;

    if (this.active) {
      this.posts = POSTS.filter((post: Post) => post.category.includes(category));
    } else {
      this.posts = POSTS;
    }

    const nextParams = this.active ? { cat: category } : {};
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: nextParams,
      queryParamsHandling: '',
      replaceUrl: true,
    });
  }
}
