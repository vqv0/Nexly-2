import { Card } from './ui/card';
import { Play } from 'lucide-react';

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
    <Card className="relative overflow-hidden cursor-pointer group">
      <div className="aspect-[9/16] relative">
        <img
          src={reel.thumbnail}
          alt={reel.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white text-sm font-semibold mb-1">{reel.author}</p>
          <p className="text-white/90 text-xs line-clamp-2">{reel.title}</p>
          <p className="text-white/70 text-xs mt-1">{reel.views} vistas</p>
        </div>
      </div>
    </Card>
  );
}
