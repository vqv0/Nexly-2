import { motion } from 'motion/react';
import { Home, Compass, Bell, User, MessageSquare, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { auth } from '../utils/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, path: '/dashboard' },
    { icon: Compass, path: '/friends' },
    { icon: Bell, path: '/notifications' },
    { icon: MessageSquare, path: '/messages' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 glass-effect border-t border-white/5 z-50 flex items-center justify-around px-6 lg:hidden pb-safe">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`p-4 rounded-xl transition-all duration-500 relative flex-1 flex justify-center items-center group ${
              isActive ? 'text-white bg-white/5 dark:bg-white/5 shadow-inner border border-white/5' : 'text-white/40 hover:text-white/70 hover:bg-white/5 dark:bg-white/5'
            }`}
          >
            <item.icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'group-hover:scale-110'}`} />
            {isActive && (
              <motion.div 
                layoutId="activeTabMobile"
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.9)]"
              />
            )}
            {isActive && (
              <div className="absolute inset-0 bg-blue-500/10 blur-xl w-full h-full -z-10 rounded-full" />
            )}
          </button>
        );
      })}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-3 rounded-2xl text-white/50 hover:text-white/80 transition-colors">
            <LogOut className="w-6 h-6" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          sideOffset={20} 
          className="w-[200px] mb-2 bg-[#0a0a0a]/95 backdrop-blur-3xl border-white/10 text-white rounded-2xl shadow-2xl p-2"
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
    </nav>
  );
}
