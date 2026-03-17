import { useNavigate } from 'react-router';
import { adminAuth } from '../utils/adminAuth';
import { Button } from './ui/button';
import { Shield, Users, MessageSquare, LayoutDashboard, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function AdminNavbar() {
  const navigate = useNavigate();
  const admin = adminAuth.getCurrentAdmin();

  const handleLogout = () => {
    adminAuth.logout();
    toast.success('Sesión cerrada');
    navigate('/admin');
  };

  return (
    <nav className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Nexly Admin</h1>
              <p className="text-xs text-purple-200">Panel de Administración</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 gap-2"
              onClick={() => navigate('/admin/dashboard')}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 gap-2"
              onClick={() => navigate('/admin/users')}
            >
              <Users className="w-4 h-4" />
              Usuarios
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 gap-2"
              onClick={() => navigate('/admin/messages')}
            >
              <MessageSquare className="w-4 h-4" />
              Mensajes
            </Button>

            <div className="h-8 w-px bg-white/30 mx-2" />

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold">{admin?.username}</p>
                <p className="text-xs text-purple-200">{admin?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
