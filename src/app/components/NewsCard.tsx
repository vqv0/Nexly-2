import { Card } from './ui/card';
import { Clock } from 'lucide-react';

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
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <img
        src={news.image}
        alt={news.title}
        className="w-full h-32 object-cover"
      />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {news.category}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {news.time}
          </div>
        </div>
        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{news.title}</h3>
        <p className="text-xs text-gray-500">{news.source}</p>
      </div>
    </Card>
  );
}
