import { Card } from './ui/card';
import { Play, Eye, User } from 'lucide-react';
import { motion } from 'motion/react';

export interface ReelData {
  id: string;
  author: string;
  thumbnail: string;
  title: string;
  views: string;
}

interface ReelProps {
  reel: ReelData;
}

export function Reel({ reel }: ReelProps) {
  return (
    <Card className="relative overflow-hidden cursor-pointer group rounded-2xl border-white/10 bg-black shadow-2xl active:scale-[0.97] transition-all duration-300">
      <div className="aspect-[9/16] relative">
        <img
          src={reel.thumbnail}
          alt={reel.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Overlay with glassmorphism feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity group-hover:opacity-80" />
        
        {/* Central Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 shadow-2xl">
            <Play className="w-6 h-6 text-white ml-1 fill-white/20" />
          </div>
        </div>

        {/* Content Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center border border-white/20">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-white text-[10px] font-black uppercase tracking-widest truncate">
              {reel.author}
            </p>
          </div>
          
          <h4 className="text-white text-xs font-bold line-clamp-2 leading-tight uppercase tracking-tight group-hover:text-blue-400 transition-colors">
            {reel.title}
          </h4>
          
          <div className="flex items-center gap-1.5 pt-1">
            <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-widest bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/5">
              <Eye className="w-3 h-3 text-blue-400" />
              {reel.views} vistas
            </div>
          </div>
        </div>

        {/* Top badge */}
        <div className="absolute top-3 right-3">
          <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <Play className="w-3 h-3 text-white fill-current" />
          </div>
        </div>
      </div>
    </Card>
  );
}
