import { Track, Note, ProjectState } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private nextNoteTime: number = 0;
  private timerID: number | undefined;
  private isPlaying: boolean = false;
  private bpm: number = 120;
  
  // Lookahead variables
  private lookahead: number = 25.0; // milliseconds
  private scheduleAheadTime: number = 0.1; // seconds

  // Master Bus
  private masterGain: GainNode | null = null;
  
  // Track Nodes: Map<TrackID, { input: GainNode, panner: StereoPannerNode }>
  private trackNodes: Map<string, { gain: GainNode, panner: StereoPannerNode }> = new Map();

  // Initialization
  init() {
    if (!this.ctx) {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      // Master Chain
      this.masterGain = this.ctx!.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.ctx!.destination);
    }
    
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setBpm(bpm: number) {
    this.bpm = bpm;
  }

  // Managing Track Routing (Volume/Pan)
  updateTrackParams(track: Track) {
    if (!this.ctx || !this.masterGain) return;

    let nodes = this.trackNodes.get(track.id);

    if (!nodes) {
      // Create nodes if they don't exist
      const gain = this.ctx.createGain();
      const panner = this.ctx.createStereoPanner();
      gain.connect(panner);
      panner.connect(this.masterGain);
      nodes = { gain, panner };
      this.trackNodes.set(track.id, nodes);
    }

    // Apply updates
    const now = this.ctx.currentTime;
    // Mute handling
    const finalVolume = track.muted ? 0 : track.volume;
    nodes.gain.gain.setTargetAtTime(finalVolume, now, 0.02);
    nodes.panner.pan.setTargetAtTime(track.pan, now, 0.02);
  }

  // Transport Controls
  play(tracks: Track[], startBar: number, onTick: (currentBar: number) => void) {
    this.init();
    if (this.isPlaying) return;

    this.isPlaying = true;
    
    // Calculate start time in seconds based on startBar
    // We assume play starts "now" but visually maps to startBar
    // For simplicity in this demo, we reset transport to 'nextNoteTime'
    this.nextNoteTime = this.ctx!.currentTime + 0.05;
    
    // Internal cursor for scheduling
    let currentScheduleBar = startBar;

    const scheduler = () => {
      // While there are notes that will need to play before the next interval, schedule them
      while (this.nextNoteTime < this.ctx!.currentTime + this.scheduleAheadTime) {
        this.scheduleNotes(currentScheduleBar, tracks);
        this.nextNoteTime += (60.0 / this.bpm) / 4; // Advance by 16th note
        currentScheduleBar += 0.0625; // 1/16th of a bar (assuming 4/4)
        
        // Callback for UI to update cursor (throttled visually in React)
        onTick(currentScheduleBar);
      }
      
      if (this.isPlaying) {
        this.timerID = window.setTimeout(scheduler, this.lookahead);
      }
    };
    
    scheduler();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerID) clearTimeout(this.timerID);
  }

  // Scheduling Logic
  private scheduleNotes(bar: number, tracks: Track[]) {
    // Check every track
    tracks.forEach(track => {
      if (track.muted) return;
      const nodes = this.trackNodes.get(track.id);
      if (!nodes) return; // Should be initialized via updateTrackParams

      track.clips.forEach(clip => {
        // Check if clip is active at this bar
        if (bar >= clip.startBar && bar < clip.startBar + clip.durationBars) {
          // Check if any notes in this clip start at this relative time
          const relativeBar = bar - clip.startBar;
          
          if (clip.notes) {
            clip.notes.forEach(note => {
               // Quantize check: simple equality with small epsilon for float errors
               if (Math.abs(note.start - relativeBar) < 0.01) {
                 this.triggerSound(track.instrument || 'synth', note, this.nextNoteTime, nodes!.gain);
               }
            });
          }
        }
      });
    });
  }

  // Synthesizer Engine
  private triggerSound(instrument: string, note: Note, time: number, destination: AudioNode) {
    if (!this.ctx) return;

    if (instrument === 'drums') {
      this.playDrum(note, time, destination);
    } else {
      this.playSynth(instrument, note, time, destination);
    }
  }

  private playSynth(type: string, note: Note, time: number, destination: AudioNode) {
    const osc = this.ctx!.createOscillator();
    const env = this.ctx!.createGain();

    osc.connect(env);
    env.connect(destination);

    // Simple Frequency Map (Basic Octave 4)
    const freq = this.getFreq(note.note);
    osc.frequency.value = freq;

    if (type === 'bass') {
      osc.type = 'sawtooth';
      osc.frequency.value = freq / 2; // Octave down
    } else {
      osc.type = 'triangle'; // Lead
    }

    const durationSec = (note.duration * 4 * (60 / this.bpm)); // Bar duration to seconds

    // ADSR Envelope
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(note.velocity * 0.5, time + 0.02); // Attack
    env.gain.exponentialRampToValueAtTime(0.001, time + durationSec); // Decay/Release

    osc.start(time);
    osc.stop(time + durationSec + 0.1);
  }

  private playDrum(note: Note, time: number, destination: AudioNode) {
    // Simple Drum Synthesis
    const osc = this.ctx!.createOscillator();
    const env = this.ctx!.createGain();
    
    osc.connect(env);
    env.connect(destination);

    if (note.note.toLowerCase().includes('c')) {
      // Kick (Frequency Sweep)
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
      env.gain.setValueAtTime(1, time);
      env.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
      osc.start(time);
      osc.stop(time + 0.5);
    } else if (note.note.toLowerCase().includes('d')) {
       // Snare (Noise - Simplified with high freq triangle for now to avoid buffer boilerplate)
       osc.type = 'triangle';
       osc.frequency.setValueAtTime(300, time); // Body
       env.gain.setValueAtTime(0.5, time);
       env.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
       osc.start(time);
       osc.stop(time + 0.2);
    } else {
      // HiHat (Short high pitch)
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, time); 
      env.gain.setValueAtTime(0.2, time);
      env.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
      osc.start(time);
      osc.stop(time + 0.05);
    }
  }

  private getFreq(noteName: string): number {
    // Very basic mapping, ideally use a full library
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const regex = /([A-G]#?)([0-9])/;
    const match = noteName.match(regex);
    if (!match) return 440; // Default A4

    const semitone = notes.indexOf(match[1]);
    const octave = parseInt(match[2]);
    
    // MIDI Note Number calculation: (Octave + 1) * 12 + Semitone
    const midi = (octave + 1) * 12 + semitone;
    
    // Frequency formula: 440 * 2^((midi - 69) / 12)
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
}

// Singleton export
export const audioEngine = new AudioEngine();
