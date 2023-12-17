import { Component, OnInit } from '@angular/core';

declare var ScripTracker: any;
declare var jsSID: any;

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  modPlayer: any;
  sidPlayer: any;
  oggPlayer: HTMLAudioElement;
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
  requestID: number;

  optgroupLabel: string = 'SID';
  selectedTune: string = 'Last_Ninja_2';
  loadedTune: string;
  mods: string[] = [
    "beams_of_light",
    "beek-substitutionology",
    "contraduct_design",
    "db_3dg",
    "dt_orion",
    "external",
    "her4",
    "lamour_toujours_remix",
    "soda7-digitags",
    "sv_sac05",
    "titan_02",
    "transfu3",
    "tu_itr29"
  ];
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

  oggs: string[] = [
    "Sauron - OOOPS!"
  ];

  constructor() {}

  ngOnInit() {
    const hash = window.location.hash;
    if (hash) {
      const tune = window.decodeURIComponent(hash).replace('#', '');
      if (tune) {
        this.selectedTune = tune;
        if (window.navigator.maxTouchPoints > 1) {
          // Hack to play on mobile
          window.addEventListener('click', () => {
            this.loadTune(tune);
          }, { once: true });
        }
        else {
          this.loadTune(tune);
        }
      }
    }
  }

  initSid = (tune) => {
    this.loadScript('jsSID.js').then(() => {
      this.sidPlayer = new jsSID(16384,0.0005);
      this.sidPlayer.setloadcallback(() => {
        this.setPlayButton(this.pauseIcon);
        this.startPlaying('SID');
        this.subTunes = this.sidPlayer.getsubtunes();
        this.info = this.removeNullFromString(this.sidPlayer.getauthor()) + ' - ' +
                    this.removeNullFromString(this.sidPlayer.gettitle());
      });
      this.loadSid(tune);
    });
    // Prepare canvas
    if (!this.canvas) {
      this.canvas = document.querySelector('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.ctx.fillStyle = '#000';
      this.ctx.lineWidth = 2;
    }
  }

  initMod = (tune) => {
    this.loadScript('scriptracker-1.1.1.min.js').then(() => {
      this.modPlayer = new ScripTracker();
      this.modPlayer.on(ScripTracker.Events.playerReady, (player, songName, songLength) => {
        this.setPlayButton(this.pauseIcon);
        this.startPlaying('MOD');
        this.subTune = 0;
        this.subTunes = songLength;
        this.info = songName;
      });
      this.modPlayer.on(ScripTracker.Events.order, (player, currentOrder, songLength, patternIndex) => {
        this.subTune = currentOrder - 1;
      });
      this.loadMod(tune);
    });
  }

  initOgg = (tune) => {
    this.oggPlayer = new Audio();
    this.oggPlayer.loop = true;
    this.oggPlayer.addEventListener('loadeddata', () => {
      if (this.oggPlayer.readyState >= 2) {
        this.setPlayButton(this.pauseIcon);
        this.startPlaying('OGG');
      }
    });
    this.loadOgg(tune);
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

  setPlayButton(icon: string): void {
    this.playButton = icon;
  }

  startPlaying(label: string): void {
    if (label === 'SID') {
      this.sidPlayer.playcont();
      this.redrawSpectrum();
    }
    else if (label === 'MOD') {
      this.modPlayer.play();
    }
    else {
      this.oggPlayer.play();
    }
    this.intervalID = window.setInterval(this.showPlaytime, 1000);
    this.playing = true;
  }

  stopPlaying(): void {
    this.playButton = this.playIcon;
    this.playing = false;
  }

  stopPlayer(label: string): void {
    if (label === 'SID') {
      this.sidPlayer.pause();
      window.cancelAnimationFrame(this.requestID);
    }
    else if (label === 'MOD') {
      this.modPlayer.stop();
    }
    else {
      this.oggPlayer.pause();
    }
    window.clearInterval(this.intervalID);
  }

  play(): void {
    if (this.selectedTune === this.loadedTune) {
      const label = this.getLabel();
      if (this.playing) {
        this.setPlayButton(this.pauseIcon);
        this.stopPlayer(label);
      }
      else {
        this.setPlayButton(this.playIcon);
        this.startPlaying(label);
      }
    }
    else {
      this.loadTune(this.selectedTune);
    }
  }

  next(): void {
    if (this.sidPlayer && this.optgroupLabel === 'SID') {
      if (this.subTune === this.sidPlayer.getsubtunes() - 1) {
        this.subTune = 0;
      }
      else {
        ++this.subTune;
      }
      this.sidPlayer.start(this.subTune);
    }
    else if (this.modPlayer && this.optgroupLabel === 'MOD') {
      this.modPlayer.nextOrder();
    }
    else if (this.oggPlayer && this.optgroupLabel === 'OGG') {
      this.oggPlayer.currentTime += 10;
    }
    else {
      this.play();
    }
  }

  prev(): void {
    if (this.sidPlayer && this.optgroupLabel === 'SID') {
      if (this.subTune === 0) {
        this.subTune = this.sidPlayer.getsubtunes() - 1;
      }
      else {
        --this.subTune;
      }
      this.sidPlayer.start(this.subTune);
    }
    else if (this.modPlayer && this.optgroupLabel === 'MOD') {
      this.modPlayer.prevOrder();
    }
    else if (this.oggPlayer && this.optgroupLabel === 'OGG') {
      this.oggPlayer.currentTime -= 10;
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
    const oldInfo = this.info;
    btn.dataset.descr = this.info = 'Copied!';
    setTimeout(() => {
      btn.dataset.descr = copyTune;
      this.info = oldInfo;
      info.classList.remove('copied');
    }, 1337);
    navigator.clipboard.writeText(window.location.origin + window.location.pathname + '#' + this.selectedTune);
  }

  toggle(): void {
    if (!this.video) {
      this.video = document.getElementById('bgvid') as HTMLVideoElement;
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

  showPlaytime = () => {
    if (this.modPlayer) {
      this.playTime = 'Pt ' + this.modPlayer.pattern.patternIndex;
    }
    else if (this.sidPlayer) {
      this.playTime = this.createPlayTime(this.sidPlayer.getplaytime());  
    }
    else {
      this.playTime = this.createPlayTime(this.oggPlayer.currentTime);
    }
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

  loadMod(tune: string): void {
    this.modPlayer.loadModule('assets/mods/' + tune + '.xm');
  }

  loadSid(tune: string): void {
    this.subTune = 0;
    this.sidPlayer.loadinit('assets/sids/' + tune + '.sid', this.subTune);
  }

  loadOgg(tune: string): void {
    this.subTune = 0;
    this.subTunes = 1;
    this.info = tune;
    this.oggPlayer.src = 'assets/oggs/' + tune + '.ogg';
    this.oggPlayer.load();
  }

  loadTune(tune: string): void {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    if (this.sids.includes(tune)) {
      if (this.sidPlayer) {
        this.loadSid(tune);
      }
      else {
        this.initSid(tune);
      }
    }
    else if (this.mods.includes(tune)) {
      if (this.modPlayer) {
        this.loadMod(tune);
      }
      else {
        this.initMod(tune);
      }
    }
    else if (this.oggs.includes(tune)) {
      if (this.oggPlayer) {
        this.loadOgg(tune);
      }
      else {
        this.initOgg(tune);
      }
    }
    else {
      alert('No player to load ' + tune);
    }
    this.loadedTune = tune;
  }

  selectChange(): void {
    const label = this.getLabel();
    if (label !== this.optgroupLabel) {
      if (this.playing) {
        this.stopPlayer(this.optgroupLabel);
        this.loadTune(this.selectedTune);
      }
      this.optgroupLabel = label;
    }
  }

  getLabel(): string {
    const optgroup = document.querySelector('select option:checked').parentElement as HTMLOptGroupElement;
    return optgroup.label;
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
    this.ctx.fillRect(0, 0, this.canvas.width, 1);
    
    // Color the voices
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
