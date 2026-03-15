import { useState, useRef } from 'react';
import { auth } from '../utils/auth';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Image, X, Smile, Send, Film, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { motion, AnimatePresence } from 'motion/react';

interface CreatePostProps {
  onPostCreated: (content: string, image?: string) => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = auth.getCurrentUser();

  const emojis = [
    '😀', '😂', '😍', '🥰', '🤔', '😎', '😢', '🔥', '✨', '💯',
    '👍', '❤️', '🙌', '🎉', '🌟', '🚀', '🌈', '🌸', '🍕', '💻'
  ];

  const handleSubmit = () => {
    if (!content.trim() && !selectedImage) {
      toast.error('¿En qué estás pensando? Cuéntanos algo.');
      return;
    }
    
    onPostCreated(content, selectedImage || undefined);
    setContent('');
    setSelectedImage(null);
    setIsFocused(false);
    toast.success('¡Publicado con éxito!');
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
    <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl transition-all duration-300">
      <div className="p-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0 pt-1">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white/5"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-white/5 text-white font-bold text-xl shadow-lg">
                {user?.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder={`¿Qué tienes en mente, ${user?.name.split(' ')[0]}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              className="min-h-[60px] resize-none border-0 focus-visible:ring-0 p-0 text-white text-lg placeholder:text-gray-500 bg-transparent scrollbar-hide"
            />
            
            <AnimatePresence>
              {selectedImage && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="relative group"
                >
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="w-full rounded-xl max-h-96 object-cover border border-white/10 shadow-2xl"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-3 right-3 w-9 h-9 bg-black/60 backdrop-blur-md hover:bg-black/80 rounded-full flex items-center justify-center transition-all duration-200 text-white group-hover:scale-105"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.div 
          initial={false}
          animate={{ height: isFocused || content || selectedImage ? 'auto' : 0, opacity: isFocused || content || selectedImage ? 1 : 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <div className="flex gap-1 sm:gap-4">
              <ActionButton 
                icon={<Image className="w-5 h-5 text-green-400" />} 
                label="Foto" 
                onClick={() => fileInputRef.current?.click()} 
              />
              <ActionButton 
                icon={<Film className="w-5 h-5 text-indigo-400" />} 
                label="Reel" 
              />
              
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group">
                    <Smile className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-gray-400 hidden sm:block">Emoji</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2 bg-[#0a0a0a]/95 backdrop-blur-3xl border-white/10 text-white rounded-2xl shadow-2xl">
                  <div className="grid grid-cols-5 gap-1">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmojiClick(emoji)}
                        className="text-2xl hover:bg-white/10 rounded-lg p-2 transition-all duration-200 hover:scale-125"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={!content.trim() && !selectedImage}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-6 rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-30 transition-all active:scale-95 gap-2"
            >
              <span className="hidden sm:inline">Publicar</span>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {!isFocused && !content && !selectedImage && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
            <div className="flex gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                title="Subir foto"
              >
                <Image className="w-5 h-5 text-green-400/80" />
              </button>
              <button className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors" title="Subir video">
                <Film className="w-5 h-5 text-indigo-400/80" />
              </button>
            </div>
            <button className="text-gray-600 hover:text-gray-400 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />
      </div>
    </Card>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all duration-200 group"
    >
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-xs font-bold text-gray-400 hidden sm:block">{label}</span>
    </button>
  );
}