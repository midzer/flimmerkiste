import { Component, OnInit } from '@angular/core';

declare var jsSID: any;

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  sidPlayer: any;
  subTune: number = 1;
  subTunes: number;
  author: string;
  title: string;
  playTime: string;
  playing: boolean = false;
  playIcon: string = '\u25BA';
  pauseIcon: string = '\u23F8';
  playButton: string = this.playIcon;

  constructor() { }

  ngOnInit() {
    this.sidPlayer = new jsSID(16384,0.0005);
    this.sidPlayer.setloadcallback(this.initTune);
    this.sidPlayer.setstartcallback(this.showPlaytime);
    this.sidPlayer.loadinit('assets/sids/Last_Ninja_2.sid', this.subTune);
    setInterval(this.showPlaytime, 1000);
  }

  play(): void {
    if (this.playing) {
      this.sidPlayer.pause();
      this.playing = false;
      this.playButton = this.playIcon;
    }
    else {
      this.sidPlayer.playcont();
      this.playing = true;
      this.playButton = this.pauseIcon;
    }
  }

  next(): void {
    if (this.subTune === this.sidPlayer.getsubtunes() - 1) {
      this.subTune = 0;
    }
    else {
      ++this.subTune;
    }
    this.sidPlayer.start(this.subTune);
  }

  prev(): void {
    if (this.subTune === 0) {
      this.subTune = this.sidPlayer.getsubtunes() - 1;
    }
    else {
      --this.subTune;
    }
    this.sidPlayer.start(this.subTune);
  }

  initTune= () => {
    this.subTunes = this.sidPlayer.getsubtunes();
    this.author = this.removeNullFromString(this.sidPlayer.getauthor());
    this.title = this.removeNullFromString(this.sidPlayer.gettitle());
  }

  removeNullFromString(str: string): string {
    return str.replace(/\0[\s\S]*$/g,'');
  }

  showPlaytime= () => {
    var time = this.sidPlayer.getplaytime();
    var minutes = Math.floor(time / 60);
    var seconds = time % 60;
    this.playTime = this.prependZero(minutes) + ':' + this.prependZero(seconds);
  }

  prependZero(num: any): string {
    return num < 10 ? '0' + num : num;
  }
}
