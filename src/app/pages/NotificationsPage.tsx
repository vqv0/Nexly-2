import { motion } from 'motion/react';
import { Bell, Heart, MessageCircle, UserPlus, Share2 } from 'lucide-react';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'share';
  user: string;
  avatar: string;
  content: string;
  time: string;
  isUnread: boolean;
}

export default function NotificationsPage() {
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'like',
      user: 'María García',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      content: 'le ha gustado tu foto "Atardecer en la montaña"',
      time: 'Hace 2 min',
      isUnread: true,
    },
    {
      id: '2',
      type: 'comment',
      user: 'Carlos Rodríguez',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      content: 'comentó: "¡Increíble toma! 📸"',
      time: 'Hace 15 min',
      isUnread: true,
    },
    {
      id: '3',
      type: 'follow',
      user: 'Ana López',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      content: 'ha comenzado a seguirte',
      time: 'Hace 1 h',
      isUnread: false,
    },
    {
      id: '4',
      type: 'share',
      user: 'Diego Martínez',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      content: 'ha compartido tu publicación',
      time: 'Hace 3 h',
      isUnread: false,
    },
  ];

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-400 fill-blue-400" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-green-400" />;
      case 'share': return <Share2 className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">
            Notificaciones
          </h1>
          <p className="text-white/40 font-medium font-inter">
            Mantente al día con tu actividad
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/5 dark:bg-white/5 flex items-center justify-center glass-effect border border-white/10">
          <Bell className="w-6 h-6 text-blue-400" />
        </div>
      </motion.div>

      <div className="space-y-3">
        {notifications.map((notif, index) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`glass-effect p-4 rounded-[24px] border border-white/[0.03] flex items-center gap-4 group cursor-pointer hover:bg-white/5 dark:bg-white/5 transition-all duration-500 ${notif.isUnread ? 'bg-blue-500/[0.03] ring-1 ring-blue-500/10' : ''}`}
          >
            <div className="relative">
              <img
                src={notif.avatar}
                alt={notif.user}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/5 group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-lg">
                {getIcon(notif.type)}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm text-white/90 leading-snug">
                  <span className="font-black text-white">{notif.user}</span>{' '}
                  <span className="text-white/60 font-medium">{notif.content}</span>
                </p>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 whitespace-nowrap">
                  {notif.time}
                </span>
              </div>
            </div>

            {notif.isUnread && (
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-12 p-8 glass-effect rounded-[32px] border border-white/5 text-center relative overflow-hidden group">
        {/* Removed Sparkles */}
        <h3 className="text-lg font-bold text-white mb-2 italic">¡Estás al día!</h3>
        <p className="text-white/30 text-xs font-medium max-w-[200px] mx-auto leading-relaxed uppercase tracking-widest">
          No tienes más notificaciones por ahora.
        </p>
      </div>
    </div>
  );
}
