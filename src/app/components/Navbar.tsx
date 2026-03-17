import { useNavigate } from 'react-router';
import { useState, forwardRef } from 'react';
import { auth } from '../utils/auth';
import { Button } from './ui/button';
import { Home, Users, Bell, MessageCircle, LogOut, Settings, User } from 'lucide-react';
import { toast } from 'sonner';
import { NotificationsPanel } from './NotificationsPanel';
import { MessagesPanel } from './MessagesPanel';
import { ProfileEditDialog } from './ProfileEditDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

// Profile button component with forwardRef
const ProfileButton = forwardRef<
  HTMLButtonElement,
  {
    user: { name: string; avatar?: string } | null;
    onClick?: () => void;
  }
>(({ user, onClick }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
  >
    {user?.avatar ? (
      <img
        src={user.avatar}
        alt={user.name}
        className="w-8 h-8 rounded-full object-cover"
      />
    ) : (
      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-semibold">
          {user?.name.charAt(0).toUpperCase()}
        </span>
      </div>
    )}
    <span className="text-sm font-medium">{user?.name}</span>
  </button>
));

ProfileButton.displayName = 'ProfileButton';

export function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.getCurrentUser());
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);

  const handleLogout = () => {
    auth.logout();
    toast.success('Sesión cerrada');
    navigate('/');
  };

  const handleProfileUpdate = () => {
    setUser(auth.getCurrentUser());
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">N</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                nexly
              </span>
            </div>

            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Home className="w-6 h-6" />
              </button>
              <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                <Users className="w-6 h-6" />
              </button>
              <button
                onClick={() => setMessagesOpen(true)}
                className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
              <button
                onClick={() => setNotificationsOpen(true)}
                className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors relative"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ProfileButton user={user} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-0">
                  {/* Header del menú con info del usuario */}
                  <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-b">
                    <div className="flex items-center gap-3">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          <span className="text-white text-lg font-bold">
                            {user?.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-sm text-gray-600">Ver tu perfil</p>
                      </div>
                    </div>
                  </div>

                  {/* Opciones del menú */}
                  <div className="py-2">
                    <DropdownMenuItem 
                      onClick={() => navigate('/profile')}
                      className="mx-2 rounded-md cursor-pointer hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 py-2">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Ver mi perfil</p>
                          <p className="text-xs text-gray-500">Ve tu información y personaliza tu perfil</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => setProfileEditOpen(true)}
                      className="mx-2 rounded-md cursor-pointer hover:bg-indigo-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 py-2">
                        <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Settings className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Editar perfil</p>
                          <p className="text-xs text-gray-500">Actualiza tu foto y datos personales</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator className="my-1" />
                  
                  {/* Cerrar sesión */}
                  <div className="py-2">
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="mx-2 rounded-md cursor-pointer hover:bg-red-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 py-2">
                        <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center">
                          <LogOut className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Cerrar sesión</p>
                          <p className="text-xs text-gray-500">Sal de tu cuenta de Nexly</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <NotificationsPanel
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
      <MessagesPanel open={messagesOpen} onOpenChange={setMessagesOpen} />
      <ProfileEditDialog
        open={profileEditOpen}
        onOpenChange={setProfileEditOpen}
        onProfileUpdate={handleProfileUpdate}
      />
    </>
  );
}