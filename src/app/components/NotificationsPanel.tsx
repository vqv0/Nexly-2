import { useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Heart, MessageCircle, UserPlus, Share2, Check, X, Bell, Sparkles } from 'lucide-react';
import { friendsManager } from '../utils/friendsManager';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'friend' | 'share' | 'friend_request';
  user: string;
  avatar?: string;
  message: string;
  time: string;
  read: boolean;
  requestId?: string;
}

interface NotificationsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsPanel({ open, onOpenChange }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const getRelativeTime = (isoString: string): string => {
    const now = new Date();
    const date = new Date(isoString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  const loadNotifications = useCallback(() => {
    const pendingRequests = friendsManager.getPendingReceived();
    const friendRequestNotifications: Notification[] = pendingRequests.map((req) => ({
      id: `notif_${req.id}`,
      type: 'friend_request' as const,
      user: req.fromUser?.name || req.fromUserId,
      avatar: req.fromUser?.avatar,
      message: 'te envió una solicitud de amistad',
      time: getRelativeTime(req.timestamp),
      read: false,
      requestId: req.id,
    }));

    const staticNotifications: Notification[] = [
      { id: '1', type: 'like', user: 'María García', message: 'le gustó tu publicación', time: '5 min', read: false },
      { id: '2', type: 'comment', user: 'Carlos Rodríguez', message: 'comentó tu foto', time: '15 min', read: false },
      { id: '3', type: 'friend', user: 'Ana López', message: 'aceptó tu solicitud', time: '1 hora', read: true },
      { id: '4', type: 'share', user: 'Diego Martínez', message: 'compartió tu post', time: '2 horas', read: true },
      { id: '5', type: 'like', user: 'Laura Pérez', message: 'le gustó tu comentario', time: '3 horas', read: true },
    ];

    setNotifications([...friendRequestNotifications, ...staticNotifications]);
  }, []);

  useEffect(() => {
    if (open) loadNotifications();
    const handler = () => { if (open) loadNotifications(); };
    window.addEventListener('nexly-friends-update', handler);
    return () => window.removeEventListener('nexly-friends-update', handler);
  }, [open, loadNotifications]);

  const handleAcceptRequest = (requestId: string, userName: string) => {
    const result = friendsManager.acceptRequest(requestId);
    if (result.success) {
      toast.success(`¡Ahora eres amigo de ${userName}!`);
      loadNotifications();
    }
  };

  const handleRejectRequest = (requestId: string) => {
    const result = friendsManager.rejectRequest(requestId);
    if (result.success) {
      toast.info('Solicitud rechazada');
      loadNotifications();
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like': return <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500/20" />;
      case 'comment': return <MessageCircle className="w-3.5 h-3.5 text-blue-400" />;
      case 'friend': 
      case 'friend_request': return <UserPlus className="w-3.5 h-3.5 text-emerald-400" />;
      case 'share': return <Share2 className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[450px] p-0 border-white/10 bg-[#0a0a0a]/95 backdrop-blur-3xl shadow-2xl">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/5 blur-[100px] rounded-full" />
        </div>

        <div className="relative z-10 h-full flex flex-col">
          <SheetHeader className="p-6 border-b border-white/5 space-y-0 text-left">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-indigo-400" />
                </div>
                <SheetTitle className="text-xl font-black text-white italic uppercase tracking-tight">Actividad</SheetTitle>
              </div>
              <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-white/5 hover:text-blue-300">
                Marcar todo
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              <AnimatePresence initial={false}>
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group p-4 rounded-2xl cursor-pointer transition-all duration-300 border border-transparent ${
                      !notification.read ? 'bg-white/[3%] border-white/5 shadow-lg' : 'hover:bg-white/5 hover:border-white/5'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="relative flex-shrink-0">
                        {notification.avatar ? (
                          <img
                            src={notification.avatar}
                            alt={notification.user}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-white/5 group-hover:ring-indigo-500 transition-all"
                          />
                        ) : (
                          <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                            <span className="text-white text-base font-black italic uppercase">
                              {notification.user.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#0a0a0a] rounded-full flex items-center justify-center border border-white/10 shadow-xl">
                          {getIcon(notification.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-[11px] text-gray-300 font-medium leading-relaxed">
                            <span className="font-black text-white uppercase tracking-tight mr-1">{notification.user}</span>
                            {notification.message}
                          </p>
                          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest flex-shrink-0">{notification.time}</span>
                        </div>
                        
                        {notification.type === 'friend_request' && notification.requestId && (
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              className="h-8 bg-blue-600 hover:bg-blue-500 text-white font-black text-[9px] uppercase tracking-widest rounded-lg flex-1 shadow-lg shadow-blue-600/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptRequest(notification.requestId!, notification.user);
                              }}
                            >
                              <Check className="w-3 h-3 mr-1.5" />
                              Aceptar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 bg-white/5 border-white/10 text-white font-black text-[9px] uppercase tracking-widest rounded-lg flex-1 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectRequest(notification.requestId!);
                              }}
                            >
                              <X className="w-3 h-3 mr-1.5" />
                              Ignorar
                            </Button>
                          </div>
                        )}

                        {!notification.read && notification.type !== 'friend_request' && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Nuevo</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}