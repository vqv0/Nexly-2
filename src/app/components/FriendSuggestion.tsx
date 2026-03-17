import { useState } from 'react';
import { Button } from './ui/button';
import { UserPlus, Check, X, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import { friendsManager } from '../utils/friendsManager';
import { motion, AnimatePresence } from 'motion/react';

export interface FriendData {
  id: string;
  name: string;
  mutualFriends?: number;
  avatar?: string;
}

interface FriendSuggestionProps {
  friend: FriendData;
  onFriendAction?: () => void;
}

export function FriendSuggestion({ friend, onFriendAction }: FriendSuggestionProps) {
  const relationship = friendsManager.getRelationshipStatus(friend.id);
  const [status, setStatus] = useState<'none' | 'pending' | 'added'>(
    relationship === 'friends' ? 'added' : relationship === 'pending_sent' ? 'pending' : 'none'
  );

  const handleAddFriend = () => {
    const result = friendsManager.sendRequest(friend.id);
    if (result.success) {
      setStatus('pending');
      toast.success(`Solicitud enviada a ${friend.name.split(' ')[0]}`);
      onFriendAction?.();
    } else {
      toast.error(result.error || 'Error al enviar solicitud');
    }
  };

  const handleCancelRequest = () => {
    friendsManager.cancelRequest(friend.id);
    setStatus('none');
    toast.info('Solicitud cancelada');
    onFriendAction?.();
  };

  return (
    <div className="flex items-center justify-between p-2.5 hover:bg-white/5 dark:bg-white/5 rounded-xl transition-all duration-300 group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative">
          {friend.avatar ? (
            <img
              src={friend.avatar}
              alt={friend.name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-white/5 group-hover:ring-blue-500/20 transition-all shadow-lg"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white/5 shadow-lg">
              <span className="text-white font-bold text-sm">
                {friend.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0a0a0a] rounded-full shadow-sm" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm text-white truncate group-hover:text-blue-400 transition-colors uppercase tracking-tight">{friend.name}</p>
          {friend.mutualFriends !== undefined && friend.mutualFriends > 0 ? (
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              {friend.mutualFriends} mutuos
            </p>
          ) : (
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
              Nexly User
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <AnimatePresence mode="wait">
          {status === 'pending' ? (
            <motion.div 
              key="pending"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1"
            >
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 rounded-lg border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest pointer-events-none"
              >
                Espera
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelRequest}
                className="w-8 h-8 p-0 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : status === 'added' ? (
            <motion.div
              key="added"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center border border-white/5 bg-white/5 dark:bg-white/5 px-3 py-1.5 rounded-lg gap-2"
            >
              <Check className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Amigo</span>
            </motion.div>
          ) : (
            <motion.div
              key="none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Button
                size="sm"
                onClick={handleAddFriend}
                className="h-8 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5 mr-2" />
                Añadir
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}