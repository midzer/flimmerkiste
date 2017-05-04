import { Component, OnInit } from '@angular/core';

import { POSTS } from '../posts'

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  posts = POSTS;

  constructor() { }

  ngOnInit() {
  }

}
