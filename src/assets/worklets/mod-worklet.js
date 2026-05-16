import { Channel }   from "./channel.js";
import { ModModule } from "./mod_module.js";
import { S3mModule } from "./s3m_module.js";
import { XmModule }  from "./xm_module.js";
import { Sample }    from "./sample.js";
import { Effects }   from "./effects.js";

class MODProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);

    this.module      = null;			// Module file that is playing.
	  this.pattern     = null;			// The current pattern being played.
	  this.orderIndex  = 0;				// Index in the order table of the module.
	  this.currentRow  = 0;				// Current row in pattern.
	  this.currentTick = 0;				// Current tick in row.

	  this.sampleRate     = 0;			// Playback sample rate defined by the audioContext.
	  this.bpm            = 0;			// Current BPM.
	  this.ticksPerRow    = 0;			// Current number of ticks in one row (tempo).
	  this.samplesPerTick = 0;			// Number of samples to process for the current tick.
	  this.sampleCount    = 0;			// Number of samples processed for the current tick.
	  this.sampleStepping = 0;			// Base sample step based on 125 / 6. 
	  this.isPlaying      = false;		// Is the player currently playing?

	  this.masterVolume     = 1;			// The master volume multiplier.
	  this.masterVolSlide   = 0;			// Master volume delta per tick.
	  this.breakPattern     = -1;			// Pattern break row to restart next order.
	  this.orderJump        = -1;			// Order jump index of next order.
	  this.rowJump          = -1;			// Row to jump to when looping
	  this.patternDelay     = 0;			// Pattern delay will keep the player at the current row until 0.
	  this.patternLoop      = false;		// Do not jump to next order, but repeat current.
	  this.channelRegisters = [];			// Channel registers containing the player data for each channel.

    this.Events = {
        playerReady: "SONG_LOADED",
        play:        "PLAY",
        stop:        "STOP",
        songEnded:   "SONG_END",
        row:         "NEW_ROW",
        order:       "NEW_ORDER",
        instrument:  "INSTRUMENT",
        effect:      "EFFECT",
        error:       "ERROR"
    };

	  this.eventHandlers = {
		  SONG_LOADED: [],
		  PLAY:        [],
		  STOP:        [],
		  SONG_END:    [],
		  NEW_ROW:     [],
		  NEW_ORDER:   [],
		  INSTRUMENT:  [],
		  EFFECT:      []
	  };

    this.sampleRate     = sampleRate;
	  this.sampleStepping = Math.round(this.sampleRate * 0.02) * 3;

    this.port.onmessage = (event) => {
      const msg = event.data || {};
      switch (msg.type) {
        case 'load':
          this.load(msg.modFile, msg.fileExt);
          break;
        case 'play':
          this.play();
          break;
        case 'stop':
          this.stop();
          break;
        case 'nextOrder':
          this.nextOrder();
          break;
        case 'prevOrder':
          this.prevOrder();
          break;
      }
    };
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    if (!output || !this.isPlaying || !this.module) return true;

    const left = output[0];
    const right = output[1] || output[0];

    for (let i = 0; i < left.length; i++) {
      let sampleL = 0;
      let sampleR = 0;

      for (var c = 0; c < this.module.channels; c ++) {
        var registers = this.channelRegisters[c];

        if (registers.sample.sample) {
          var sample = registers.sample.sample.sample[Math.floor(registers.sample.position)];

          var vEnvelopeValue = registers.volume.envelope.getValue(registers.envelopePos, registers.noteReleased, 1.0);
          var pEnvelopeValue = registers.panning.envelope.getValue(registers.envelopePos, registers.noteReleased, 0.5);
          var vol = vEnvelopeValue * registers.tremolo.volume * registers.volume.channelVolume; // registers.volume.sampleVolume * 
          var pan = Math.max(0.0, Math.min(registers.panning.pan + ((pEnvelopeValue - 0.5) * ((2 - Math.abs(registers.panning.pan - 2)) / 0.5)), 1.0));
          registers.envelopePos += 1 / this.samplesPerTick;

          // Normal panning.
          if (!registers.isMuted && !registers.tremor.muted) {
            if (registers.panning.pan <= 1.0) {
              sampleL += sample * (1.0 - pan) * vol;
              sampleR += sample *        pan  * vol;

            // Surround sound.
            } else {
              sampleL += sample * 0.5 * vol;
              sampleR -= sample * 0.5 * vol;
            }
          }

          registers.sample.position += registers.sample.reversed ? -registers.sample.step : registers.sample.step;
          registers.sample.remain   -= Math.abs(registers.sample.step);

          // Loop or stop the sample when we reach its end.
          if (registers.sample.remain <= 0) {
            if (registers.sample.sample.loopType === Sample.LoopType.FORWARD) {
              registers.sample.position = registers.sample.sample.loopStart  - registers.sample.remain;
              registers.sample.remain   = registers.sample.sample.loopLength + registers.sample.remain;
            } else if (registers.sample.sample.loopType === Sample.LoopType.PINGPONG) {
              registers.sample.position = Math.max(registers.sample.sample.loopStart, registers.sample.position);
              registers.sample.position = Math.min(registers.sample.sample.loopStart + registers.sample.sample.loopLength - 1, registers.sample.position);
              registers.sample.remain   = registers.sample.sample.loopLength;
              registers.sample.reversed = !registers.sample.reversed;
            } else {
              registers.sample.position = registers.sample.sample.sampleLength - 1;
              registers.sample.step     = 0;
            }
          }
        }
      }

      left[i] = sampleL * this.masterVolume;
      right[i] = sampleR * this.masterVolume;

      this.sampleCount++;
      if (this.sampleCount === this.samplesPerTick) {
        this.sampleCount = 0;
        this.currentTick++;
        if (this.currentTick === this.ticksPerRow) {
          this.processRowEnd();
        }
        this.processTick();
      }
    }

    return true;
  }

  processTick() {
    if (this.currentTick === 0) {
      if (this.currentRow === 0) {
        this.port.postMessage({
            type: 'order',
            currentOrder: this.orderIndex + 1,
            songLength: this.module.songLength,
            currentPattern: this.getCurrentPattern()
        });
      }
    }

    for (var c = 0; c < this.module.channels; c ++) {
      var registers   = this.channelRegisters[c];
      var note        = this.pattern.note[this.currentRow][c];
      var instrIndex  = this.pattern.instrument[this.currentRow][c];
      var volume      = this.pattern.volume[this.currentRow][c];
      var effect      = this.pattern.effect[this.currentRow][c];
      var effectParam = this.pattern.effectParam[this.currentRow][c];

      if (this.currentTick === 0) {
        // Change instrument and retrigger current note.
        if (instrIndex !== 0) {
          registers.instrument = instrIndex;
          this.dispatchEvent(this.Events.instrument, this, c, registers.instrument, note, effect, effectParam);
          var instrument = this.module.instruments[instrIndex - 1];
          if (instrument) {
            var sampleKey = Math.max(0, instrument.sampleKeyMap[note] - 1);

            // Set sample and envelope registers.
            if (instrument.samples[sampleKey]) {
              registers.sample.sample       = instrument.samples[sampleKey];				// Set sample based on current note.
              registers.sample.remain       = registers.sample.sample.sampleLength		// Remaining length of this sample.
              registers.volume.sampleVolume = registers.sample.sample.volume;				// Set base sample volume.
            }
            registers.sample.position  = 0;													// Restart sample.
            registers.sample.restart   = 0;													// Reset sample restart position.
            registers.sample.reversed  = false;												// Reset sample reverse playback.
            registers.volume.envelope  = instrument.volumeEnvelope;							// Get volume envelope.
            registers.panning.envelope = instrument.panningEnvelope;						// Get panning envelope.
            registers.envelopePos      = 0;													// Reset volume envelope.
            registers.noteReleased     = false;												// Reset decay.

            // Set channel panning (for MOD use predefined panning).
            if (this.module.type !== "mod" && registers.sample.sample) {
              registers.panning.pan = registers.sample.sample.panning;
            }
            
            // Remove sample if it has no data.
            if (registers.sample.sample && registers.sample.sample.sampleLength < 1) {
              registers.sample.sample = null;
            }
          } else {
            registers.sample.sample = null;													// Undefined instrument, so no sample!
          }
        }

        // This row contains a note and we are not doing a slide to note.
        if (note !== 0 && effect !== Effects.TONE_PORTA && effect !== Effects.TONE_PORTA_VOL_SLIDE) {
          // On stop note start the release part of the envelope.
          if (note === 97) {
            registers.note         = note;
            registers.noteReleased = true;													// Start release portion of envelopes.
          } else {
            registers.note = note - 1;

            // Update sample frequency according to new note if we have a sample loaded.
            if (registers.sample.sample !== null) {
              registers.period = 7680 - (note - 26 - registers.sample.sample.basePeriod) * 64 - registers.sample.sample.fineTune / 2;
              var freq = 8363 * Math.pow (2, (4608 - registers.period) / 768);

              registers.sample.position     = registers.sample.restart;					// Restart sample from restart position (can be changed by sample offset efect!).
              registers.volume.sampleVolume = registers.sample.sample.volume;				// Reset sample volume.
              registers.sample.remain       = registers.sample.sample.sampleLength - registers.sample.restart		// Repeat length of this sample.
              registers.sample.step         = freq / this.sampleStepping;					// Samples per division.
              registers.sample.reversed     = false;										// Reset sample reverse playback.
              registers.noteDelay           = 0;											// Reset note delay.

              // Dispatch instrument event only if no new instrument was set.
              if (instrIndex === 0) {
                this.dispatchEvent(this.Events.instrument, this, c, registers.instrument, note, effect,effectParam);
              }
            }
          }
        }

        registers.tremolo.volume = 1.0;															// Reset tremolo on each row.
        registers.tremor.muted = false;															// Reset tremor on each new row.
        if (volume >= 0 && volume <= 64) {														// Change channel volume.
          registers.volume.channelVolume = volume / 64;
        } else if (note < 97 && instrIndex !== 0) {
          registers.volume.channelVolume = registers.volume.sampleVolume;
        }

        if (effect !== Effects.NONE) {
          this.dispatchEvent(this.Events.effect, this, c, registers.instrument, note, effect, effectParam);
        }
      }

      // Handle volume column effects and regular effects.
      if (volume > 64) Effects.VOLUME_EFFECT.handler(registers, volume, this.currentTick, c, this);
      effect.handler(registers, effectParam, this.currentTick, c, this);
    }
  }

  processRowEnd() {
    // If an order jump is encountered jump to row 1 of the order at the given index.
	if (this.orderJump !== -1 && !this.patternLoop) {
	  this.currentRow = -1;
	  this.orderIndex = Math.min(this.module.songLength - 1, this.orderJump);
  	  this.pattern    = this.module.patterns[this.module.orders[this.orderIndex]];
	}

	// Handle pattern break if there is one.
	if (this.breakPattern !== -1) {
	  this.currentRow = this.breakPattern - 1;

	  // Only handle pattern break when not looping a pattern.
	  if (!this.patternLoop && this.orderJump === -1) {
		this.orderIndex ++;

		// Handle the skip order marker.
		while (this.module.orders[this.orderIndex] === 0xFE && this.orderIndex < this.module.songLength) {
		  this.orderIndex ++
		}

		// When we reach the end of the song jump back to the restart position.
		if (this.orderIndex === this.module.songLength || this.module.orders[this.orderIndex] == 0xFF) {
		  this.orderIndex = this.module.restartPosition;
		}

		this.pattern = this.module.patterns[this.module.orders[this.orderIndex]];
	  }
	}

	// Jump to a particular row in the current pattern;
	if (this.rowJump !== -1) {
	  this.currentRow = this.rowJump - 1;
	  this.rowJump = -1;
	}

	// Remain at the current row if pattern delay is active.
	if (this.patternDelay < 2) {
	  this.orderJump    = -1;
	  this.breakPattern = -1;
	  this.currentTick  = 0;
	  this.patternDelay = 0;
	  this.currentRow ++;
	} else {
	  this.patternDelay --;
	}

	// Stop and reset if we no longer have a pattern to work with.
	if (!this.pattern) {
	  this.stop();
	  this.rewind();
	  this.resetPlayback();
	  return;
	}

	// When we reach the end of our current pattern jump to the next one.
	if (this.currentRow === this.pattern.rows) {
	  this.currentRow = 0;
	  if (!this.patternLoop) this.orderIndex ++;

	  // Handle the skip order marker.
	  while (this.module.orders[this.orderIndex] === 0xFE && this.orderIndex < this.module.songLength) {
		this.orderIndex ++
	  }

	  // When we reach the end of the song jump back to the restart position.
	  if (this.orderIndex >= this.module.songLength || this.module.orders[this.orderIndex] === 0xFF) {
		this.dispatchEvent(this.Events.songEnded, this);
		this.orderIndex = this.module.restartPosition;
		this.resetPlayback();
	  }

	  this.pattern = this.module.patterns[this.module.orders[this.orderIndex]];
	}
  }

  load(modFile, fileExt) {
    const data = new Uint8Array(modFile);
    switch (fileExt) {
      case 'mod':
        this.module = new ModModule(data);
        break;
      case 's3m':
        this.module = new S3mModule(data);
        break;
      case 'xm':
        this.module = new XmModule(data);
        break;
      default:
        return;
    }

    this.channelRegisters = [];
    for (var i = 0; i < this.module.channels; i ++) {
      this.channelRegisters.push(new Channel());

      // TODO: This should be part of the MOD loader I guess.
      if (this.module.type == "mod") {
        this.channelRegisters[i].panning.pan = (i % 2 == 0) ? 0.7 : 0.3;
      }
    }

    this.resetPlayback();

    this.port.postMessage({
      type: 'ready',
      songName: this.module.name,
      songLength: this.module.songLength,
      currentOrder: this.orderIndex + 1,
      currentPattern: this.getCurrentPattern()
    });
  }

  play() {
    if (!this.isPlaying && this.module != null) {
	  this.dispatchEvent(this.Events.play, this);
	  this.isPlaying = true;
	  this.processTick();
	}
  }

  stop() {
    this.isPlaying = false;
  }

  prevOrder() {
    if (this.module != null && this.orderIndex - 1 >= 0 && this.module.orders[this.orderIndex] != 0xFE) {
	  this.orderIndex --;
  	  this.pattern = this.module.patterns[this.module.orders[this.orderIndex]];
	  this.restartOrder();
	}
  }

  nextOrder() {
    if (this.module != null && this.orderIndex < this.module.orders.length - 1) {
	  this.orderIndex ++;
	  this.pattern = this.module.patterns[this.module.orders[this.orderIndex]];
	  this.restartOrder();
	}
  }

  rewind() {
    this.orderIndex  = 0;
	this.pattern = this.module.patterns[this.module.orders[this.orderIndex]];
	this.restartOrder();
  }

  restartOrder() {
    this.currentRow  = 0;
    this.currentTick = 0;
    this.sampleCount = 0;

    for (var c = 0; c < this.module.channels; c ++) {
      this.channelRegisters[c].reset();
    }

    this.processTick();
  }

  resetPlayback() {
    for (var c = 0; c < this.channelRegisters.length; c ++) {
      this.channelRegisters[c].reset();
    }

    this.masterVolume   = 0.9;
    this.masterVolSlide = 0;
    this.breakPattern   = -1;
    this.orderJump      = -1;
    this.rowJump        = -1;
    this.patternDelay   = 0;

    this.orderIndex  = 0;
    this.currentRow  = 0;
    this.currentTick = 0;
    this.sampleCount = 0;

    this.pattern = this.module.patterns[this.module.orders[this.orderIndex]];

    Effects.SET_TEMPO.handler (this.channelRegisters[0], this.module.defaultBPM,   0, 0, this);
    Effects.SET_SPEED.handler (this.channelRegisters[0], this.module.defaultTempo, 0, 0, this);
  }

  isMuted(channel) {
	if (channel < this.channelRegisters.length) {
      return this.channelRegisters[channel].isMuted;
	} else {
      return true;
	}
  }

  isPatternLoop() {
    return this.patternLoop;
  }

  setMute(channel, mute) {
	if (channel < this.channelRegisters.length) {
      this.channelRegisters[channel].isMuted = mute;
	}
  }

  setPatternLoop(loop) {
	this.patternLoop = loop;
  }

  getSongName() {
    return this.module.name;
  }

  getCurrentOrder() {
	return this.orderIndex + 1;
  }

  getCurrentPattern() {
    return this.module.orders[this.orderIndex];
  }

  getSongLength = function () {
    return this.module.songLength;
  }

  getCurrentBPM() {
    return this.bpm;
  }

  getCurrentTicks() {
    return this.ticksPerRow;
  }

  getCurrentRow() {
	return this.currentRow;
  }

  getPatternRows() {
	return this.pattern.rows;
  }

  getChannelVolume(channel) {
    return this.channelRegisters[channel].volume.sampleVolume * this.channelRegisters[channel].volume.channelVolume * this.masterVolume;
  }

  getChannelInstrument(channel) {
	var registers = this.channelRegisters[channel];
	if (registers.sample.sample && registers.sample.step > 0) {
		return registers.sample.sample.name;
	} else {
		return "";
	}
  }

  getNoteInfo(channel, row) {
    return this.pattern.toText(row, channel, this.module.type);
  }

  getSampleRate() {
    return this.sampleRate;
  }

  getCurrentNote(channel) {
    return this.pattern.note[this.currentRow][channel];
  }

  getMasterVolume() {
    return this.masterVolume;
  }

  setMasterVolume(value) {
    this.masterVolume = value;
  }

  on(event, handler) {
    switch (event) {
	  case this.Events.instrument:
	  case this.Events.effect:
		this.eventHandlers[event].push({
		  handler: arguments[2],
		  param:   arguments[1]
		});
		break;

	  default:
		this.eventHandlers[event].push(handler);
		break;
	}
  }

  off(event, handler) {
    var handlers = this.eventHandlers[event];

	switch (event) {
  	  case this.Events.instrument:
	  case this.Events.effect:
		for (var i = 0; i < handlers.length; i ++) {
		  if (arguments.length === 1 || (handlers[i].handler === arguments[2] && handlers[i].param === arguments[1])) {
			handlers.splice(i, 1);
			i --;
		  }
		}
		break;

	  default:
		for (var i = 0; i < handlers.length; i ++) {
		  if (!handler || handlers[i] === handler) {
			handlers.splice(i, 1);
			i --;
		  }
		}
		break;
	}
  }

  dispatchEvent(event, player, channel, instrument, note, effect, effectParam) {
	var handlers = this.eventHandlers[event];

	switch (event) {
	  case this.Events.playerReady:
		for (var i = 0; i < handlers.length; i ++) {
		  handlers[i](player, player.getSongName(), player.getSongLength());
		}
		break;

	  case this.Events.order:
		for (var i = 0; i < handlers.length; i ++) {
		  handlers[i](player, player.getCurrentOrder(), player.getSongLength(), player.getCurrentPattern());
		}
		break;

	  case this.Events.row:
		for (var i = 0; i < handlers.length; i ++) {
		  handlers[i](player, player.getCurrentRow(), player.getPatternRows());
		}
		break;

	  case this.Events.instrument:
		for (var i = 0; i < handlers.length; i ++) {
		  if (handlers[i].param === instrument) handlers[i].handler(player, instrument, channel, note, effect, effectParam);
		}
		break;

	  case this.Events.effect:
		for (var i = 0; i < handlers.length; i ++) {
		  if (handlers[i].param === effect) handlers[i].handler(player, effect, effectParam, channel, instrument, note);
		}
		break;

	  case this.Events.error:
		for (var i = 0; i < handlers.length; i ++) {
		  handlers[i].handler(player, channel);
		}
		break;

	  default:
		for (var i = 0; i < handlers.length; i ++) {
		  handlers[i](player);
		}
		break;
	}
  }
}

registerProcessor('mod-processor', MODProcessor);
