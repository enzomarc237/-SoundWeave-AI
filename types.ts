export enum TrackType {
  AUDIO = 'AUDIO',
  MIDI = 'MIDI',
  HYBRID = 'HYBRID'
}

export enum ClipType {
  HUMAN = 'HUMAN',
  AI = 'AI'
}

export interface Note {
  note: string; // e.g., "C4", "F#3"
  start: number; // in bars (relative to clip start)
  duration: number; // in bars
  velocity: number; // 0-1
}

export interface Clip {
  id: string;
  name: string;
  startBar: number;
  durationBars: number;
  type: ClipType;
  color: string;
  notes?: Note[]; // The musical data
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  muted: boolean;
  soloed: boolean;
  volume: number; // 0 to 1
  pan: number; // -1 to 1
  clips: Clip[];
  instrument?: 'synth' | 'bass' | 'drums'; // Simple instrument mapping
}

export interface ProjectState {
  bpm: number;
  keyRoot: string;
  keyScale: string;
  isPlaying: boolean;
  currentTime: number; // in bars
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}
