import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { UserPlus, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export interface FriendData {
  id: string;
  name: string;
  mutualFriends?: number;
  avatar?: string;
}

interface FriendSuggestionProps {
  friend: FriendData;
}

export function FriendSuggestion({ friend }: FriendSuggestionProps) {
  const [status, setStatus] = useState<'none' | 'pending' | 'added'>('none');

  const handleAddFriend = () => {
    setStatus('pending');
    toast.success(`Solicitud de amistad enviada a ${friend.name}`);
  };

  const handleCancelRequest = () => {
    setStatus('none');
    toast.info('Solicitud cancelada');
  };

  const getButtonContent = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            Enviado
          </div>
        );
      case 'added':
        return (
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            Amigos
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Agregar
          </div>
        );
    }
  };

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {friend.avatar ? (
          <img
            src={friend.avatar}
            alt={friend.name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold">
              {friend.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate">{friend.name}</p>
          {friend.mutualFriends && (
            <p className="text-xs text-gray-500">
              {friend.mutualFriends} amigos en común
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {status === 'pending' ? (
          <>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              disabled
            >
              {getButtonContent()}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelRequest}
              className="w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant={status === 'added' ? 'outline' : 'default'}
            onClick={handleAddFriend}
            className="gap-2"
            disabled={status === 'added'}
          >
            {getButtonContent()}
          </Button>
        )}
      </div>
    </div>
  );
}