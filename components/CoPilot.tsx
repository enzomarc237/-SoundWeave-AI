import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Music, Bot } from 'lucide-react';
import { ChatMessage, ProjectState, Track } from '../types';
import { sendCoPilotMessage, generateTrackIdea } from '../services/geminiService';
import { COLORS } from '../constants';

interface CoPilotProps {
  projectState: ProjectState;
  tracks: Track[];
  onGenerateClip: (trackId: string, description: string) => void;
}

const CoPilot: React.FC<CoPilotProps> = ({ projectState, tracks, onGenerateClip }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I'm your SoundWeave Co-Pilot. I see we're working in ${projectState.keyRoot} ${projectState.keyScale} at ${projectState.bpm} BPM. Need a bassline or mixing advice?`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const context = `Tracks: ${tracks.map(t => t.name).join(', ')}. BPM: ${projectState.bpm}. Key: ${projectState.keyRoot} ${projectState.keyScale}.`;
    const aiResponseText = await sendCoPilotMessage(input, context);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: aiResponseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleGenerateIdea = async () => {
    // Find an empty or focused track, defaults to a new idea
    setIsLoading(true);
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: "Generate a creative idea for a new layer.", timestamp: Date.now() }]);
    
    const idea = await generateTrackIdea("New Layer", "Electronic", projectState.bpm);
    
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: `I've devised an idea: "${idea.name}". ${idea.description}. Drag this into the timeline to instantiate (Simulation).`,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#1A1A1A] border-l border-[#333] w-80 shadow-2xl z-10">
      {/* Header */}
      <div className="p-4 border-b border-[#333] flex items-center justify-between bg-[#121212]">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[#00E5FF]" />
          <h2 className="font-bold text-[#00E5FF] tracking-wider">CO-PILOT</h2>
        </div>
        <div className="text-xs text-gray-500">Gemini 3 Pro</div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#333] text-white rounded-br-none'
                  : 'bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] rounded-bl-none'
              }`}
            >
              {msg.sender === 'ai' && <Bot size={14} className="mb-1 opacity-70" />}
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#00E5FF]/10 text-[#00E5FF] text-xs p-2 rounded animate-pulse">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-t border-[#333] grid grid-cols-2 gap-2">
         <button 
           onClick={handleGenerateIdea}
           disabled={isLoading}
           className="bg-[#222] hover:bg-[#333] text-[#00E5FF] text-xs py-2 px-3 rounded border border-[#00E5FF]/20 flex items-center justify-center gap-2 transition-colors"
         >
           <Music size={14} />
           Ghost Player
         </button>
         <button 
            onClick={() => setInput("Analyze my mix and suggest improvements.")}
            disabled={isLoading}
            className="bg-[#222] hover:bg-[#333] text-[#FFC107] text-xs py-2 px-3 rounded border border-[#FFC107]/20 flex items-center justify-center gap-2 transition-colors"
         >
           <Sparkles size={14} />
           Mix Assist
         </button>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#333] bg-[#121212]">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me to generate a beat..."
            className="w-full bg-[#222] text-gray-200 text-sm rounded-full pl-4 pr-10 py-3 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 p-1.5 bg-[#00E5FF] text-[#121212] rounded-full hover:bg-[#00b8cc] disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoPilot;
