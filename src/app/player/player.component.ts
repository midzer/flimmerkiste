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

  optgroupLabel: string = 'SIDS';
  selectedTune: string = 'Last_Ninja_2';
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
      let label;
      if (this.sids.includes(tune)) {
        label = 'SIDS';
      }
      else if (this.mods.includes(tune)) {
        label = 'MODS';
      }
      else if (this.oggs.includes(tune)) {
        label = 'OGGS';
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
  }

  setup(label: string): void {
    this.modPlayer = null;
    this.sidPlayer = null;
    this.oggPlayer = null;
    if (label === 'MODS') {
      this.setupModPlayer();
    }
    else if (label === 'SIDS') {
      this.setupSidPlayer();
    }
    else {
      this.setupOggPlayer();
    }
    this.optgroupLabel = label;
  }

  setupSidPlayer = () => {
    this.loadScript('jsSID.js').then(() => {
      this.sidPlayer = new jsSID(16384,0.0005);
      this.sidPlayer.setloadcallback(() => {
        this.subTunes = this.sidPlayer.getsubtunes();
        this.info = this.removeNullFromString(this.sidPlayer.getauthor()) + ' - ' +
                    this.removeNullFromString(this.sidPlayer.gettitle());
        this.toggleTune();
      });
      this.loadSid();
    });
  }

  setupModPlayer = () => {
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
      });
      this.loadMod();
    });
  }

  setupOggPlayer = () => {
    this.oggPlayer = new Audio();
    this.oggPlayer.addEventListener('loadeddata', () => {
      if (this.oggPlayer.readyState >= 2) {
        this.toggleTune();
      }
    });
    this.oggPlayer.loop = true;
    this.subTune = 0;
    this.subTunes = 1;
    this.info = this.selectedTune;
    this.loadOgg();
  }

  loadScript (file): Promise<any> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `/assets/js/${file}`;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  play(): void {
    if (this.modPlayer || this.sidPlayer || this.oggPlayer) {
      this.toggleTune();
    }
    else {
      this.setup(this.getLabel());
    }
  }

  toggleTune(): void {
    if (this.playing) {
      this.playButton = this.playIcon;
      window.clearInterval(this.intervalID);
      if (this.modPlayer) {
        this.modPlayer.stop();
      }
      else if (this.sidPlayer) {
        this.sidPlayer.pause();
        window.cancelAnimationFrame(this.requestID);
      }
      else {
        this.oggPlayer.pause();
      }
    }
    else {
      this.playButton = this.pauseIcon;
      this.intervalID = window.setInterval(this.showPlaytime, 1000);
      if (this.modPlayer) {
        this.modPlayer.play();
      }
      else if (this.sidPlayer) {
        this.sidPlayer.playcont();
        this.redrawSpectrum();
      }
      else {
        this.oggPlayer.play();
      }
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
    else if (this.oggPlayer) {
      this.oggPlayer.currentTime += 10;
    }
    else {
      this.play();
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
    else if (this.oggPlayer) {
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

  toggleVideo(): void {
    if (!this.video) {
      this.video = document.getElementById('bgvid') as HTMLVideoElement;
    }
    if (!this.screen) {
      this.screen = document.querySelector('app-screen');
    }
    if (this.videoPlaying) {
      this.video.pause();
      this.videoButtonIcon = this.playVideoIcon;
    }
    else {
      this.video.play();
      this.videoButtonIcon = this.pauseVideoIcon;
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

  loadTune(): void {
    if (this.modPlayer) {
      this.loadMod();
    }
    else if (this.sidPlayer) {
      this.loadSid();
    }
    else {
      this.loadOgg();
    }
  }

  loadMod(): void {
    this.modPlayer.loadModule('assets/mods/' + this.selectedTune + '.xm');
  }

  loadSid(): void {
    this.subTune = 0;
    this.sidPlayer.loadinit('assets/sids/' + this.selectedTune + '.sid', this.subTune);
  }

  loadOgg(): void {
    this.oggPlayer.src = 'assets/oggs/' + this.selectedTune + '.ogg';
    this.oggPlayer.load();
  }
  
  selectChange(): void {
    if (!this.playing) {
      return;
    }
    this.toggleTune();
    const label = this.getLabel();
    if (label === this.optgroupLabel) {
      this.loadTune();
    }
    else {
      this.setup(label);
    }
  }

  getLabel(): string {
    const optgroup = document.querySelector('select option:checked').parentElement as HTMLOptGroupElement;
    return optgroup.label;
  }

  redrawSpectrum = () => {
    if (!this.canvas) {
      this.canvas = document.querySelector('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
    this.onUpdateSpectrum();
    this.ctx.drawImage(this.canvas,
      0, 1, this.canvas.width, this.canvas.height,
      -1, 1, this.canvas.width, this.canvas.height);
    this.requestID = window.requestAnimationFrame(this.redrawSpectrum);
  }

  onUpdateSpectrum(): void {
    this.ctx.fillStyle = '#000';
		this.ctx.fillRect(this.canvas.width - 1, 0, 1, this.canvas.height);
    
    for (let voice = 0; voice < 3; voice++) {
      const freq = this.readRegister(0xD400 + voice * 7, 1) + this.readRegister(0xD401 + voice * 7, 1) * 256;
      let y = (freq / 0xFFFF) * this.canvas.height;
      y = y | 0;

      let strokeStyle;
      if (voice === 0) {
        strokeStyle = '#955529';
      }
      else if (voice === 1) {
        strokeStyle = '#ca7570'; 
      }
      else {
        strokeStyle = '#2c339e';
      }

      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = strokeStyle;
      this.ctx.beginPath();
      this.ctx.moveTo(this.canvas.width, this.canvas.height - y);
      this.ctx.lineTo(this.canvas.width -1, this.canvas.height - y);
      this.ctx.stroke();
    }
  }

  readRegister(register, chip) {
    return this.sidPlayer.readregister(register + this.sidPlayer.getSIDAddress(chip));
  }
}
