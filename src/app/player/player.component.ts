import { Component, OnInit } from '@angular/core';

declare var jsSID: any;
declare var ScripTracker: any;

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
  playIcon: string = 'assets/images/player-play.svg';
  pauseIcon: string = 'assets/images/player-pause.svg';
  playButton: string = this.playIcon;
  
  screen: HTMLElement;
  video: HTMLVideoElement;
  videoPlaying: boolean = false;
  playVideoIcon: string = 'assets/images/movie.svg';
  pauseVideoIcon: string = 'assets/images/movie-off.svg';
  videoButtonIcon: string = this.playVideoIcon;

  modPlayer: any;
  playingMusic: boolean = false;
  playMusicIcon: string = 'assets/images/music.svg';
  pauseMusicIcon: string = 'assets/images/music-off.svg';
  musicButtonIcon: string = this.playMusicIcon;
  
  sids: string[] = [
    "ACE_II",
    "Antics_Dulcedo_Cogitationis",
    "Arkanoid",
    "Ark_Pandora",
    "Armalyte",
    "Auf_Wiedersehen_Monty",
    "Baby_of_Can_Guru",
    "Batman_long",
    "Battle_Valley",
    "Bionic_Commando",
    "BMX_Kidz",
    "Bulldog",
    "Chordian",
    "Cobra",
    "Combat_Crazy",
    "Comic_Bakery",
    "Commando",
    "Compleeto",
    "Cooperation_Demo",
    "Crazy_Comets_remix",
    "Crazy_Comets",
    "Cybernoid_II",
    "Cybernoid",
    "Defender_of_the_Crown",
    "Delta",
    "DNA_Warrior",
    "Driller",
    "Eliminator",
    "FAME_1",
    "Gauntlet_III",
    "Gerry_the_Germ",
    "Ghosts_n_Goblins",
    "Ghouls_n_Ghosts",
    "Glider_Rider",
    "Grand_Prix_Circuit",
    "Great_Giana_Sisters",
    "Green_Beret",
    "Hawkeye",
    "Hysteria",
    "IK_plus",
    "International_Karate",
    "Katakis",
    "Kentilla",
    "Kinetix",
    "Knucklebusters",
    "Last_Ninja",
    "Last_Ninja_2",
    "Last_Ninja_3",
    "Lightforce",
    "Master_of_Magic",
    "Mega_Apocalypse",
    "Miami_Vice",
    "Mikie",
    "Monty_on_the_Run",
    "Mutants",
    "Myth",
    "Nemesis_the_Warlock",
    "Nightdawn",
    "Ocean_Loader_3",
    "One_Man_and_his_Droid",
    "Parallax",
    "Platoon",
    "Rambo_First_Blood_Part_II",
    "Ramparts",
    "R_I_S_K",
    "RoboCop",
    "RoboCop_3",
    "Rocky_Star",
    "R-Type",
    "Sanxion",
    "Savage",
    "Scroll_Machine",
    "Scumball",
    "Short_Circuit",
    "Snare",
    "Spellbound",
    "Stormlord",
    "Supremacy",
    "Sweet",
    "Synth_Sample",
    "SYS4096",
    "Terra_Cresta",
    "Tetris",
    "Thing_Bounces_Back",
    "Thrust",
    "Thunderforce",
    "Times_of_Lore",
    "To_be_on_Top",
    "Trap",
    "Turbo_Outrun",
    "Uridium",
    "Vikings",
    "Warhawk",
    "Way_of_the_Exploding_Fist",
    "Wizardry",
    "Wizball",
    "Yie_Ar_Kung_Fu",
    "Zamzara",
    "Zig_Zag",
    "Zoids"
  ];
  selectedSid: string = 'Last_Ninja_2';

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  backBuffer: ImageData;
  requestID: number;
  oldPos: number;

  constructor() {}

  ngOnInit() {
    this.video = document.getElementById('bgvid') as HTMLVideoElement;
    this.screen = document.getElementById('screen');
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
    this.ctx.font = "108px Monospace";
    this.ctx.fillText('Click me', 25, 150);
    this.ctx.fillText('to start', 25, 275);
  }

  setup(): void {
    if (!this.sidPlayer) {
      this.loadScript('jsSID.js').then(() => {
        this.sidPlayer = new jsSID(16384,0.0005);
        this.sidPlayer.loadinit('assets/sids/' + this.selectedSid + '.sid', this.subTune);
        this.sidPlayer.setloadcallback(this.initTune);
        this.sidPlayer.setstartcallback(this.showPlaytime);
        this.sidPlayer.setplaycallback(this.playCallback);
        setInterval(this.showPlaytime, 1000);
        document.querySelector('.marquee').classList.remove('hidden');
        this.startPlaying();
      });
    }
    else {
      this.startPlaying();
    }
  }

  setupMusic(): void {
    if (!this.modPlayer) {
      this.loadScript('scriptracker-1.1.1.min.js').then(() => {
        this.modPlayer = new ScripTracker();
        this.modPlayer.on(ScripTracker.Events.playerReady, () => { this.startPlayingMusic() });
        this.modPlayer.loadModule('assets/mods/db_3dg.xm');
      });
    }
    else {
      this.startPlayingMusic();
    }
  }

  loadScript (file): Promise<any> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.async = true
      script.src = `/assets/js/${file}`
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  play(): void {
    this.setup();
  }

  playMusic(): void {
    this.setupMusic();
  }

  startPlaying(): void {
    if (this.playing) {
      this.sidPlayer.pause();
      this.playButton = this.playIcon;
      window.cancelAnimationFrame(this.requestID);
      this.playing = false;
    }
    else {
      this.sidPlayer.playcont();
      this.playButton = this.pauseIcon;
      this.redrawSpectrum();
      this.playing = true;
    }
  }

  startPlayingMusic(): void {
    if (this.playingMusic) {
      this.modPlayer.stop();
      this.musicButtonIcon = this.playMusicIcon;
      this.playingMusic = false;
    }
    else {
      this.modPlayer.play();
      this.musicButtonIcon = this.pauseMusicIcon;
      this.playingMusic = true;
    }
  }

  next(): void {
    if (this.sidPlayer) {
      if (this.subTune === this.sidPlayer.getsubtunes() - 1) {
        this.subTune = 0;
      }
      else {
        ++this.subTune;
      }
      this.sidPlayer.start(this.subTune);
    }
    else {
      this.setup();
    }
  }

  prev(): void {
    if (this.sidPlayer) {
      if (this.subTune === 0) {
        this.subTune = this.sidPlayer.getsubtunes() - 1;
      }
      else {
        --this.subTune;
      }
      this.sidPlayer.start(this.subTune);
    }
    else {
      this.setup();
    }
  }

  toggle(): void {
    if (this.videoPlaying) {
      this.video.pause();
      this.screen.classList.add('fadeIn');
      this.screen.classList.remove('fadeOut');
      this.setVideoButton(this.playVideoIcon);
      this.videoPlaying = false;
    }
    else {
      this.video.play();
      this.screen.classList.add('fadeOut');
      this.screen.classList.remove('fadeIn');
      this.setVideoButton(this.pauseVideoIcon);
      this.videoPlaying = true;
    }
  }

  setVideoButton = (video: string): void => {
    this.videoButtonIcon = video;
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
