export class ScripTracker {
  audioContext: AudioContext;
  outputNode: AudioWorkletNode;

  private loadcallback?: (player, songName, songLength) => void;
  private ordercallback?: (player, currentOrder, songLength, patternIndex) => void;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  async init(): Promise<void> {
    await this.audioContext.audioWorklet.addModule('/assets/worklets/mod-worklet.js');

    this.outputNode = new AudioWorkletNode(this.audioContext, 'mod-processor', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
      processorOptions: {
        bufferlen: 4096
      }
    });

    this.outputNode.port.onmessage = ({ data }) => {
      switch (data.type) {
        case 'ready':
          this.loadcallback(this, data.songName, data.songLength);
          break;

        case 'order':
          this.ordercallback(this, data.currentOrder, data.songLength, data.currentPattern);
          break;
      }
    };
  }

  on(event: string, handler: Function): void {
    if (event === 'ready') {
      this.loadcallback = (player, songName, songLength) =>
        handler(player, songName, songLength);
    }
    if (event === 'order') {
      this.ordercallback = (player, currentOrder, songLength, patternIndex) =>
        handler(player, currentOrder, songLength, patternIndex);
    }
  }

  async loadModule(url: string): Promise<void> {
    const response = await fetch(url);
    const modFile = await response.arrayBuffer();
    const fileExt = url.split('.').pop();

    this.outputNode.port.postMessage(
      {
        type: 'load',
        modFile,
        fileExt
      },
      [modFile]
    );
  }

  play(): void {
    this.outputNode.port.postMessage({ type: 'play' });
  }

  stop(): void {
    this.outputNode.port.postMessage({ type: 'stop' });
  }

  nextOrder(): void {
    this.outputNode.port.postMessage({ type: 'nextOrder' });
  }

  prevOrder(): void {
    this.outputNode.port.postMessage({ type: 'prevOrder' });
  }
}
