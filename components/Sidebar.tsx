import React from 'react';
import { Library, Folder, Music2, Mic2, Disc, Sliders } from 'lucide-react';

const Sidebar: React.FC = () => {
  const categories = [
    { name: 'Drums & Perc', icon: Disc, count: 120 },
    { name: 'Basslines', icon: Sliders, count: 45 },
    { name: 'Synths & Keys', icon: Music2, count: 89 },
    { name: 'Vocals', icon: Mic2, count: 32 },
    { name: 'My Uploads', icon: Folder, count: 12 },
  ];

  return (
    <div className="w-64 bg-[#181818] border-r border-[#333] flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-[#333]">
        <div className="flex items-center gap-2 text-gray-400 mb-4">
            <Library size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Browser</span>
        </div>
        <input 
            type="text" 
            placeholder="Search sounds..." 
            className="w-full bg-[#121212] border border-[#333] rounded px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {categories.map((cat) => (
            <div key={cat.name} className="px-4 py-3 hover:bg-[#222] cursor-pointer group border-b border-[#222] transition-colors">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <cat.icon size={16} className="text-gray-500 group-hover:text-[#00E5FF]" />
                        <span className="text-sm text-gray-300 group-hover:text-white">{cat.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-600 group-hover:text-gray-400">{cat.count}</span>
                </div>
            </div>
        ))}
        
        <div className="p-4 mt-4">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Pack of the Month</div>
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-3 rounded-lg border border-white/10">
                <div className="text-xs font-bold text-white mb-1">Cyberpunk 2077</div>
                <div className="text-[10px] text-gray-300 mb-2">Dark synths & glitches</div>
                <button className="w-full bg-white/10 hover:bg-white/20 text-white text-[10px] py-1 rounded">Preview</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
