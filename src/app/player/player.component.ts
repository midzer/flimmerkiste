import { Component, OnInit, signal } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FLACS } from './flacs';
import { MODS } from './mods';
import { SIDS } from './sids';

declare var ScripTracker: any;
declare var jsSID: any;

@Component({
    selector: 'app-player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.scss'],
    standalone: true,
    imports: [FormsModule, NgFor]
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
  playIcon: string = 'assets/icons/player-play.svg';
  pauseIcon: string = 'assets/icons/player-pause.svg';
  playButton: string = this.playIcon;
  
  screen: HTMLElement;
  video: HTMLVideoElement;
  videoPlaying: boolean = false;
  playVideoIcon: string = 'assets/icons/movie.svg';
  pauseVideoIcon: string = 'assets/icons/movie-off.svg';
  videoButtonIcon: string = this.playVideoIcon;

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  requestID: number;

  optgroupLabel: string = 'SID';
  selectedTune: string = 'Last_Ninja_2';
  loadedTune: string;
  mods: string[] = MODS;
  sids: string[] = SIDS;
  flacs: string[] = FLACS;

  constructor() {}

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
      return alert('Autoplay is not allowed.')
    }
    if (window.confirm('Do you want to play ' + tune + '?')) {
      this.play();
    }
  }

  loadScript (file: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `/assets/js/${file}`;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  setPlayTime = () => {
    switch (this.optgroupLabel) {
      case 'SID':
        this.playTime.set(this.createPlayTime(this.sidPlayer.getplaytime()));
        break;
      case 'MOD':
        this.playTime.set('Pt ' + this.modPlayer.pattern.patternIndex);
        break;
      case 'FLAC':
        let time = 0;
        if (this.startedAt) {
          time = this.flacPlayer.currentTime - this.startedAt;
        }
        this.playTime.set(this.createPlayTime(time));
        break;
    }
  }

  startPlaying(): void {
    switch (this.optgroupLabel) {
      case 'SID':
        this.sidPlayer.playcont();
        this.redrawSpectrum();
        break;
      case 'MOD':
        this.modPlayer.play();
        break;
      case 'FLAC':
        this.flacPlayer.resume();
        break;
    }
    this.playing = true;
  }

  stopPlaying(): void {
    switch (this.optgroupLabel) {
      case 'SID':
        this.sidPlayer.pause();
        window.cancelAnimationFrame(this.requestID);
        break;
      case 'MOD':
        this.modPlayer.stop();
        break;
      case 'FLAC':
        this.flacPlayer.suspend();
        break;
    }
    this.playing = false;
  }

  play(): void {
    if (this.playing) {
      this.playButton = this.playIcon;
      window.clearInterval(this.intervalID);
      this.stopPlaying();
    }
    else {
      this.playButton = this.pauseIcon;
      this.intervalID = window.setInterval(this.setPlayTime, 500);
      if (this.selectedTune !== this.loadedTune) {
        this.loadTune(this.selectedTune);
        return;
      }
      this.startPlaying();
    }
  }

  next(): void {
    if (this.sidPlayer && this.optgroupLabel === 'SID') {
      if (this.subTune() === this.sidPlayer.getsubtunes() - 1) {
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
    else if (this.flacPlayer && this.optgroupLabel === 'FLAC') {
      this.playBuffer(this.flacPlayer.currentTime - this.startedAt + 10);
    }
    else {
      this.play();
    }
  }

  prev(): void {
    if (this.sidPlayer && this.optgroupLabel === 'SID') {
      if (this.subTune() === 0) {
        this.subTune.set(this.sidPlayer.getsubtunes() - 1);
      }
      else {
        this.subTune.set(this.subTune() -1);
      }
      this.sidPlayer.start(this.subTune());
    }
    else if (this.modPlayer && this.optgroupLabel === 'MOD') {
      this.modPlayer.prevOrder();
    }
    else if (this.flacPlayer && this.optgroupLabel === 'FLAC') {
      this.playBuffer(this.flacPlayer.currentTime - this.startedAt - 10);
    }
    else {
      this.play();
    }
  }

  copy(event): void {
    const btn = event.target;
    const copyTune = btn.dataset.descr;
    const info = btn.firstElementChild;
    info.classList.add('copied');
    const oldInfo = this.info();
    const copied = 'Copied!';
    this.info.set(copied);
    btn.dataset.descr = copied;
    setTimeout(() => {
      btn.dataset.descr = copyTune;
      this.info.set(oldInfo);
      info.classList.remove('copied');
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
    if (this.sids.includes(tune)) {
      this.optgroupLabel = 'SID';
      if (!this.sidPlayer) {
        await this.loadScript('jsSID.js');
        this.sidPlayer = new jsSID(16384, 0.0005);
        this.sidPlayer.setloadcallback(() => {
          this.startPlaying();
          this.subTunes.set(this.sidPlayer.getsubtunes());
          this.info.set(this.removeNullFromString(this.sidPlayer.getauthor()) + ' - ' +
            this.removeNullFromString(this.sidPlayer.gettitle()));
        });
      }
      this.sidPlayer.loadinit('assets/sids/' + tune + '.sid', this.subTune());
    }
    else if (this.mods.includes(tune)) {
      this.optgroupLabel = 'MOD';
      if (!this.modPlayer) {
        await this.loadScript('scriptracker-1.1.1.min.js');
        this.modPlayer = new ScripTracker();
        this.modPlayer.on(ScripTracker.Events.playerReady, (player, songName, songLength) => {
          this.startPlaying();
          this.subTunes.set(songLength);
          this.info.set(songName);
        });
        this.modPlayer.on(ScripTracker.Events.order, (player_1, currentOrder, songLength_1, patternIndex) => {
          this.subTune.set(currentOrder - 1);
        });
      }
      this.modPlayer.loadModule('assets/mods/' + tune);
    }
    else if (this.flacs.includes(tune)) {
      this.optgroupLabel = 'FLAC';
      if (!this.flacPlayer) {
        this.flacPlayer = new AudioContext();
        this.analyserNode = new AnalyserNode(this.flacPlayer);
        this.javascriptNode = this.flacPlayer.createScriptProcessor(
          1024,
          1,
          1
        );
        // Visualization example taken from
        // https://github.com/mdn/webaudio-examples/tree/main/audio-analyser
        // Set up the event handler that is triggered every time enough samples have been collected
        // then trigger the audio analysis and draw the results
        this.javascriptNode.onaudioprocess = () => {
          // Draw the display when the audio is playing
          if (this.flacPlayer.state === 'running') {
            // Read the frequency values
            const amplitudeArray = new Uint8Array(
              this.analyserNode.frequencyBinCount
            );

            // Get the time domain data for this sample
            this.analyserNode.getByteTimeDomainData(amplitudeArray);

            // Draw the time domain in the canvas
            window.requestAnimationFrame(() => {
              // Get the canvas 2d context
              //const canvasContext = canvasElt.getContext("2d");

              // Clear the canvas
              this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

              // Draw the amplitude inside the canvas
              this.ctx.fillStyle = 'white';
              for (let i = 0; i < amplitudeArray.length; i++) {
                const value = amplitudeArray[i] / 256;
                const y = this.canvas.height - this.canvas.height * value;
                this.ctx.fillRect(i, y, 1, 1);
              }
            });
          }
        };
      }
      this.subTunes.set(1);
      this.info.set('Fetching FLAC...');
      try {
        const response = await fetch('assets/flacs/' + tune + '.flac');
        this.flacPlayer.decodeAudioData(await response.arrayBuffer(), (buffer: AudioBuffer) => {
          this.buffer = buffer;
          this.playBuffer(0);
        });
      }
      catch (err) {
        console.error(`Unable to fetch the audio file. Error: ${err.message}`);
      }
      this.info.set(tune);
    }
    // Prepare canvas
    if (!this.canvas) {
      this.canvas = document.querySelector('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.loadedTune = this.selectedTune = tune;
  }

  selectChange(): void {
    if (!this.playing) {
      return;
    }
    this.stopPlaying();
    this.loadTune(this.selectedTune);
  }

  redrawSpectrum = () => {
    this.onUpdateSpectrum();
    this.ctx.drawImage(this.canvas,
      1, 0, this.canvas.width, this.canvas.height - 1,
      1, 1, this.canvas.width, this.canvas.height - 1);
    this.requestID = window.requestAnimationFrame(this.redrawSpectrum);
  }

  onUpdateSpectrum(): void {
    // Fill logic from https://github.com/Chordian/deepsid/blob/master/js/viz.js
    // Color the top line background
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, 1);
    
    // Color the voices
    this.ctx.lineWidth = 2;
    for (let voice = 0; voice < 3; voice++) {
      const freq = this.readRegister(0xD400 + voice * 7, 1) + this.readRegister(0xD401 + voice * 7, 1) * 256;
      let x = (freq / 0xFFFF) * this.canvas.width;
      x = x | 0;
      switch(voice) {
        case 0:
          this.ctx.strokeStyle = '#955529';
          break;
        case 1:
          this.ctx.strokeStyle = '#ca7570';
          break;
        case 2:
          this.ctx.strokeStyle = '#2c339e';
      }
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, 1);
      this.ctx.stroke();
    }
  }

  readRegister(register, chip) {
    return this.sidPlayer.readregister(register + this.sidPlayer.getSIDAddress(chip));
  }
}
