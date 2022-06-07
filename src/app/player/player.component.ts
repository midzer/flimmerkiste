import { Component, OnInit, Inject } from '@angular/core';
import { APP_CONFIG, AppConfig } from '../app-config';

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
  playVideo: string = 'movie';
  pauseVideo: string = 'movie-off';
  videoButton: string;
  imgPath: string;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.imgPath = config.imgPath;
  }

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
    this.videoButton = this.imgPath + movie + '.svg';
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
