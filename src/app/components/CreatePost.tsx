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
    <div className="glass-effect rounded-[32px] overflow-hidden shadow-2xl p-6 mb-8 border-white/[0.03]">
      <div className="flex gap-5">
        <div className="flex-shrink-0">
          <motion.div whileHover={{ scale: 1.05 }} className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-14 h-14 rounded-2xl object-cover ring-4 ring-white/5 shadow-xl"
              />
            ) : (
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center ring-4 ring-white/5 text-white font-black text-2xl shadow-xl">
                {user?.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#050505] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
          </motion.div>
        </div>
        
        <div className="flex-1 space-y-4">
          <Textarea
            placeholder={`¿Qué hay de nuevo, ${user?.name.split(' ')[0]}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="min-h-[60px] resize-none border-0 focus-visible:ring-0 p-0 text-white text-xl font-medium placeholder:text-white/20 bg-transparent scrollbar-hide py-2"
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
                  className="w-full rounded-2xl max-h-96 object-cover border border-white/10 shadow-2xl"
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
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/[0.05]">
          <div className="flex gap-2 sm:gap-4">
            <ActionButton 
              icon={<Image className="w-5 h-5 text-green-400" />} 
              label="Foto" 
              onClick={() => fileInputRef.current?.click()} 
            />
            <ActionButton 
              icon={<Film className="w-5 h-5 text-indigo-400" />} 
              label="Video" 
            />
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 dark:bg-white/5 transition-colors group">
                  <Smile className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-black text-white/40 group-hover:text-white/80 hidden sm:block uppercase tracking-widest">Emoji</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2 bg-[#0a0a0a]/95 backdrop-blur-3xl border-white/10 text-white rounded-[24px] shadow-2xl">
                <div className="grid grid-cols-5 gap-1">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-2xl hover:bg-white/10 dark:bg-white/10 rounded-lg p-2 transition-all duration-200 hover:scale-125"
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
            className="bg-blue-600 hover:bg-blue-500 text-white font-black h-11 px-8 rounded-2xl shadow-lg shadow-blue-600/20 disabled:opacity-30 transition-all active:scale-95 gap-2 uppercase tracking-widest text-xs"
          >
            Publicar
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl hover:bg-white/5 dark:bg-white/5 transition-all duration-300 group"
    >
      <span className="group-hover:scale-110 group-hover:rotate-6 transition-transform">{icon}</span>
      <span className="text-[10px] font-black text-white/40 group-hover:text-white/80 hidden sm:block uppercase tracking-widest">{label}</span>
    </button>
  );
}