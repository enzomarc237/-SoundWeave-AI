import React from 'react';
import { Play, Square, Circle, SkipBack, Share2, Download, Cloud } from 'lucide-react';
import { ProjectState } from '../types';

interface HeaderProps {
  projectState: ProjectState;
  setProjectState: React.Dispatch<React.SetStateAction<ProjectState>>;
}

const Header: React.FC<HeaderProps> = ({ projectState, setProjectState }) => {
  const togglePlay = () => {
    setProjectState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  return (
    <header className="h-14 bg-[#181818] border-b border-[#333] flex items-center justify-between px-4 select-none z-20">
      {/* Logo Section */}
      <div className="flex items-center gap-4 w-64">
        <div className="w-8 h-8 bg-gradient-to-br from-[#00E5FF] to-blue-600 rounded-lg flex items-center justify-center font-bold text-black text-lg">
          S
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide">SoundWeave AI</h1>
          <div className="text-[10px] text-[#00E5FF] flex items-center gap-1">
             <Cloud size={10} /> Saved
          </div>
        </div>
      </div>

      {/* Transport Controls */}
      <div className="flex items-center gap-6 bg-[#121212] px-6 py-2 rounded-full border border-[#333] shadow-lg">
        <div className="flex items-center gap-4 text-gray-400">
           <div className="text-center">
              <div className="text-[10px] font-bold text-gray-500">BPM</div>
              <div className="text-sm font-mono text-[#00E5FF]">{projectState.bpm}</div>
           </div>
           <div className="text-center">
              <div className="text-[10px] font-bold text-gray-500">KEY</div>
              <div className="text-sm font-mono text-[#FFC107]">{projectState.keyRoot} {projectState.keyScale}</div>
           </div>
        </div>

        <div className="h-8 w-[1px] bg-[#333]" />

        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-white transition-colors">
            <SkipBack size={20} />
          </button>
          <button 
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${projectState.isPlaying ? 'bg-[#00E5FF] text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]' : 'bg-[#333] text-white hover:bg-[#444]'}`}
            onClick={togglePlay}
          >
            {projectState.isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>
          <button className="text-red-500 hover:text-red-400 transition-colors animate-pulse">
            <Circle size={20} fill="currentColor" />
          </button>
        </div>
        
        <div className="h-8 w-[1px] bg-[#333]" />
        
        <div className="font-mono text-xl text-[#00E5FF]">
            00:0{projectState.currentTime.toFixed(0)}:00
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 w-64 justify-end">
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs bg-[#222] border border-[#333] rounded hover:border-[#00E5FF] text-gray-300 transition-colors">
            <Share2 size={14} />
            Invite
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs bg-[#00E5FF] text-black font-bold rounded hover:bg-[#00b8cc] transition-colors">
            <Download size={14} />
            Export
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border border-white/20"></div>
      </div>
    </header>
  );
};

export default Header;
