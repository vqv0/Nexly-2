import { useNavigate, useLocation } from 'react-router';
import { useState, useEffect, forwardRef } from 'react';
import { auth } from '../utils/auth';
import { friendsManager } from '../utils/friendsManager';
import { Home, Users, Bell, MessageCircle, LogOut, User, Settings, Search, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { NotificationsPanel } from './NotificationsPanel';
import { MessagesPanel } from './MessagesPanel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { motion, AnimatePresence } from 'motion/react';

// Profile button component with forwardRef
const ProfileButton = forwardRef<
  HTMLButtonElement,
  {
    user: { name: string; avatar?: string } | null;
    onClick?: () => void;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ user, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    {...props}
    className="flex items-center gap-2 hover:bg-white/10 dark:bg-white/10 rounded-xl px-2.5 py-1.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 border border-transparent hover:border-white/10"
  >
    {user?.avatar ? (
      <img
        src={user.avatar}
        alt={user.name}
        className="w-8 h-8 rounded-full object-cover ring-2 ring-white/5 shadow-inner"
      />
    ) : (
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-white/5 shadow-inner">
        <span className="text-white text-sm font-bold">
          {user?.name.charAt(0).toUpperCase()}
        </span>
      </div>
    )}
    <span className="text-sm font-bold text-white hidden md:block">{user?.name}</span>
  </button>
));

ProfileButton.displayName = 'ProfileButton';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(auth.getCurrentUser());
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [showNav, setShowNav] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Close panels on route change
    setNotificationsOpen(false);
    setMessagesOpen(false);

    const updateCount = () => {
      setPendingCount(friendsManager.getPendingCount());
    };
    const updateUser = () => {
      setUser(auth.getCurrentUser());
    };
    updateCount();

    window.addEventListener('nexly-friends-update', updateCount);
    window.addEventListener('nexly-profile-update', updateUser);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('nexly-friends-update', updateCount);
      window.removeEventListener('nexly-profile-update', updateUser);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    auth.logout();
    toast.success('Sesión cerrada con éxito');
    navigate('/');
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`sticky top-0 z-50 transition-all duration-300 px-4 py-2 ${
          scrolled 
            ? 'bg-black/60 backdrop-blur-2xl border-b border-white/10' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-14">
            {/* Logo y Buscador */}
            <div className="flex items-center gap-4 lg:gap-8">
              <div 
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => navigate('/dashboard')}
              >
                <div className="w-10 h-10 overflow-hidden rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform duration-300">
                  <img src="/logo.png" alt="Nexly Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-2xl font-black text-white tracking-tighter group-hover:opacity-80 transition-opacity hidden sm:block">
                  nexly
                </span>
              </div>

              <div className="hidden md:flex items-center relative group">
                <Search className="absolute left-3 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Buscar en Nexly..." 
                  className="bg-white/5 dark:bg-white/5 border border-white/5 rounded-full py-1.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-white/10 transition-all w-64"
                />
              </div>

              <button
                onClick={() => setShowNav(!showNav)}
                className="p-2 ml-2 rounded-xl bg-white/5 dark:bg-white/5 hover:bg-white/10 dark:bg-white/10 text-gray-400 hover:text-white transition-colors flex md:hidden lg:flex"
                title={showNav ? "Ocultar menú" : "Mostrar menú"}
              >
                {showNav ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Navegación Central */}
            <AnimatePresence>
              {showNav && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, width: 0 }}
                  animate={{ opacity: 1, scale: 1, width: 'auto' }}
                  exit={{ opacity: 0, scale: 0.95, width: 0 }}
                  className="flex items-center gap-2 sm:gap-4 flex-1 justify-center max-w-sm overflow-hidden"
                >
                  <NavIcon 
                    icon={<Home className="w-5 h-5" />} 
                    active={window.location.pathname === '/dashboard'}
                    onClick={() => navigate('/dashboard')}
                  />
                  <NavIcon 
                    icon={<Users className="w-5 h-5" />} 
                    active={window.location.pathname === '/friends'}
                    onClick={() => navigate('/friends')}
                    badge={pendingCount > 0 ? pendingCount : undefined}
                  />
                  <NavIcon 
                    icon={<MessageCircle className="w-5 h-5" />} 
                    onClick={() => setMessagesOpen(true)}
                  />
                  <NavIcon 
                    icon={<Bell className="w-5 h-5" />} 
                    onClick={() => setNotificationsOpen(true)}
                    dot
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Perfil y Opciones */}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ProfileButton user={user} />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-72 p-1.5 rounded-2xl border border-white/10 shadow-2xl bg-[#0a0a0a]/95 backdrop-blur-2xl text-white overflow-hidden duration-300 z-[100]"
                >
                  <div className="px-3 py-4 bg-white/5 dark:bg-white/5 rounded-xl mb-1 flex items-center gap-3">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-white/10">
                        <span className="text-white text-xl font-bold">
                          {user?.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold truncate">{user?.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Cuenta Premium</p>
                    </div>
                  </div>

                  <DropdownMenuSeparator className="bg-white/5 dark:bg-white/5 mx-2" />
                  
                  <div className="space-y-0.5 mt-1">
                    <DropdownMenuItem
                      onClick={() => navigate('/profile')}
                      className="rounded-lg cursor-pointer py-3 px-3 hover:bg-white/5 dark:bg-white/5 focus:bg-white/5 dark:bg-white/5 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                          <User className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="font-semibold text-sm">Mi Perfil</span>
                      </div>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem
                      onClick={() => navigate('/settings')}
                      className="rounded-lg cursor-pointer py-3 px-3 hover:bg-white/5 dark:bg-white/5 focus:bg-white/5 dark:bg-white/5 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20">
                          <Settings className="w-4 h-4 text-indigo-400" />
                        </div>
                        <span className="font-semibold text-sm">Configuración</span>
                      </div>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator className="bg-white/5 dark:bg-white/5 mx-2" />
                  
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-lg cursor-pointer py-3 px-3 mt-1 hover:bg-red-500/10 focus:bg-red-500/10 transition-all duration-200 text-red-400"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center border border-red-500/20">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm">Cerrar sesión</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.nav>

      <NotificationsPanel
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
      <MessagesPanel open={messagesOpen} onOpenChange={setMessagesOpen} />
    </>
  );
}

function NavIcon({ icon, active, onClick, badge, dot }: { 
  icon: React.ReactNode, 
  active?: boolean, 
  onClick?: () => void,
  badge?: number,
  dot?: boolean
}) {
  return (
    <button 
      onClick={onClick}
      className={`relative p-2.5 rounded-2xl transition-all duration-300 flex items-center justify-center ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110' 
          : 'bg-white/5 dark:bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 dark:bg-white/10'
      }`}
    >
      {icon}
      {badge !== undefined && (
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-black border-2 border-[#050505]">
          {badge}
        </span>
      )}
      {dot && !badge && (
        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-400 rounded-full ring-2 ring-[#050505]"></span>
      )}
    </button>
  );
}