import { Component, AfterViewInit } from '@angular/core';

declare var ScripTracker: any;
declare var jsSID: any;

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements AfterViewInit {
  modPlayer: any;
  sidPlayer: any;
  subTune: number = 0;
  subTunes: number = 13;
  info: string;
  intervalID: number;
  playTime: string = '00:00';
  playing: boolean = false;
  playIcon: string = 'assets/images/player-play.svg';
  pauseIcon: string = 'assets/images/player-pause.svg';
  playButton: string = this.playIcon;
  
  screen: HTMLElement;
  video: HTMLVideoElement;
  videoPlaying: boolean = false;
  playVideoIcon: string = 'assets/images/movie.svg';
  pauseVideoIcon: string = 'assets/images/movie-off.svg';
  videoButtonIcon: string = this.playVideoIcon;

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  backBuffer: ImageData;
  requestID: number;
  oldPos: number;

  optgroupLabel: string = 'SIDS';
  loadedTune: string;
  selectedTune: string = 'Last_Ninja_2';
  mods: string[] = [];
  sids: string[] = [this.selectedTune];

  ngAfterViewInit() {
    this.canvas = document.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.backBuffer = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    /*for (let i = 0; i < canvas.width * canvas.height; i++) {
      this.backBuffer.data[(i << 2) + 0] = 0x00;
      this.backBuffer.data[(i << 2) + 1] = 0x00;
      this.backBuffer.data[(i << 2) + 2] = 0x00;
      this.backBuffer.data[(i << 2) + 3] = 0xFF;
    }*/
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "100px Monospace";
    this.ctx.fillText('Click me', 50, 150);
    this.ctx.fillText('to start', 50, 300);

    const hash = window.location.hash;
    if (hash) {
      const tune = window.decodeURIComponent(hash).replace('#', '');
      let label;
      if (this.sids.includes(tune)) {
        label = 'SIDS';
      }
      else if (this.mods.includes(tune)) {
        label = 'MODS';
      }
      if (label) {
        this.selectedTune = tune;
        if (window.navigator.maxTouchPoints > 1) {
          // Hack to play on mobile
          window.addEventListener('click', () => {
            this.setup(label);
          }, { once: true });
        }
        else {
          this.setup(label);
        }
      }
    }

    Promise.all([
      this.fetchJSON('mods'),
      this.fetchJSON('sids')
    ])
    .then(([mods, sids]) => {
      this.mods = mods;
      this.sids = sids;
    });
  }

  trackByFunc = (index: number, value: string) => value;

  async fetchJSON(file): Promise<any> {
    const response = await window.fetch(`assets/json/${file}.json`);
    return await response.json();
  }

  setup(label: string): void {
    if (label === 'MODS') {
      this.setupModPlayer();
      this.sidPlayer = null;
    }
    else {
      this.setupSidPlayer();
      this.modPlayer = null;
    }
    this.optgroupLabel = label;
  }

  setupSidPlayer(): void {
    this.loadScript('jsSID.js').then(() => {
      this.sidPlayer = new jsSID(16384,0.0005);
      this.sidPlayer.setloadcallback(this.initTune);
      this.sidPlayer.setplaycallback(this.playCallback);
      this.loadTune();
      this.toggleTune();
    });
  }

  setupModPlayer(): void {
    this.loadScript('scriptracker-1.1.1.min.js').then(() => {
      this.modPlayer = new ScripTracker();
      this.modPlayer.on(ScripTracker.Events.playerReady, (player, songName, songLength) => {
        this.subTune = 0;
        this.subTunes = songLength;
        this.info = songName;
        this.playing = false;
        this.toggleTune();
      });
      this.modPlayer.on(ScripTracker.Events.order, (player, currentOrder, songLength, patternIndex) => {
        this.subTune = currentOrder - 1;
        this.subTunes = songLength;
        this.playTime = 'Pt ' + patternIndex;
      });
      this.loadTune();
    });
  }

  loadScript (file): Promise<any> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.async = true;
      script.src = `/assets/js/${file}`;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  play(): void {
    if (this.loadedTune && this.loadedTune === this.selectedTune) {
      this.toggleTune();
    }
    else {
      this.setup(this.getLabel());
    }
  }

  toggleTune(): void {
    if (this.playing) {
      if (this.modPlayer) {
        this.modPlayer.stop();
      }
      else {
        window.clearInterval(this.intervalID);
        this.sidPlayer.pause();
        window.cancelAnimationFrame(this.requestID);
      }
      this.playButton = this.playIcon;
    }
    else {
      if (this.modPlayer) {
        this.modPlayer.play();
      }
      else {
        this.intervalID = window.setInterval(this.showPlaytime, 1000);
        this.sidPlayer.playcont();
        this.redrawSpectrum();
      }
      this.playButton = this.pauseIcon;
    }
    this.playing = !this.playing;
  }

  next(): void {
    if (this.modPlayer) {
      this.modPlayer.nextOrder();
    }
    else if (this.sidPlayer) {
      if (this.subTune === this.sidPlayer.getsubtunes() - 1) {
        this.subTune = 0;
      }
      else {
        ++this.subTune;
      }
      this.sidPlayer.start(this.subTune);
    }
    else {
      this.setup(this.getLabel());
    }
  }

  prev(): void {
    if (this.modPlayer) {
      this.modPlayer.prevOrder();
    }
    else if (this.sidPlayer) {
      if (this.subTune === 0) {
        this.subTune = this.sidPlayer.getsubtunes() - 1;
      }
      else {
        --this.subTune;
      }
      this.sidPlayer.start(this.subTune);
    }
    else {
      this.setup(this.getLabel());
    }
  }

  copy(event) {
    const btn = event.target;
    const copyTune = btn.dataset.descr;
    const info = btn.firstElementChild;
    info.classList.add('copied');
    const oldInfo = this.info;
    btn.dataset.descr = this.info = 'Copied!';
    setTimeout(() => {
      btn.dataset.descr = copyTune;
      this.info = oldInfo;
      info.classList.remove('copied');
    }, 1337);
    navigator.clipboard.writeText(window.location.origin + window.location.pathname + '#' + this.selectedTune);
  }

  toggleVideo(): void {
    if (!this.video) {
      this.video = document.getElementById('bgvid') as HTMLVideoElement;
    }
    if (!this.screen) {
      this.screen = document.getElementById('screen');
    }
    if (this.videoPlaying) {
      this.video.pause();
      this.screen.classList.add('fadeIn');
      this.screen.classList.remove('fadeOut');
      this.videoButtonIcon = this.playVideoIcon;
    }
    else {
      this.video.play();
      this.screen.classList.add('fadeOut');
      this.screen.classList.remove('fadeIn');
      this.videoButtonIcon = this.pauseVideoIcon;
    }
    this.videoPlaying = !this.videoPlaying;
  }

  initTune= () => {
    if (this.sidPlayer) {
      this.subTunes = this.sidPlayer.getsubtunes();
      this.info = this.removeNullFromString(this.sidPlayer.getauthor()) + ' - ' +
                  this.removeNullFromString(this.sidPlayer.gettitle());
    }
  }

  removeNullFromString(str: string): string {
    return str.replace(/\0[\s\S]*$/g,'');
  }

  showPlaytime= () => {
    if (this.sidPlayer) {
      const time = parseInt(this.sidPlayer.getplaytime());
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      this.playTime = this.prependZero(minutes) + ':' + this.prependZero(seconds);
    }
  }

  prependZero(num: number): string {
    return num.toString().padStart(2, '0');
  }

  loadTune(): void {
    if (this.modPlayer) {
      this.modPlayer.loadModule('assets/mods/' + this.selectedTune + '.xm');
    }
    else {
      this.subTune = 0;
      this.sidPlayer.loadinit('assets/sids/' + this.selectedTune + '.sid', this.subTune);
    }
    this.loadedTune = this.selectedTune;
  }
  
  selectChange() {
    if (!this.playing) {
      return;
    }
    const label = this.getLabel();
    if (label === this.optgroupLabel) {
      this.loadTune();
    }
    else {
      this.toggleTune();
      this.setup(label);
    }
  }

  getLabel(): string {
    const optgroup = document.querySelector('select option:checked').parentElement as HTMLOptGroupElement;
    return optgroup.label;
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
    if (freq > 1 && freq <= 399) {
        let offset = 2400 * (399 - freq) + column
        data[offset + 0] = ampl;
        data[offset + 2400] = ampl * 0.5;
        data[offset - 2400] = ampl * 0.5;
    }
    freq = Math.floor(frequency1 * 0.3) + 1;
    ampl = amplitude1 * 255;
    if (ampl > 255) ampl = 255;
    if (freq > 1 && freq <= 399) {
        let offset = 2400 * (399 - freq) + column + 1;
        data[offset] = ampl;
        data[offset + 2400] = ampl * 0.5;
        data[offset - 2400] = ampl * 0.5;
    }
    freq = Math.floor(frequency2 * 0.3) + 1;
    ampl = amplitude2 * 255;
    if (ampl > 255) ampl = 255;
    if (freq > 1 && freq <= 399) {
        let offset = 2400 * (399 - freq) + column + 2;
        data[offset] = ampl;
        data[offset + 2400] = ampl * 0.5;
        data[offset - 2400] = ampl * 0.5;
    }
  }
}
