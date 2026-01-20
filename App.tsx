import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Timeline from './components/Timeline';
import Mixer from './components/Mixer';
import CoPilot from './components/CoPilot';
import { Track, ProjectState, Clip, ClipType } from './types';
import { INITIAL_TRACKS, COLORS } from './constants';
import { generateTrackNotes } from './services/geminiService';
import { audioEngine } from './services/audioEngine';

const App: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([
    { ...INITIAL_TRACKS[0], instrument: 'drums' },
    { ...INITIAL_TRACKS[1], instrument: 'bass' },
    { ...INITIAL_TRACKS[2], instrument: 'synth' },
    { ...INITIAL_TRACKS[3], instrument: 'synth' }, // Treat vocals as synth for this demo or handle separately
  ]);
  
  const [projectState, setProjectState] = useState<ProjectState>({
    bpm: 120,
    keyRoot: 'C',
    keyScale: 'Minor',
    isPlaying: false,
    currentTime: 0
  });

  // Sync Audio Engine Parameters when tracks change
  useEffect(() => {
    tracks.forEach(track => {
      audioEngine.updateTrackParams(track);
    });
  }, [tracks]);

  // Sync BPM
  useEffect(() => {
    audioEngine.setBpm(projectState.bpm);
  }, [projectState.bpm]);

  // Handle Play/Stop logic
  useEffect(() => {
    if (projectState.isPlaying) {
      // Start audio engine
      audioEngine.play(tracks, projectState.currentTime, (bar) => {
        // Visual Update Callback (AudioEngine drives this)
        setProjectState(prev => ({ ...prev, currentTime: bar > 32 ? 0 : bar }));
      });
    } else {
      audioEngine.stop();
    }
  }, [projectState.isPlaying]); // Intentionally omitting tracks/currentTime from dep array to avoid restart loops, handled inside engine logic usually, but here simple.

  const handleUpdateTrack = (id: string, updates: Partial<Track>) => {
    setTracks(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updates };
        // Immediate audio update
        audioEngine.updateTrackParams(updated); 
        return updated;
      }
      return t;
    }));
  };

  const handleAddClip = (trackId: string, startBar: number) => {
     // Placeholder for drag/drop
  };

  const handleGenerateClip = async (trackId: string, startBar: number) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    // Visual loading state could go here
    const instrumentType = track.instrument || 'synth';
    
    // Call Gemini
    const result = await generateTrackNotes(
        track.name, 
        instrumentType, 
        projectState.bpm, 
        `${projectState.keyRoot} ${projectState.keyScale}`
    );

    const newClip: Clip = {
        id: `gen_${Date.now()}`,
        name: result.name || "AI Idea",
        startBar: startBar,
        durationBars: 4,
        type: ClipType.AI,
        color: instrumentType === 'drums' ? COLORS.neonAmber : COLORS.neonBlue,
        notes: result.notes // Store the generated notes
    };

    setTracks(prev => prev.map(t => {
        if (t.id === trackId) {
            return { ...t, clips: [...t.clips, newClip] };
        }
        return t;
    }));
  };

  const handleCoPilotGeneration = (trackId: string, description: string) => {
      handleGenerateClip(trackId, 0);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#121212] text-white font-sans overflow-hidden">
      <Header projectState={projectState} setProjectState={setProjectState} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        {/* Main Work Area */}
        <div className="flex flex-col flex-1 relative min-w-0">
            <Timeline 
                tracks={tracks} 
                zoom={60} 
                onAddClip={handleAddClip}
                onGenerateClip={handleGenerateClip}
            />
            
            {/* Playhead Overlay */}
            <div 
                className="absolute top-0 bottom-0 w-[1px] bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] z-20 pointer-events-none transition-transform duration-75 ease-linear"
                style={{ left: `${projectState.currentTime * 60}px` }} 
            >
                <div className="w-3 h-3 -ml-[5px] bg-[#00E5FF] rotate-45 transform -mt-1.5 shadow-sm"></div>
            </div>

            <Mixer tracks={tracks} onUpdateTrack={handleUpdateTrack} />
        </div>

        <CoPilot 
            projectState={projectState} 
            tracks={tracks}
            onGenerateClip={handleCoPilotGeneration}
        />
      </div>
    </div>
  );
};

export default App;
