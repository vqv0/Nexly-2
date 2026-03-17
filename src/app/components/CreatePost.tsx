import { useState, useRef } from 'react';
import { auth } from '../utils/auth';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Image, X, Smile } from 'lucide-react';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

interface CreatePostProps {
  onPostCreated: (content: string, image?: string) => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = auth.getCurrentUser();

  const emojis = [
    '😀', '😂', '🤣', '😍', '🥰', '😘', '😎', '🤔', '😮', '😲',
    '😢', '😭', '😡', '🤗', '🤩', '😇', '🥳', '😴', '🤪', '😜',
    '👍', '👏', '🙌', '👌', '💪', '🤝', '🙏', '✌️', '🤞', '👊',
    '❤️', '💕', '💖', '💗', '💙', '💚', '💛', '🧡', '💜', '🖤',
    '🎉', '🎊', '🎈', '🎁', '🎂', '🔥', '✨', '💯', '⭐', '🌟',
    '🌈', '☀️', '🌙', '⚡', '💥', '🌸', '🌺', '🌹', '🌻', '🌷'
  ];

  const handleSubmit = () => {
    if (!content.trim() && !selectedImage) {
      toast.error('Escribe algo o selecciona una imagen para publicar');
      return;
    }
    
    onPostCreated(content, selectedImage || undefined);
    setContent('');
    setSelectedImage(null);
    toast.success('Publicación creada');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setContent(content + emoji);
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1">
          <Textarea
            placeholder="¿Qué estás pensando?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-20 resize-none border-0 focus-visible:ring-0 p-0"
          />
        </div>
      </div>

      {/* Image Preview */}
      {selectedImage && (
        <div className="mt-3 relative">
          <img
            src={selectedImage}
            alt="Preview"
            className="w-full rounded-lg max-h-96 object-cover"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 w-8 h-8 bg-gray-900 bg-opacity-75 hover:bg-opacity-90 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      )}
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="w-4 h-4 text-green-600" />
            <span className="text-sm">Foto</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Smile className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Emoji</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="grid grid-cols-5 gap-2">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Button onClick={handleSubmit} size="sm">
          Publicar
        </Button>
      </div>
    </Card>
  );
}