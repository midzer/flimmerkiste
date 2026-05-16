import { NgClass } from '@angular/common';
import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { jsSID } from './modules/jsSID';
import { ScripTracker } from './modules/scriptracker';

import { FLACS } from './flacs';
import { MODS } from './mods';
import { SIDS } from './sids';

import { TOOLS } from './tools';

@Component({
    selector: 'app-player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.scss'],
    standalone: true,
    imports: [FormsModule, NgClass]
})

export class PlayerComponent implements OnInit {

  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;

  modPlayer: any;
  sidPlayer: any;

  audioContext: AudioContext;
  analyserNode: AnalyserNode;
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

  ctx: CanvasRenderingContext2D;
  backgroundImg: HTMLImageElement;
  amplitudeArray: Uint8Array<ArrayBuffer>;
  requestID: number;

  selectedTune: string = this.randomFrom(SIDS.concat(MODS, FLACS));
  mods: string[] = MODS;
  sids: string[] = SIDS;
  flacs: string[] = FLACS;
  optgroupLabel: string = this.getOptgroupLabel(this.selectedTune);
  loadedTune: string;

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
        this.playTime.set(this.createPlayTime(this.audioContext.currentTime - this.startedAt));
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
        this.sidPlayer.resume();
        break;
      case 'MOD':
        this.modPlayer.play();
        break;
    }
    this.audioContext.resume();
    if (!this.ctx) {
      this.ctx = this.canvas.nativeElement.getContext('2d');
    }
    if (!this.backgroundImg && this.optgroupLabel !== 'SID') {
      const imgObj = new Image();
      imgObj.onload = () => { this.backgroundImg = imgObj; }
      imgObj.src = '/assets/images/darcula-spectrum.png';
    }
    this.requestID = window.requestAnimationFrame(this.redrawSpectrum);
    this.intervalID = window.setInterval(this.setPlayTime, 1000);
  }

  stopPlaying(): void {
    this.audioContext.suspend();
    switch (this.optgroupLabel) {
      case 'SID':
        this.sidPlayer.pause();
        break;
      case 'MOD':
        this.modPlayer.stop();
        break;
    }
    window.cancelAnimationFrame(this.requestID);
    window.clearInterval(this.intervalID);
  }

  play(): void {
    if (this.playing) {
      this.playButton = this.playIcon;
      this.stopPlaying();
      this.playing = false;
    }
    else {
      this.playButton = this.pauseIcon;
      this.startPlaying();
      this.playing = true;
    }
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
    else if (this.audioContext && this.optgroupLabel === 'OPUS') {
      this.playBuffer(this.audioContext.currentTime - this.startedAt + 10);
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
    else if (this.audioContext && this.optgroupLabel === 'OPUS') {
      this.playBuffer(this.audioContext.currentTime - this.startedAt - 10);
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

  getTunePath(tune: string): string {
    let path = '/assets/';
    switch (this.getOptgroupLabel(tune)) {
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
    if (!this.buffer) return;
  
    this.clearSourceNode();

    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = this.buffer;
    this.sourceNode.loop = true;

    this.connectAnalyserSource(this.sourceNode);

    if (offset < 0) offset = 0;

    this.sourceNode.start(0, offset);
    this.startedAt = this.audioContext.currentTime - offset;
    this.startPlaying();
  }

  async loadTune(tune: string): Promise<void> {
    this.clearSourceNode();
    this.subTune.set(0);
    this.optgroupLabel = this.getOptgroupLabel(tune);
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      if ('audioSession' in navigator) {
        (navigator.audioSession as any).type = 'playback';
      }
    }
    switch (this.optgroupLabel) {
      case 'SID':
        if (!this.sidPlayer) {
          this.sidPlayer = new jsSID(this.audioContext, 16384, 0.0005);
          await this.sidPlayer.init();

          this.sidPlayer.setloadcallback(() => {
            this.startPlaying();
            this.subTunes.set(this.sidPlayer.getsubtunes());
            this.info.set(
              this.removeNullFromString(this.sidPlayer.getauthor()) + ' - ' +
              this.removeNullFromString(this.sidPlayer.gettitle())
            );
          });
        }
        this.sidPlayer.outputNode.connect(this.audioContext.destination);
        await this.sidPlayer.loadinit(this.getTunePath(tune), this.subTune());
        break;
      case 'MOD':
        if (!this.modPlayer) {
          this.modPlayer = new ScripTracker(this.audioContext);
          await this.modPlayer.init();

          this.modPlayer.on('ready', (player, songName, songLength) => {
            this.startPlaying();
            this.subTunes.set(songLength);
            this.info.set(songName);
          });
          this.modPlayer.on('order', (player, currentOrder, songLength, patternIndex) => {
            this.subTune.set(currentOrder - 1);
            this.playTime.set('Pt ' + patternIndex);
          });
        }

        this.connectAnalyserSource(this.modPlayer.outputNode);
        await this.modPlayer.loadModule(this.getTunePath(tune));
        break;
      case 'OPUS':
        this.subTunes.set(1);
        this.info.set('Fetching OPUS...');

        try {
          const response = await fetch(this.getTunePath(tune));
          this.audioContext.decodeAudioData(await response.arrayBuffer(), (buffer: AudioBuffer) => {
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
    this.initMediaSession(tune, this.optgroupLabel);
  }

  selectTuneChange(event: string): void {
    this.selectedTune = event;
    if (this.playing) {
      this.stopPlaying();
      this.loadTune(event);
      this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    }
  }

  redrawSpectrum = () => {
    if (this.optgroupLabel === 'SID') {
      this.ctx.drawImage(
        this.canvas.nativeElement,
        0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height - 1, // source: everything except bottom row
        0, 1, this.canvas.nativeElement.width, this.canvas.nativeElement.height - 1  // destination: move down by 1
      );

      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, this.canvas.nativeElement.width, 1);

      this.ctx.lineWidth = 2;
      for (let voice = 0; voice < 3; voice++) {
        const freq = this.readRegister(0xD400 + voice * 7, 1) + this.readRegister(0xD401 + voice * 7, 1) * 256;
        let x = (freq / 0xFFFF) * this.canvas.nativeElement.width | 0;
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
    }
    else if (this.backgroundImg) {
      const w = this.canvas.nativeElement.width;
      const h = this.canvas.nativeElement.height;

      this.ctx.clearRect(0, 0, w, h);

      const SPACER_WIDTH = 8, BAR_WIDTH = 5, OFFSET = 100;
      const numBars = Math.round(this.canvas.nativeElement.width / SPACER_WIDTH);

      this.analyserNode.getByteFrequencyData(this.amplitudeArray);

      for (let i = 0; i < numBars; i++) {
        const value = this.amplitudeArray[i + OFFSET] ?? 0;
        const barH = Math.round((value * h) / 255);
        if (barH <= 0) continue;

        const x = Math.round(i * SPACER_WIDTH);
        const y = Math.round(h - barH);

        this.ctx.drawImage(
          this.backgroundImg,
          0, 0, BAR_WIDTH, 255,
          x, y, BAR_WIDTH, barH
        );
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

  clearSourceNode(): void {
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
  }

  connectAnalyserSource(source: AudioNode): void {
    if (!this.analyserNode) {
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 2048;
      this.analyserNode.smoothingTimeConstant = 0.8;
      this.amplitudeArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    }

    source.disconnect();
    this.analyserNode.disconnect();

    source.connect(this.analyserNode);
    this.analyserNode.connect(this.audioContext.destination);
  }

  initMediaSession(tune: string, label: string) {
    const ms = navigator.mediaSession;

    ms.metadata = new window.MediaMetadata({
      title: tune,
      artist: label,
      album: 'Flimmerkiste',
      artwork: [{ src: '/assets/images/health.png', sizes: '192x192', type: 'image/png' }]
    });
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
        name: label === 'MOD' ? tune : tune + "." + label.toLowerCase(),
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
