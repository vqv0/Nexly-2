import { motion } from 'motion/react';
import { Home, Compass, Bell, User, MessageSquare, Settings, LogOut, Search, ChevronUp } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { auth } from '../utils/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

const navItems = [
  { icon: Home, label: 'Inicio', path: '/dashboard' },
  { icon: Compass, label: 'Explorar', path: '/friends' },
  { icon: MessageSquare, label: 'Mensajes', path: '/messages' },
  { icon: Bell, label: 'Notificaciones', path: '/notifications' },
  { icon: Settings, label: 'Ajustes', path: '/settings' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.getCurrentUser();

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 h-screen w-[280px] glass-effect border-r border-white/5 flex flex-col p-6 z-50 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-12 px-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <img src="/logo.png" alt="Nexly Logo" className="w-10 h-10 object-contain drop-shadow-lg" />
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 tracking-tight">
          Nexly
        </h1>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
        <input 
          type="text" 
          placeholder="Buscar..."
          className="w-full bg-white/5 dark:bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all focus:ring-4 focus:ring-blue-500/10 placeholder:text-white/20"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.label}
              whileHover={{ x: 6, scale: 1.01 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-500 group relative overflow-hidden ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-white border border-blue-500/30 shadow-[0_4px_24px_-8px_rgba(59,130,246,0.3)]' 
                  : 'text-white/50 hover:text-white hover:bg-white/10 dark:bg-white/10 hover:border-white/10 border border-transparent'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeNavBackground"
                  className="absolute inset-0 bg-blue-500/10 blur-xl w-full h-full -z-10"
                />
              )}
              <item.icon className={`w-6 h-6 z-10 ${isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'group-hover:text-white transition-colors'}`} />
              <span className={`font-black tracking-wide text-sm z-10 ${isActive ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80 drop-shadow-md' : ''}`}>{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="activeNavIndicator"
                  className="ml-auto w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.9)] z-10"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* User Dropdown */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 px-2 cursor-pointer hover:bg-white/5 dark:bg-white/5 p-2 rounded-2xl smooth-transition group/user">
              <img 
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                alt="Avatar" 
                className="w-10 h-10 rounded-xl object-cover border border-white/10 group-hover/user:scale-105 transition-transform"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-bold text-white text-sm truncate group-hover/user:text-blue-400 transition-colors">{user?.name}</span>
                <span className="text-xs text-white/30 truncate">@{user?.id?.split('@')[0]}</span>
              </div>
              <ChevronUp className="w-4 h-4 text-white/30 group-hover/user:text-white/70 transition-colors" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            sideOffset={10} 
            className="w-[240px] bg-[#0a0a0a]/95 backdrop-blur-3xl border-white/10 text-white rounded-2xl shadow-2xl p-2"
          >
            <DropdownMenuItem 
              onClick={() => navigate('/profile')}
              className="px-3 py-3 gap-3 cursor-pointer rounded-xl hover:bg-white/5 dark:bg-white/5 transition-colors group/item focus:bg-white/5 dark:bg-white/5"
            >
              <User className="w-4 h-4 text-gray-400 group-hover/item:text-white" />
              <span className="font-bold text-sm">Ver Perfil</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-white/5 dark:bg-white/5 my-2" />
            
            <DropdownMenuItem 
              onClick={() => {
                auth.logout();
                navigate('/');
              }}
              className="px-3 py-3 gap-3 cursor-pointer rounded-xl text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-colors group/item focus:bg-red-500/10 focus:text-red-400"
            >
              <LogOut className="w-4 h-4 group-hover/item:scale-110 transition-transform" />
              <span className="font-bold text-sm">Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.aside>
  );
}

