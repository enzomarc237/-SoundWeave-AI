import { Track, TrackType, ClipType } from './types';

export const COLORS = {
  bg: '#121212',
  surface: '#1E1E1E',
  border: '#333333',
  neonBlue: '#00E5FF',
  neonAmber: '#FFC107',
  neonGreen: '#00E676',
  text: '#E0E0E0',
  mutedText: '#888888',
};

export const INITIAL_TRACKS: Track[] = [
  {
    id: 't1',
    name: 'Drums',
    type: TrackType.AUDIO,
    muted: false,
    soloed: false,
    volume: 0.8,
    pan: 0,
    clips: [
      { id: 'c1', name: 'Kick Loop', startBar: 0, durationBars: 4, type: ClipType.HUMAN, color: COLORS.neonAmber },
      { id: 'c2', name: 'Full Kit', startBar: 4, durationBars: 4, type: ClipType.HUMAN, color: COLORS.neonAmber }
    ]
  },
  {
    id: 't2',
    name: 'Bass',
    type: TrackType.MIDI,
    muted: false,
    soloed: false,
    volume: 0.7,
    pan: 0,
    clips: []
  },
  {
    id: 't3',
    name: 'Lead Synth',
    type: TrackType.MIDI,
    muted: false,
    soloed: false,
    volume: 0.6,
    pan: 0.2,
    clips: [
      { id: 'c3', name: 'Arp AI', startBar: 4, durationBars: 4, type: ClipType.AI, color: COLORS.neonBlue }
    ]
  },
  {
    id: 't4',
    name: 'Vocals',
    type: TrackType.AUDIO,
    muted: false,
    soloed: false,
    volume: 0.9,
    pan: 0,
    clips: []
  }
];
