import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { adminAuth } from '../utils/adminAuth';
import { AdminNavbar } from '../components/AdminNavbar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, MessageSquare, FileText, TrendingUp, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMessages: 0,
    totalComments: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    if (!adminAuth.isAuthenticated()) {
      navigate('/admin');
      return;
    }

    // Cargar estadísticas desde localStorage
    const users = JSON.parse(localStorage.getItem('nexly_users') || '[]');
    const messages = JSON.parse(localStorage.getItem('nexly_messages') || '[]');
    
    setStats({
      totalUsers: users.length,
      totalMessages: messages.length,
      totalComments: 0, // Se puede calcular de las publicaciones
      activeUsers: users.length,
    });
  }, [navigate]);

  const statsCards = [
    {
      title: 'Total Usuarios',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      action: () => navigate('/admin/users'),
    },
    {
      title: 'Mensajes',
      value: stats.totalMessages,
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600',
      action: () => navigate('/admin/messages'),
    },
    {
      title: 'Comentarios',
      value: stats.totalComments,
      icon: FileText,
      color: 'from-green-500 to-green-600',
      action: () => navigate('/admin/users'),
    },
    {
      title: 'Usuarios Activos',
      value: stats.activeUsers,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      action: () => navigate('/admin/users'),
    },
  ];

  const recentActivity = [
    { user: 'María García', action: 'Creó una nueva publicación', time: 'Hace 5 min' },
    { user: 'Carlos Rodríguez', action: 'Agregó un comentario', time: 'Hace 15 min' },
    { user: 'Ana López', action: 'Envió un mensaje', time: 'Hace 30 min' },
    { user: 'Diego Martínez', action: 'Se registró en la plataforma', time: 'Hace 1 hora' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Bienvenido al panel de administración de Nexly
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat) => (
            <Card
              key={stat.title}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={stat.action}
            >
              <CardContent className="p-0">
                <div className={`bg-gradient-to-r ${stat.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className="w-8 h-8" />
                    <ArrowRight className="w-5 h-5 opacity-70" />
                  </div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm opacity-90 mt-1">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {activity.user.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{activity.user}</span>{' '}
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => navigate('/admin/users')}
                >
                  <Users className="w-5 h-5" />
                  Gestionar Usuarios
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => navigate('/admin/messages')}
                >
                  <MessageSquare className="w-5 h-5" />
                  Ver Mensajes
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => navigate('/admin/users')}
                >
                  <FileText className="w-5 h-5" />
                  Revisar Comentarios
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
