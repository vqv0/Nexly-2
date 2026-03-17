import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { adminAuth } from '../utils/adminAuth';
import { AdminNavbar } from '../components/AdminNavbar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, MessageSquare, FileText, TrendingUp, ArrowRight, ShieldCheck, Activity, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMessages: 0,
    totalReports: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    if (!adminAuth.isAuthenticated()) {
      navigate('/admin');
      return;
    }

    const users = JSON.parse(localStorage.getItem('nexly_users') || '[]');
    const messages = JSON.parse(localStorage.getItem('nexly_messages') || '[]');
    const reports = JSON.parse(localStorage.getItem('nexly_reported_posts') || '[]');
    
    setStats({
      totalUsers: users.length,
      totalMessages: messages.length,
      totalReports: reports.length,
      activeUsers: Math.ceil(users.length * 0.8), // Simulated active
    });
  }, [navigate]);

  const statsCards = [
    {
      title: 'Total Usuarios',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500/20 to-blue-600/20',
      iconColor: 'text-blue-400',
      action: () => navigate('/admin/users'),
    },
    {
      title: 'Mensajes Globales',
      value: stats.totalMessages,
      icon: MessageSquare,
      color: 'from-purple-500/20 to-purple-600/20',
      iconColor: 'text-purple-400',
      action: () => navigate('/admin/messages'),
    },
    {
      title: 'Reportes Activos',
      value: stats.totalReports,
      icon: ShieldAlert,
      color: 'from-red-500/20 to-orange-600/20',
      iconColor: 'text-red-400',
      action: () => navigate('/admin/reports'),
    },
    {
      title: 'Usuarios Activos',
      value: stats.activeUsers,
      icon: TrendingUp,
      color: 'from-orange-500/20 to-orange-600/20',
      iconColor: 'text-orange-400',
      action: () => navigate('/admin/users'),
    },
  ];

  const recentActivity = [
    { user: 'María García', action: 'NUEVA PUBLICACIÓN', time: 'HACE 5 MIN', icon: '📝' },
    { user: 'Carlos Rodríguez', action: 'COMENTARIO AGREGADO', time: 'HACE 15 MIN', icon: '💬' },
    { user: 'Ana López', action: 'MENSAJE ENVIADO', time: 'HACE 30 MIN', icon: '✉️' },
    { user: 'Diego Martínez', action: 'REGISTRO EXITOSO', time: 'HACE 1 HORA', icon: '👤' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
      <AdminNavbar />

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none expensive-bg">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] left-[10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, -30, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full" 
        />
      </div>

      <main className="max-w-7xl mx-auto px-4 py-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg shadow-purple-600/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">CENTRO DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">CONTROL</span></h1>
          </div>
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px] ml-1">
            Nexly Administration & Monitoring Platform
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {statsCards.map((stat) => (
            <motion.div key={stat.title} variants={itemVariants}>
              <Card
                className="bg-white/5 border border-white/10 backdrop-blur-3xl overflow-hidden cursor-pointer hover:border-white/20 hover:-translate-y-1 transition-all duration-300 group relative rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.3)]"
                onClick={stat.action}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <CardContent className="p-8 relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className={`p-3 bg-white/5 rounded-2xl ${stat.iconColor}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-4xl font-black italic tracking-tighter mb-1">{stat.value}</p>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">{stat.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, ease: "easeOut" }}
            className="lg:col-span-2"
          >
            <Card className="bg-white/5 border border-white/10 backdrop-blur-3xl h-full rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.3)] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 mb-4 px-8 pt-8 pb-6 relative z-10">
                <div>
                  <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Actividad del Sistema</CardTitle>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Eventos en tiempo real</p>
                </div>
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                  <Activity className="w-5 h-5 text-purple-400 animate-pulse" />
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-8 pt-2 relative z-10">
                <div className="space-y-6">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-xl shadow-xl">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-black text-xs uppercase tracking-tight">{activity.user}</p>
                          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{activity.time}</span>
                        </div>
                        <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.1em]">
                          {activity.action}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, ease: "easeOut" }}
            className="lg:col-span-1"
          >
            <Card className="bg-white/5 border border-white/10 backdrop-blur-3xl h-full border-t border-t-purple-500/30 rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.3)] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none" />
              <CardHeader className="border-b border-white/5 px-8 pt-8 pb-6 relative z-10">
                <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Acciones Rápidas</CardTitle>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Protocolos de administración</p>
              </CardHeader>
              <CardContent className="px-8 pb-8 pt-6 space-y-4 relative z-10">
                {[
                  { name: 'Gestionar Usuarios', icon: Users, path: '/admin/users' },
                  { name: 'Ver Mensajes', icon: MessageSquare, path: '/admin/messages' },
                  { name: 'Moderación (Reportes)', icon: ShieldAlert, path: '/admin/reports' },
                ].map((action) => (
                  <Button
                    key={action.name}
                    variant="outline"
                    className="w-full h-14 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white justify-start gap-4 px-6 rounded-2xl transition-all group"
                    onClick={() => navigate(action.path)}
                  >
                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <action.icon className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="font-black text-[11px] uppercase tracking-widest leading-none">{action.name}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
