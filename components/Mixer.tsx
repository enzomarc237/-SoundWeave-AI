import React from 'react';
import { Track } from '../types';
import { Volume2, Mic, Activity } from 'lucide-react';

interface MixerProps {
  tracks: Track[];
  onUpdateTrack: (id: string, updates: Partial<Track>) => void;
}

const Mixer: React.FC<MixerProps> = ({ tracks, onUpdateTrack }) => {
  return (
    <div className="h-64 bg-[#181818] border-t border-[#333] flex items-end overflow-x-auto p-4 gap-2">
      <div className="flex gap-1 h-full pb-2">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="w-20 bg-[#121212] border border-[#333] rounded-md flex flex-col p-2 relative group"
          >
            {/* Track Name */}
            <div className="text-xs text-center font-bold text-gray-400 mb-2 truncate">
              {track.name}
            </div>

            {/* Pan Knob (Visual) */}
            <div className="w-8 h-8 rounded-full border border-[#444] mx-auto mb-4 relative flex items-center justify-center">
                <div 
                    className="w-1 h-3 bg-[#00E5FF] absolute top-1 rounded-full transform origin-bottom" 
                    style={{ transform: `rotate(${track.pan * 45}deg)`}}
                ></div>
            </div>

            {/* Fader Area */}
            <div className="flex-1 relative flex justify-center mb-2">
               <div className="w-1.5 h-full bg-[#222] rounded-full relative">
                    <div 
                        className="absolute bottom-0 w-full bg-gradient-to-t from-[#00E5FF]/20 to-[#00E5FF]/50 rounded-full"
                        style={{ height: `${track.volume * 100}%`}}
                    />
                    {/* Fader Handle */}
                    <div 
                        className="absolute w-8 h-4 bg-[#333] border border-[#555] rounded shadow-lg cursor-pointer -left-[13px] hover:bg-[#444] hover:border-[#00E5FF] transition-colors"
                        style={{ bottom: `${track.volume * 80}%` }} // Simplified positioning
                        onClick={(e) => {
                           // Mock fader movement logic would go here
                           const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                           if(rect) {
                               // logic
                           }
                        }}
                    >
                        <div className="w-full h-[1px] bg-[#00E5FF] mt-1.5 opacity-50"></div>
                    </div>
               </div>
            </div>

            {/* Mute/Solo */}
            <div className="grid grid-cols-2 gap-1 mt-auto">
              <button
                className={`text-[10px] py-1 rounded border ${
                  track.muted
                    ? 'bg-red-500/20 text-red-500 border-red-500'
                    : 'bg-[#222] text-gray-500 border-[#333] hover:bg-[#333]'
                }`}
                onClick={() => onUpdateTrack(track.id, { muted: !track.muted })}
              >
                M
              </button>
              <button
                className={`text-[10px] py-1 rounded border ${
                  track.soloed
                    ? 'bg-[#FFC107]/20 text-[#FFC107] border-[#FFC107]'
                    : 'bg-[#222] text-gray-500 border-[#333] hover:bg-[#333]'
                }`}
                onClick={() => onUpdateTrack(track.id, { soloed: !track.soloed })}
              >
                S
              </button>
            </div>
            
            {/* Level Meter Mockup */}
            <div className="absolute right-1 top-10 bottom-12 w-1 bg-[#111] rounded overflow-hidden">
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 via-yellow-400 to-red-500 opacity-60 animate-pulse" style={{ height: '60%'}}></div>
            </div>

          </div>
        ))}
      </div>
      
      {/* Master Fader */}
       <div className="w-24 bg-[#1a1a1a] border border-[#444] rounded-md flex flex-col p-2 ml-4 h-full relative">
            <div className="text-xs text-center font-bold text-[#00E5FF] mb-2">MASTER</div>
             <div className="flex-1 relative flex justify-center mb-2 gap-2">
                 <div className="w-2 h-full bg-[#000] rounded-full overflow-hidden">
                     <div className="w-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 h-[70%] mt-auto opacity-80" />
                 </div>
                 <div className="w-2 h-full bg-[#000] rounded-full overflow-hidden">
                     <div className="w-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 h-[65%] mt-auto opacity-80" />
                 </div>
             </div>
             <button className="w-full text-[10px] bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 rounded py-1 hover:bg-[#00E5FF]/20">
                 SMART MIX
             </button>
       </div>
    </div>
  );
};

export default Mixer;
