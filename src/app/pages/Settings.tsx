import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { auth } from '../utils/auth';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Mail,
  KeyRound,
  Bell,
  Lock,
  Calendar,
  Info,
  ChevronRight,
  UserCheck,
  AlertCircle,
  Zap,
  LogOut
} from 'lucide-react';

function formatDate(isoOrLocal?: string): string {
  if (!isoOrLocal) return '—';
  try {
    const d = new Date(isoOrLocal);
    if (isNaN(d.getTime())) return isoOrLocal;
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoOrLocal;
  }
}

export default function Settings() {
  const navigate = useNavigate();
  const user = auth.getCurrentUser();
  const [securityInfo, setSecurityInfo] = useState<{ lastLogin?: string; createdAt?: string }>({});
  const [securityOptions, setSecurityOptions] = useState(auth.getSecurityOptions());
  const [performanceMode, setPerformanceMode] = useState(localStorage.getItem('nexly_performance_mode') === 'true');

  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate('/');
      return;
    }
    setSecurityInfo(auth.getSecurityInfo());
    setSecurityOptions(auth.getSecurityOptions());
  }, [navigate]);

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      toast.error('Ingresa el nuevo correo');
      return;
    }
    if (!emailPassword) {
      toast.error('Ingresa tu contraseña para confirmar');
      return;
    }
    setLoadingEmail(true);
    const result = auth.changeEmail(newEmail.trim(), emailPassword);
    if (result.success) {
      toast.success('Correo actualizado correctamente');
      setNewEmail('');
      setEmailPassword('');
    } else {
      toast.error(result.error || 'Error al cambiar el correo');
    }
    setLoadingEmail(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (!currentPassword) {
      toast.error('Ingresa tu contraseña actual');
      return;
    }
    setLoadingPassword(true);
    const result = auth.changePassword(currentPassword, newPassword);
    if (result.success) {
      toast.success('Contraseña actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(result.error || 'Error al cambiar la contraseña');
    }
    setLoadingPassword(false);
  };

  const handleLoginAlerts = (checked: boolean) => {
    auth.setSecurityOptions({ loginAlerts: checked });
    setSecurityOptions(auth.getSecurityOptions());
    toast.success(checked ? 'Alertas de inicio de sesión activadas' : 'Alertas desactivadas');
  };

  const handleTwoFactor = (checked: boolean) => {
    auth.setSecurityOptions({ twoFactorEnabled: checked });
    setSecurityOptions(auth.getSecurityOptions());
    toast.info(
      checked
        ? 'Protección adicional activada (simulada)'
        : 'Protección adicional desactivada'
    );
  };
  
  const handlePerformanceMode = (checked: boolean) => {
    setPerformanceMode(checked);
    localStorage.setItem('nexly_performance_mode', String(checked));
    if (checked) {
      document.body.classList.add('performance-mode');
      toast.success('Modo de rendimiento activado: Nexly ahora es super fluido 🚀');
    } else {
      document.body.classList.remove('performance-mode');
      toast.info('Modo visual premium activado');
    }
  };

  if (!user) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden transition-colors duration-300">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed z-0">

        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, -50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full" 
        />
      </div>
      
      <main className="max-w-3xl mx-auto px-4 py-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20 border border-white/10">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">
                Panel de Seguridad
              </h1>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
                GESTIONA LA PROTECCIÓN DE TU CUENTA NEXLY
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Cambiar correo */}
          <motion.div variants={itemVariants}>
            <Card className="border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden group hover:border-white/20 transition-all duration-500">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black text-white italic uppercase tracking-tight">CONEXIÓN Y CORREO</CardTitle>
                    <CardDescription className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                      ACTUALIZA TU IDENTIDAD DIGITAL DE NEXLY
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <form onSubmit={handleChangeEmail} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[2px] text-gray-500 ml-1">CORREO ACTUAL</Label>
                    <div className="relative">
                      <Input
                        type="email"
                        value={user.email}
                        disabled
                        className="h-12 bg-white/[2%] border-white/5 text-gray-500 rounded-xl font-bold italic"
                      />
                      <UserCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500/30" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="new-email" className="text-[10px] font-black uppercase tracking-[2px] text-gray-500 ml-1">NUEVO CORREO</Label>
                      <Input
                        id="new-email"
                        type="email"
                        placeholder="NUEVO@NEXLY.COM"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="h-12 bg-white/5 dark:bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:ring-blue-500/30 transition-all font-bold uppercase text-xs tracking-tight"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-password" className="text-[10px] font-black uppercase tracking-[2px] text-gray-500 ml-1">CONFIRMAR CONTRASENA</Label>
                      <Input
                        id="email-password"
                        type="password"
                        placeholder="••••••••"
                        value={emailPassword}
                        onChange={(e) => setEmailPassword(e.target.value)}
                        className="h-12 bg-white/5 dark:bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:ring-blue-500/30 transition-all"
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loadingEmail} className="w-full sm:w-auto px-10 h-12 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                    {loadingEmail ? 'GUARDANDO...' : 'ACTUALIZAR CORREO'}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cambiar contraseña */}
          <motion.div variants={itemVariants}>
            <Card className="border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden group hover:border-white/20 transition-all duration-500">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <KeyRound className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black text-white italic uppercase tracking-tight">LLAVE DE ACCESO</CardTitle>
                    <CardDescription className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                      MANTÉN TU CUENTA INVIOLABLE
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-[10px] font-black uppercase tracking-[2px] text-gray-500 ml-1">CONTRASENA ACTUAL</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-12 bg-white/5 dark:bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:ring-amber-500/30 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-[10px] font-black uppercase tracking-[2px] text-gray-500 ml-1">NUEVA CONTRASENA</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="MÍN. 6 CARACTERES"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-12 bg-white/5 dark:bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:ring-amber-500/30 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-[10px] font-black uppercase tracking-[2px] text-gray-500 ml-1">VERIFICAR NUEVA</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 bg-white/5 dark:bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:ring-amber-500/30 transition-all"
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loadingPassword} className="w-full sm:w-auto px-10 h-12 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-amber-600/20 active:scale-95 transition-all">
                    {loadingPassword ? 'GUARDANDO...' : 'CAMBIAR CONTRASENA'}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Opciones de seguridad */}
          <motion.div variants={itemVariants}>
            <Card className="border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden group">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <Lock className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black text-white italic uppercase tracking-tight">ESCUDOS ACTIVOS</CardTitle>
                    <CardDescription className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                      CAPAS DE PROTECCIÓN EN TIEMPO REAL
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[2%] border border-white/5 hover:bg-white/5 dark:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 dark:bg-white/5 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-black text-white text-xs uppercase tracking-tight">ALERTAS DE ACCESO</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">AVISOS POR NUEVOS INICIOS</p>
                    </div>
                  </div>
                  <Switch
                    checked={securityOptions.loginAlerts}
                    onCheckedChange={handleLoginAlerts}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[2%] border border-white/5 hover:bg-white/5 dark:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 dark:bg-white/5 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-black text-white text-xs uppercase tracking-tight">VERIFICACIÓN DOBLE</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">PROTECCIÓN NIVEL NEXLY</p>
                    </div>
                  </div>
                  <Switch
                    checked={securityOptions.twoFactorEnabled}
                    onCheckedChange={handleTwoFactor}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Opciones de rendimiento */}
          <motion.div variants={itemVariants}>
            <Card className="border-blue-500/20 bg-blue-500/5 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden group">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black text-white italic uppercase tracking-tight">POTENCIA Y RENDIMIENTO</CardTitle>
                    <CardDescription className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                      OPTIMIZA TU EXPERIENCIA PARA 60 FPS
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[2%] border border-white/5 hover:bg-white/5 dark:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 dark:bg-white/5 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-black text-white text-xs uppercase tracking-tight">MODO DE RENDIMIENTO</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">ELIMINA BLUR Y OPTIMIZA ANIMACIONES</p>
                    </div>
                  </div>
                  <Switch
                    checked={performanceMode}
                    onCheckedChange={handlePerformanceMode}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Información de seguridad */}
          <motion.div variants={itemVariants}>
            <Card className="border-indigo-500/20 bg-indigo-500/5 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden border">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Info className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black text-white italic uppercase tracking-tight">REGISTRO DE SEGURIDAD</CardTitle>
                    <CardDescription className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                      CRÍTICO: TRAZABILIDAD DE TU CUENTA
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex items-center gap-5 p-5 rounded-2xl bg-black/40 border border-white/5">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">ÚLTIMO ACCESO</p>
                      <p className="text-sm font-black text-white italic uppercase tracking-tight">
                        {formatDate(securityInfo.lastLogin)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 p-5 rounded-2xl bg-black/40 border border-white/5">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">CREACIÓN DE CUENTA</p>
                      <p className="text-sm font-black text-white italic uppercase tracking-tight">
                        {securityInfo.createdAt || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cerrar Sesión */}
          <motion.div variants={itemVariants}>
            <Button 
              onClick={() => {
                auth.logout();
                navigate('/');
              }}
              className="w-full h-14 rounded-2xl bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 shadow-lg font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 group"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              CERRAR SESIÓN
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
