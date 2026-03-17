import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { Avatar } from './ui/avatar';
import { Heart, MessageCircle, UserPlus, Share2 } from 'lucide-react';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'friend' | 'share';
  user: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsPanel({ open, onOpenChange }: NotificationsPanelProps) {
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'like',
      user: 'María García',
      message: 'le gustó tu publicación',
      time: 'Hace 5 min',
      read: false,
    },
    {
      id: '2',
      type: 'comment',
      user: 'Carlos Rodríguez',
      message: 'comentó tu foto',
      time: 'Hace 15 min',
      read: false,
    },
    {
      id: '3',
      type: 'friend',
      user: 'Ana López',
      message: 'aceptó tu solicitud de amistad',
      time: 'Hace 1 hora',
      read: true,
    },
    {
      id: '4',
      type: 'share',
      user: 'Diego Martínez',
      message: 'compartió tu publicación',
      time: 'Hace 2 horas',
      read: true,
    },
    {
      id: '5',
      type: 'like',
      user: 'Laura Pérez',
      message: 'le gustó tu comentario',
      time: 'Hace 3 horas',
      read: true,
    },
  ];

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" fill="currentColor" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'friend':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'share':
        return <Share2 className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Notificaciones</SheetTitle>
          <SheetDescription>Ver todas las notificaciones</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)] mt-4">
          <div className="space-y-1">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">
                      {notification.user.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold">{notification.user}</span>{' '}
                          {notification.message}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">{notification.time}</p>
                      </div>
                      <div className="mt-1">{getIcon(notification.type)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}