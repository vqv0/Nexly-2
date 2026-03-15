import { Card } from './ui/card';
import { Clock, TrendingUp } from 'lucide-react';

export interface NewsData {
  id: string;
  title: string;
  source: string;
  time: string;
  image: string;
  category: string;
}

interface NewsCardProps {
  news: NewsData;
}

export function NewsCard({ news }: NewsCardProps) {
  return (
    <Card className="group overflow-hidden border-white/5 bg-white/5 hover:bg-white/[8%] transition-all duration-500 cursor-pointer rounded-xl border border-white/10 shadow-xl active:scale-[0.98]">
      <div className="relative h-28 overflow-hidden">
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-2 left-2">
          <span className="text-[9px] font-black text-white bg-blue-600/80 backdrop-blur-md px-2 py-0.5 rounded uppercase tracking-widest border border-white/10">
            {news.category}
          </span>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1.5 opacity-60">
          <TrendingUp className="w-3 h-3 text-blue-400" />
          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <Clock className="w-3 h-3" />
            {news.time}
          </div>
        </div>
        <h3 className="font-bold text-xs text-white line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors uppercase tracking-tight">
          {news.title}
        </h3>
        <p className="text-[10px] text-gray-500 font-bold mt-2 uppercase tracking-widest italic">{news.source}</p>
      </div>
    </Card>
  );
}
