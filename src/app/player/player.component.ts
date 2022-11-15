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
  
  sids: string[];
  selectedSid: string = 'Last_Ninja_2';

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  backBuffer: ImageData;
  requestID: number;
  oldPos: number;

  constructor() {}

  async ngOnInit() {
    this.setButton(this.playVideo);
    this.video = document.getElementById('bgvid') as HTMLVideoElement;
    this.screen = document.getElementById('screen');
    this.sids = await this.fetchJSON('assets/json/sids.json');
    this.canvas = document.querySelector('canvas');
    this.canvas.width = 600;
    this.canvas.height = 400;
    this.ctx = this.canvas.getContext('2d');
    this.backBuffer = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < this.canvas.width * this.canvas.height; i++) {
        this.backBuffer.data[(i << 2) + 0] = 0x00;
        this.backBuffer.data[(i << 2) + 1] = 0x00;
        this.backBuffer.data[(i << 2) + 2] = 0x00;
        this.backBuffer.data[(i << 2) + 3] = 0xFF;
    }
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "42px Monospace";
    this.ctx.fillText('Click Play Button', 75, 100);
    this.ctx.fillText('to start visuals!', 75, 200);
  }
  
  async fetchJSON(path: string): Promise<string[]> {
    const response = await fetch(path);
    return response.json();
  }

  setup(): void {
    if (!this.sidPlayer) {
      this.sidPlayer = new jsSID(16384,0.0005);
      this.sidPlayer.loadinit('assets/sids/' + this.selectedSid + '.sid', this.subTune);
      this.sidPlayer.setloadcallback(this.initTune);
      this.sidPlayer.setstartcallback(this.showPlaytime);
      this.sidPlayer.setplaycallback(this.playCallback);
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
      window.cancelAnimationFrame(this.requestID);   
    }
    else {
      this.sidPlayer.playcont();
      this.setPlaying();
      this.redrawSpectrum();
    }
  }
  
  setPlaying(): void {
    this.playing = true;
    this.playButton = this.pauseIcon;
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
    this.setPlaying();
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
    this.setPlaying();
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

  setButton = (video: string): void => {
    this.videoButton = video;
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
    const time = parseInt(this.sidPlayer.getplaytime());
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    this.playTime = this.prependZero(minutes) + ':' + this.prependZero(seconds);
  }

  prependZero(num: number): string {
    return num.toString().padStart(2, '0');
  }
  
  selectChange($event) {
    if (this.sidPlayer) {
      this.subTune = 0;
      this.sidPlayer.loadinit('assets/sids/' + this.selectedSid + '.sid', this.subTune);
    }
  }

  playCallback= (i, freq1, freq2, freq3) => {
    this.onUpdateSpectrum(i, freq1 * 5, freq2 * 5, freq3 * 5, 1, 1, 1);
  }

  redrawSpectrum= () => {
    this.requestID = window.requestAnimationFrame(this.redrawSpectrum);
    let pos = ((this.sidPlayer.getplaytime() * 44100.) >> 6) % this.canvas.width;
    if (pos === this.oldPos) {
      return;
    }
    this.oldPos = pos;
    this.ctx.putImageData(this.backBuffer, -pos, 0);
    this.ctx.putImageData(this.backBuffer, this.canvas.width - pos, 0);
  }

  onUpdateSpectrum (i, frequency0, frequency1, frequency2, amplitude0, amplitude1, amplitude2) {
    let freq = 0
    let ampl = 0
    let column = ((i >> 7) % 600) * 4;
    let data = this.backBuffer.data;
    for (let j = 0; j < 400; j++) {
        let offset = 2400 * j + column;
        data[offset + 0] = 0x00;
        data[offset + 1] = 0x00;
        data[offset + 2] = 0x00;
        data[offset + 3] = 0xFF;
    }
    freq = Math.floor(frequency0 * 0.3) + 1;
    ampl = amplitude0 * 255;
    if (ampl > 255) ampl = 255;
    if (freq <= 399) {
        let offset = 2400 * (399 - freq) + column
        data[offset + 0] = ampl;
        data[offset + 2400] = ampl * 0.5;
        data[offset - 2400] = ampl * 0.5;
    }
    freq = Math.floor(frequency1 * 0.3) + 1;
    ampl = amplitude1 * 255;
    if (ampl > 255) ampl = 255;
    if (freq <= 399) {
        let offset = 2400 * (399 - freq) + column + 1;
        data[offset] = ampl;
        data[offset + 2400] = ampl * 0.5;
        data[offset - 2400] = ampl * 0.5;
    }
    freq = Math.floor(frequency2 * 0.3) + 1;
    ampl = amplitude2 * 255;
    if (ampl > 255) ampl = 255;
    if (freq <= 399) {
        let offset = 2400 * (399 - freq) + column + 2;
        data[offset] = ampl;
        data[offset + 2400] = ampl * 0.5;
        data[offset - 2400] = ampl * 0.5;
    }
  }
}
