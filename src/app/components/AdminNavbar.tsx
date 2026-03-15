import { useNavigate, useLocation } from 'react-router';
import { adminAuth } from '../utils/adminAuth';
import { Button } from './ui/button';
import { Shield, Users, MessageSquare, LayoutDashboard, LogOut, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = adminAuth.getCurrentAdmin();

  const handleLogout = () => {
    adminAuth.logout();
    toast.success('Sesión finalizada');
    navigate('/admin');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Usuarios', path: '/admin/users', icon: Users },
    { name: 'Mensajes', path: '/admin/messages', icon: MessageSquare },
    { name: 'Reportes', path: '/admin/reports', icon: ShieldAlert },
  ];

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl h-16 flex items-center justify-between px-6 shadow-2xl shadow-black/50 overflow-hidden relative"
      >
        {/* Decorative background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
        
        <div className="flex items-center gap-4 z-10">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="w-10 h-10 overflow-hidden rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20 cursor-pointer"
            onClick={() => navigate('/admin/dashboard')}
          >
            <img src="/logo.png" alt="Nexly Logo" className="w-full h-full object-cover" />
          </motion.div>
          <div className="hidden sm:block">
            <h1 className="text-white font-black text-sm uppercase italic tracking-tighter">NEXLY <span className="text-purple-400">ADMIN</span></h1>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">SYSTEM_V2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 z-10">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant="ghost"
                className={`flex items-center gap-2 h-10 px-4 rounded-xl transition-all font-bold text-xs uppercase tracking-tight
                  ${isActive 
                    ? 'bg-white/10 text-white shadow-inner shadow-white/5' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : ''}`} />
                <span className="hidden md:inline">{item.name}</span>
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 z-10 border-l border-white/5 pl-4 ml-2">
          <div className="hidden lg:block text-right">
            <p className="text-xs font-black text-white uppercase tracking-tight">{admin?.username}</p>
            <p className="text-[9px] text-purple-400 font-bold uppercase tracking-widest">Root Access</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all shadow-lg"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </nav>
  );
}
