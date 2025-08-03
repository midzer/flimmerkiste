import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FLACS } from './flacs';
import { MODS } from './mods';
import { SIDS } from './sids';

import { TOOLS } from './tools';

@Component({
    selector: 'app-player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.scss'],
    standalone: true,
    imports: [FormsModule]
})

export class PlayerComponent implements OnInit {
  modPlayer: any;
  sidPlayer: any;
  flacPlayer: AudioContext;
  analyserNode : AnalyserNode;
  javascriptNode: ScriptProcessorNode;
  sourceNode: AudioBufferSourceNode;
  buffer: AudioBuffer;
  startedAt: number = 0;
  subTune = signal(0);
  subTunes = signal(13);
  info = signal('Props to original authors');
  intervalID: number;
  playTime = signal('00:00');
  playing: boolean = false;
  playIcon: string = '/assets/icons/player-play.svg';
  pauseIcon: string = '/assets/icons/player-pause.svg';
  playButton: string = this.playIcon;
  
  screen: HTMLElement;
  video: HTMLVideoElement;
  videoPlaying: boolean = false;
  playVideoIcon: string = '/assets/icons/movie.svg';
  pauseVideoIcon: string = '/assets/icons/movie-off.svg';
  videoButtonIcon: string = this.playVideoIcon;

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  backgroundImg: HTMLImageElement;
  amplitudeArray: Uint8Array;
  requestID: number;

  optgroupLabel: string;
  selectedTune: string = this.randomFrom(SIDS.concat(MODS, FLACS));
  loadedTune: string;
  mods: string[] = MODS;
  sids: string[] = SIDS;
  flacs: string[] = FLACS;

  selectedTool: string = this.randomFrom(TOOLS);

  ngOnInit() {
    const query = window.location.search;
    if (!query) {
      return;
    }
    const params = new URLSearchParams(query);
    const tune = params.get('tune');
    if (!tune) {
      return;
    }
    if (this.sids.includes(tune) || this.mods.includes(tune) || this.flacs.includes(tune)) {
      this.selectedTune = tune;
    }
    else {
      return alert(tune + ' does not exist.');
    }
    if (window.navigator.maxTouchPoints > 1) {
      return alert(tune + ' selected. Play it manually.');
    }
    // @ts-ignore
    if (window.navigator.getAutoplayPolicy && window.navigator.getAutoplayPolicy('audiocontext') !== "allowed") {
      return alert('Your browser does not allow autoplay. ' + tune + ' selected. Play it manually.');
    }
    if (window.confirm('Do you want to play ' + tune + '?')) {
      this.play();
    }
  }

  setPlayTime = () => {
    switch (this.optgroupLabel) {
      case 'SID':
        this.playTime.set(this.createPlayTime(this.sidPlayer.getplaytime()));
        break;
      case 'OPUS':
        this.playTime.set(this.createPlayTime(this.flacPlayer.currentTime - this.startedAt));
        break;
    }
  }

  startPlaying(): void {
    if (this.selectedTune !== this.loadedTune) {
      this.loadTune(this.selectedTune);
      return;
    }
    switch (this.optgroupLabel) {
      case 'SID':
        this.sidPlayer.playcont();
        break;
      case 'MOD':
        this.modPlayer.play();
        break;
      case 'OPUS':
        this.flacPlayer.resume();
        break;
    }
    this.initSpectrum();
    this.redrawSpectrum();
    this.intervalID = window.setInterval(this.setPlayTime, 1000);
    this.playing = true;
  }

  stopPlaying(): void {
    switch (this.optgroupLabel) {
      case 'SID':
        this.sidPlayer.pause();
        break;
      case 'MOD':
        this.modPlayer.stop();
        break;
      case 'OPUS':
        this.flacPlayer.suspend();
        break;
    }
    window.cancelAnimationFrame(this.requestID);
    window.clearInterval(this.intervalID);
    this.playing = false;
  }

  play(): void {
    if (this.playing) {
      this.playButton = this.playIcon;
      this.stopPlaying();
    }
    else {
      this.playButton = this.pauseIcon;
      this.startPlaying();
    }
    document.querySelector('.heart').classList.toggle('hidden');
  }

  next(): void {
    if (this.sidPlayer && this.optgroupLabel === 'SID') {
      if (this.subTune() === this.subTunes() - 1) {
        this.subTune.set(0);
      }
      else {
        this.subTune.set(this.subTune() + 1);
      }
      this.sidPlayer.start(this.subTune());
    }
    else if (this.modPlayer && this.optgroupLabel === 'MOD') {
      this.modPlayer.nextOrder();
    }
    else if (this.flacPlayer && this.optgroupLabel === 'OPUS') {
      this.playBuffer(this.flacPlayer.currentTime - this.startedAt + 10);
    }
    else {
      this.play();
    }
  }

  prev(): void {
    if (this.sidPlayer && this.optgroupLabel === 'SID') {
      if (this.subTune() === 0) {
        this.subTune.set(this.subTunes() - 1);
      }
      else {
        this.subTune.set(this.subTune() - 1);
      }
      this.sidPlayer.start(this.subTune());
    }
    else if (this.modPlayer && this.optgroupLabel === 'MOD') {
      this.modPlayer.prevOrder();
    }
    else if (this.flacPlayer && this.optgroupLabel === 'OPUS') {
      this.playBuffer(this.flacPlayer.currentTime - this.startedAt - 10);
    }
    else {
      this.play();
    }
  }

  randomFrom(array: any) {
    return array[Math.floor(Math.random() * array.length)];
  }

  shuffleTune(): void {
    const randomTune = this.randomFrom(SIDS.concat(MODS, FLACS));
    if (randomTune === this.selectedTune) {
      return this.shuffleTune();
    }
    this.selectTuneChange(randomTune);
  }

  shuffleTool(): void {
    const randomTool = this.randomFrom(TOOLS);
    if (randomTool === this.selectedTool) {
      return this.shuffleTool();
    }
    this.selectedTool = randomTool;
  }

  copy(event): void {
    const btn = event.target;
    const copyTune = btn.dataset.descr;
    btn.dataset.descr = 'Copied!';
    setTimeout(() => {
      btn.dataset.descr = copyTune;
    }, 1337);
    navigator.clipboard.writeText(
      window.location.origin +
      window.location.pathname +
      '?tune=' + this.selectedTune +
      window.location.hash);
  }

  toggle(): void {
    if (!this.video) {
      this.video = document.querySelector('video') as HTMLVideoElement;
    }
    if (!this.screen) {
      this.screen = document.querySelector('app-screen');
    }
    if (this.videoPlaying) {
      this.videoButtonIcon = this.playVideoIcon;
      this.video.pause();
    }
    else {
      this.videoButtonIcon = this.pauseVideoIcon;
      this.video.play();
    }
    this.screen.classList.toggle('hide');
    this.videoPlaying = !this.videoPlaying;
  }

  getTunePath(tune: string): string {
    let path = '/assets/';
    switch (this.getOptgroupLabel(this.selectedTune)) {
      case 'SID':
        path += 'sids/' + tune + '.sid';
        break;
      case 'MOD':
        path += 'mods/' + tune;
        break;
      case 'OPUS':
        path += 'flacs/' + tune + '.webm';
        break;
    }

    return path;
  }

  getToolPath(tool: string): string {
    return '/assets/tools/' + tool + '.png';
  }

  removeNullFromString(str: string): string {
    return str.replace(/\0[\s\S]*$/g,'');
  }

  createPlayTime(input: any): string {
    const time = parseInt(input);
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return this.prependZero(minutes) + ':' + this.prependZero(seconds);
  }

  prependZero(num: number): string {
    return num.toString().padStart(2, '0');
  }

  playBuffer(offset: number): void {
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    this.sourceNode = this.flacPlayer.createBufferSource();
    this.sourceNode.buffer = this.buffer;
    this.sourceNode.loop = true;

    this.sourceNode.connect(this.flacPlayer.destination);
    this.sourceNode.connect(this.analyserNode);
    this.analyserNode.connect(this.javascriptNode);
    this.javascriptNode.connect(this.flacPlayer.destination);

    if (offset < 0) {
      offset = 0;
    }
    this.sourceNode.start(0, offset);
    this.startedAt = this.flacPlayer.currentTime - offset;
    this.startPlaying();
  }

  async loadTune(tune: string): Promise<void> {
    this.subTune.set(0);
    this.optgroupLabel = this.getOptgroupLabel(tune);
    switch (this.optgroupLabel) {
      case 'SID':
        if (!this.sidPlayer) {
          const { jsSID } = await import('./modules/jsSID.js');
          this.sidPlayer = new jsSID(16384, 0.0005);
          this.sidPlayer.setloadcallback(() => {
            this.startPlaying();
            this.subTunes.set(this.sidPlayer.getsubtunes());
            this.info.set(this.removeNullFromString(this.sidPlayer.getauthor()) + ' - ' +
              this.removeNullFromString(this.sidPlayer.gettitle()));
          });
        }
        this.sidPlayer.loadinit(this.getTunePath(tune), this.subTune());
        break;
      case 'MOD':
        if (!this.modPlayer) {
          const { ScripTracker } = await import('./modules/scriptracker.js');
          this.modPlayer = new ScripTracker();
          this.modPlayer.on(ScripTracker.Events.playerReady, (player, songName, songLength) => {
            this.startPlaying();
            this.subTunes.set(songLength);
            this.info.set(songName);
          });
          this.modPlayer.on(ScripTracker.Events.order, (player, currentOrder, songLength, patternIndex) => {
            this.subTune.set(currentOrder - 1);
            this.playTime.set('Pt ' + patternIndex);
          });
        }
        this.analyserNode = this.modPlayer.audioContext.createAnalyser();
        this.modPlayer.audioScriptNode.connect(this.analyserNode);
        this.modPlayer.loadModule(this.getTunePath(tune));
        break;
      case 'OPUS':
        if (!this.flacPlayer) {
          this.flacPlayer = new AudioContext();
        }
        this.analyserNode = new AnalyserNode(this.flacPlayer);
        this.javascriptNode = this.flacPlayer.createScriptProcessor(
          1024,
          1,
          1
        );
        this.subTunes.set(1);
        this.info.set('Fetching OPUS...');
        try {
          const response = await fetch(this.getTunePath(tune));
          this.flacPlayer.decodeAudioData(await response.arrayBuffer(), (buffer: AudioBuffer) => {
            this.buffer = buffer;
            this.playBuffer(0);
          });
        }
        catch (err) {
          console.error(`Unable to fetch the audio file. Error: ${err.message}`);
        }
        this.info.set(tune);
        break;
    }
    this.loadedTune = tune;
  }

  selectTuneChange(event: string): void {
    this.selectedTune = event;
    if (this.playing) {
      this.stopPlaying();
      this.loadTune(event);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  initSpectrum = () => {
    this.canvas = document.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    if (this.optgroupLabel !== 'SID') {
      const imgObj = new Image();
      imgObj.onload = () => { this.backgroundImg = imgObj; }
      imgObj.src = '/assets/images/darcula-spectrum.png';
      this.amplitudeArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    }
  }

  redrawSpectrum = () => {
    if (this.optgroupLabel === 'SID') {
      this.ctx.drawImage(
        this.canvas,
        0, 0, this.canvas.width, this.canvas.height - 1, // source: everything except bottom row
        0, 1, this.canvas.width, this.canvas.height - 1  // destination: move down by 1
      );

      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, this.canvas.width, 1);

      this.ctx.lineWidth = 2;
      for (let voice = 0; voice < 3; voice++) {
        const freq = this.readRegister(0xD400 + voice * 7, 1) + this.readRegister(0xD401 + voice * 7, 1) * 256;
        let x = (freq / 0xFFFF) * this.canvas.width | 0;
        switch (voice) {
          case 0: this.ctx.strokeStyle = '#955529'; break;
          case 1: this.ctx.strokeStyle = '#ca7570'; break;
          case 2: this.ctx.strokeStyle = '#2c339e'; break;
        }
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, 1);
        this.ctx.stroke();
      }
    } else {
      this.analyserNode.getByteFrequencyData(this.amplitudeArray);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      const SPACER_WIDTH = 8, BAR_WIDTH = 5, OFFSET = 100;
      const numBars = Math.round(this.canvas.width / SPACER_WIDTH);
      for (let i = 0; i < numBars; ++i) {
        const magnitude = this.amplitudeArray[i + OFFSET] * this.canvas.height / 255;
        if (this.backgroundImg) {
          const o = Math.round(this.canvas.height - magnitude);
          this.ctx.drawImage(
            this.backgroundImg,
            0, 0, BAR_WIDTH, 255,
            i * SPACER_WIDTH, o, BAR_WIDTH, Math.round(magnitude)
          );
        }
      }
    }
    this.requestID = window.requestAnimationFrame(this.redrawSpectrum);
  }

  readRegister(register, chip) {
    return this.sidPlayer.readregister(register + this.sidPlayer.getSIDAddress(chip));
  }

  getOptgroupLabel(tune: string): string {
    let label: string;
    if (this.sids.includes(tune)) {
      label = 'SID';
    }
    else if (this.mods.includes(tune)) {
      label = 'MOD';
    }
    else if (this.flacs.includes(tune)) {
      label = 'OPUS';
    }

    return label;
  }

  async download() {
    const label = this.getOptgroupLabel(this.selectedTune);
    if (!window.confirm('Do you want to download all ' + label + ' tunes?')) {
      return;
    }
    let tunes: string[];
    switch (label) {
      case 'SID':
        tunes = this.sids;
        break;
      case 'MOD':
        tunes = this.mods;
        break;
      case 'OPUS':
        tunes = this.flacs;
        break;
    }

    const files = await Promise.all(tunes.map(async tune => {
      const response = await fetch(this.getTunePath(tune));
      return {
        name: label === 'MODS' ? tune : tune + "." + label.toLowerCase(),
        data: new Uint8Array(await response.arrayBuffer())
      };
    }));

    const { SimpleZip } = await import('./modules/simplezip.js');
    const zip = SimpleZip.GenerateZipFrom(files);
    const blob = new Blob([zip], {type: 'octet/stream'});

    const el = document.createElement('a');
    el.href = window.URL.createObjectURL(blob);
    el.target = '_blank';
    el.download = label + '_PACK_2024-11-19.zip';
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  }
}
