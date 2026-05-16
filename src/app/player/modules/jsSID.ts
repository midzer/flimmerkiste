export class jsSID {
  audioContext: AudioContext;
  outputNode: AudioWorkletNode;

  private loadcallback?: () => void;

  private title = '';
  private author = '';
  private info = '';
  private subtunes = 1;
  private playtime = 0;
  private registers = new Uint8Array(65536);
  private sidAddress = [0xD400, 0, 0];

  constructor(
    audioContext: AudioContext,
    private bufferlen = 16384,
    private backgroundNoise = 0.0005
  ) {
    this.audioContext = audioContext;
  }

  async init(): Promise<void> {
    await this.audioContext.audioWorklet.addModule('/assets/worklets/sid-worklet.js');

    this.outputNode = new AudioWorkletNode(this.audioContext, 'sid-processor', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [1],
      processorOptions: {
        bufferlen: this.bufferlen,
        backgroundNoise: this.backgroundNoise
      }
    });

    this.outputNode.port.onmessage = ({ data }) => {
      switch (data.type) {
        case 'load-complete':
          this.title = data.title;
          this.author = data.author;
          this.info = data.info;
          this.subtunes = data.subtunes;
          this.sidAddress = data.sidAddress;
          this.loadcallback?.();
          break;
        case 'telemetry':
          this.playtime = data.playtime;
          if (data.registerBase === 0xD000 && data.registers) {
            this.registers.set(data.registers, 0xD000);
          }
          break;
      }
    };
  }

  async loadinit(sidurl: string, subt: number): Promise<void> {
    const response = await fetch(sidurl);
    const sidFile = await response.arrayBuffer();
    this.outputNode.port.postMessage({ type: 'loadinit', sidFile, subtune: subt }, [sidFile]);
  }

  start(subt: number): void {
    this.outputNode.port.postMessage({ type: 'start', subtune: subt });
  }

  resume(): void {
    this.outputNode.port.postMessage({ type: 'resume' });
  }

  pause(): void {
    this.outputNode.port.postMessage({ type: 'pause' });
  }

  setloadcallback(fn: () => void): void { this.loadcallback = fn; }

  gettitle(): string { return this.title; }
  getauthor(): string { return this.author; }
  getinfo(): string { return this.info; }
  getsubtunes(): number { return this.subtunes; }
  getplaytime(): number { return this.playtime; }
  getSIDAddress(chip: number): number { return this.sidAddress[chip] || 0; }
  readregister(register: number): number { return this.registers[register] || 0; }
}
