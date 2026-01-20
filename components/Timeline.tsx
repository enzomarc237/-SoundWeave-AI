import React, { useState } from 'react';
import { Track, Clip, ClipType } from '../types';
import { Plus, Wand2 } from 'lucide-react';

interface TimelineProps {
  tracks: Track[];
  zoom: number; // Pixels per bar
  onAddClip: (trackId: string, startBar: number) => void;
  onGenerateClip: (trackId: string, startBar: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({ tracks, zoom, onAddClip, onGenerateClip }) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const bar = Math.floor(x / zoom);
    setHoveredBar(bar);
  };

  return (
    <div className="flex-1 bg-[#121212] overflow-auto relative flex flex-col">
      {/* Ruler */}
      <div className="h-8 bg-[#1E1E1E] sticky top-0 z-10 flex border-b border-[#333]">
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            key={i}
            className="border-r border-[#333] text-[10px] text-gray-500 pl-1 pt-1 select-none"
            style={{ width: `${zoom}px`, flexShrink: 0 }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Tracks Container */}
      <div className="flex-1 relative" onMouseMove={handleMouseMove}>
        {/* Grid Lines */}
        <div className="absolute inset-0 pointer-events-none flex">
          {Array.from({ length: 32 }).map((_, i) => (
            <div
              key={i}
              className={`h-full border-r ${i % 4 === 0 ? 'border-[#333]' : 'border-[#222]'}`}
              style={{ width: `${zoom}px`, flexShrink: 0 }}
            />
          ))}
        </div>

        {/* Track Rows */}
        {tracks.map((track) => (
          <div
            key={track.id}
            className="h-24 border-b border-[#333] relative group"
            style={{ width: `${32 * zoom}px` }}
          >
            {/* Empty space interaction (Ghost Player Trigger) */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-end pr-4">
                <div className="bg-[#121212]/80 px-2 py-1 rounded border border-[#333] text-xs text-gray-400">
                    Right click to generate
                </div>
            </div>

            {/* Clips */}
            {track.clips.map((clip) => (
              <div
                key={clip.id}
                className={`absolute h-20 top-2 rounded-md border border-opacity-50 overflow-hidden shadow-sm cursor-pointer hover:brightness-110 transition-all`}
                style={{
                  left: `${clip.startBar * zoom}px`,
                  width: `${clip.durationBars * zoom}px`,
                  backgroundColor: `${clip.color}20`, // low opacity bg
                  borderColor: clip.color,
                  borderWidth: '1px'
                }}
              >
                <div className="flex items-center gap-1 px-1 mb-1 absolute top-0 left-0 right-0 bg-black/20">
                    {clip.type === ClipType.AI && <Wand2 size={10} className="text-[#00E5FF]" />}
                    <span 
                        className="text-[10px] font-semibold truncate"
                        style={{ color: clip.color }}
                    >
                    {clip.name}
                    </span>
                </div>
                
                {/* Note Visualization (Piano Roll style) */}
                <div className="w-full h-full relative mt-2">
                    {clip.notes ? clip.notes.map((note, idx) => (
                        <div 
                            key={idx}
                            className="absolute rounded-sm border border-black/20"
                            style={{
                                left: `${(note.start / clip.durationBars) * 100}%`,
                                width: `${(note.duration / clip.durationBars) * 100}%`,
                                top: `${note.note.includes('C') || note.note.includes('Kick') ? '80%' : note.note.includes('Snare') ? '50%' : '20%'}`, // Simple Y pos based on type
                                height: '15%',
                                backgroundColor: clip.color
                            }}
                        />
                    )) : (
                        // Fallback simulated waveform for Audio tracks without note data
                        <div className="h-full w-full flex items-center gap-[2px] opacity-60 px-1">
                            {Array.from({length: 10}).map((_, idx) => (
                                <div key={idx} className="flex-1 bg-current rounded-full" style={{ 
                                    height: `${30 + Math.random() * 60}%`,
                                    color: clip.color
                                }} />
                            ))}
                        </div>
                    )}
                </div>
              </div>
            ))}
            
            {/* Add Button Placeholder (visible on hover if empty space) */}
             <div 
                className="absolute top-1/2 -translate-y-1/2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer bg-[#222] p-1 rounded-full border border-[#444] hover:border-[#00E5FF]"
                onClick={() => onGenerateClip(track.id, 0)}
                title="Generate AI Clip"
             >
                 <Plus size={16} className="text-white" />
             </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
