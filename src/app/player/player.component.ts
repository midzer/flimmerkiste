import { Component, OnInit } from '@angular/core';

declare var jsSID: any;

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  sidPlayer: any;
  subTune: number = 0;
  subTunes: number = 13;
  author: string;
  title: string;
  playTime: string = '00:00';
  playing: boolean = false;
  playIcon: string = '\u25BA';
  pauseIcon: string = '\u23F8';
  playButton: string = this.playIcon;
  
  screen: HTMLElement;
  video: HTMLVideoElement;
  videoPlaying: boolean = false;
  playVideo: string = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' stroke-width='2' stroke='%238a8a8a' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath stroke='none' d='M0 0h24v24H0z' fill='none'%3E%3C/path%3E%3Crect x='4' y='4' width='16' height='16' rx='2'%3E%3C/rect%3E%3Cline x1='8' y1='4' x2='8' y2='20'%3E%3C/line%3E%3Cline x1='16' y1='4' x2='16' y2='20'%3E%3C/line%3E%3Cline x1='4' y1='8' x2='8' y2='8'%3E%3C/line%3E%3Cline x1='4' y1='16' x2='8' y2='16'%3E%3C/line%3E%3Cline x1='4' y1='12' x2='20' y2='12'%3E%3C/line%3E%3Cline x1='16' y1='8' x2='20' y2='8'%3E%3C/line%3E%3Cline x1='16' y1='16' x2='20' y2='16'%3E%3C/line%3E%3C/svg%3E`;
  pauseVideo: string = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' stroke-width='2' stroke='%238a8a8a' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath stroke='none' d='M0 0h24v24H0z' fill='none'%3E%3C/path%3E%3Cpath d='M8 4h10a2 2 0 0 1 2 2v10m-.592 3.42c-.362 .359 -.859 .58 -1.408 .58h-12a2 2 0 0 1 -2 -2v-12c0 -.539 .213 -1.028 .56 -1.388'%3E%3C/path%3E%3Cpath d='M8 8v12'%3E%3C/path%3E%3Cpath d='M16 4v8m0 4v4'%3E%3C/path%3E%3Cpath d='M4 8h4'%3E%3C/path%3E%3Cpath d='M4 16h4'%3E%3C/path%3E%3Cpath d='M4 12h8m4 0h4'%3E%3C/path%3E%3Cpath d='M16 8h4'%3E%3C/path%3E%3Cpath d='M3 3l18 18'%3E%3C/path%3E%3C/svg%3E`;
  videoButton: string;

  constructor() {}

  ngOnInit() {
    this.setButton(this.playVideo);
    this.video = document.getElementById('bgvid') as HTMLVideoElement;
    this.screen = document.getElementById('screen');
  }

  setup(): void {
    if (!this.sidPlayer) {
      this.sidPlayer = new jsSID(16384,0.0005);
      this.sidPlayer.setloadcallback(this.initTune);
      this.sidPlayer.setstartcallback(this.showPlaytime);
      this.sidPlayer.loadinit('assets/sids/Last_Ninja_2.sid', this.subTune);
      setInterval(this.showPlaytime, 1000);
      document.querySelector('.marquee').classList.remove('hidden');
    }
  }

  play(): void {
    this.setup();
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
    this.setup();
    if (this.subTune === this.sidPlayer.getsubtunes() - 1) {
      this.subTune = 0;
    }
    else {
      ++this.subTune;
    }
    this.sidPlayer.start(this.subTune);
  }

  prev(): void {
    this.setup();
    if (this.subTune === 0) {
      this.subTune = this.sidPlayer.getsubtunes() - 1;
    }
    else {
      --this.subTune;
    }
    this.sidPlayer.start(this.subTune);
  }

  toggle(): void {
    if (this.videoPlaying) {
      this.video.pause();
      this.screen.classList.add('fadeIn');
      this.screen.classList.remove('fadeOut');
      this.setButton(this.playVideo);
      this.videoPlaying = false;
      
    }
    else {
      this.video.play();
      this.screen.classList.add('fadeOut');
      this.screen.classList.remove('fadeIn');
      this.setButton(this.pauseVideo);
      this.videoPlaying = true;
    }
  }

  setButton = (movie: string): void => {
    this.videoButton = movie;
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
