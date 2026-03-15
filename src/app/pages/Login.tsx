import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { auth } from '../utils/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '../components/ui/card';
import { toast } from 'sonner';
import { Shield, ArrowRight, Mail, Lock, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type AuthStep = 'login' | 'forgot_request' | 'forgot_verify' | 'forgot_reset';

export default function Login() {
  const [step, setStep] = useState<AuthStep>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = auth.login(email, password);
    if (result.success) {
      toast.success('¡Bienvenido de nuevo!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Credenciales incorrectas');
    }
    setLoading(false);
  };

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Ingresa tu correo');
      return;
    }
    setLoading(true);
    const result = auth.requestPasswordReset(email);
    if (result.success) {
      toast.success('Código enviado a tu correo (mira la consola)');
      setStep('forgot_verify');
    } else {
      toast.error(result.error || 'Ocurrió un error');
    }
    setLoading(false);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetCode.length !== 6) {
      toast.error('El código debe tener 6 dígitos');
      return;
    }
    setLoading(true);
    const result = auth.verifyResetCode(email, resetCode);
    if (result.success) {
      toast.success('Código verificado');
      setStep('forgot_reset');
    } else {
      toast.error(result.error || 'Código inválido o expirado');
    }
    setLoading(false);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    const result = auth.resetPassword(email, resetCode, newPassword);
    if (result.success) {
      toast.success('Contraseña restablecida correctamente');
      setStep('login');
      setPassword('');
    } else {
      toast.error(result.error || 'Ocurrió un error');
    }
    setLoading(false);
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 'login':
        return (
          <form onSubmit={handleLogin} className="space-y-6">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <Label htmlFor="email" className="text-gray-300 ml-1">Correo electrónico</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 pl-10 h-12 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all rounded-xl"
                />
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-300 ml-1">Contraseña</Label>
                <button 
                  type="button"
                  onClick={() => setStep('forgot_request')}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 pl-10 h-12 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all rounded-xl"
                />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 group transition-all"
                disabled={loading}
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                  {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </span>
              </Button>
            </motion.div>
          </form>
        );

      case 'forgot_request':
        return (
          <form onSubmit={handleRequestReset} className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 text-center mb-4">
              <h2 className="text-white font-bold text-xl uppercase tracking-tighter italic">RECUPERAR CUENTA</h2>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">INGRESA TU CORREO PARA RECIBIR UN CÓDIGO</p>
            </motion.div>
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-gray-300 ml-1">Correo electrónico</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 pl-10 h-12 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all rounded-xl"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar código'}
            </Button>
            <button
              type="button"
              onClick={() => setStep('login')}
              className="w-full text-xs text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-3 h-3" /> VOLVER AL INICIO
            </button>
          </form>
        );

      case 'forgot_verify':
        return (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 text-center mb-4">
              <h2 className="text-white font-bold text-xl uppercase tracking-tighter italic">VERIFICAR CÓDIGO</h2>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed px-4">
                HEMOS ENVIADO UN CÓDIGO DE 6 DÍGITOS A <span className="text-blue-400">{email}</span>
              </p>
            </motion.div>
            <div className="space-y-2">
              <Label htmlFor="code" className="text-gray-300 ml-1">Código de verificación</Label>
              <div className="relative group">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 pl-10 h-12 focus:ring-blue-500/50 focus:border-blue-500/50 text-center tracking-[10px] text-lg font-black rounded-xl"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
              disabled={loading}
            >
              {loading ? 'Verificando...' : 'Verificar código'}
            </Button>
            <button
              type="button"
              onClick={() => setStep('forgot_request')}
              className="w-full text-xs text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-3 h-3" /> CAMBIAR CORREO
            </button>
          </form>
        );

      case 'forgot_reset':
        return (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 text-center mb-4">
              <h2 className="text-white font-bold text-xl uppercase tracking-tighter italic">NUEVA CONTRASEÑA</h2>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">ELIGE UNA LLAVE DE ACCESO SEGURA</p>
            </motion.div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-gray-300 ml-1">Nueva Contraseña</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 pl-10 h-12 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-reset-password" className="text-gray-300 ml-1">Confirmar Contraseña</Label>
                <div className="relative group">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="confirm-reset-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 pl-10 h-12 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all rounded-xl"
                  />
                </div>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
              disabled={loading}
            >
              {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
            </Button>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 relative overflow-hidden font-sans">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0], x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-purple-600/10 blur-[180px] rounded-full" 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <CardHeader className="space-y-4 pt-10 pb-6 text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center mb-2 items-center gap-3"
            >
              <div className="w-16 h-16 overflow-hidden rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3">
                <img src="/logo.png" alt="Nexly Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-4xl font-extrabold tracking-tight text-white">nexly</span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <CardDescription className="text-gray-400 text-lg">
                Conéctate con tu mundo
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent className="px-8 pb-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderCurrentStep()}
              </motion.div>
            </AnimatePresence>
            
            {step === 'login' && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 text-center"
                >
                  <p className="text-gray-400 text-sm">
                    ¿No tienes una cuenta?{' '}
                    <Link to="/register" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
                      Crea una ahora
                    </Link>
                  </p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 pt-6 border-t border-white/10 text-center"
                >
                  <button
                    onClick={() => navigate('/admin')}
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white font-medium transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Acceso Administrador
                  </button>
                </motion.div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-600 text-xs tracking-widest uppercase font-medium"
      >
        Nexly &copy; 2026 • Todos los derechos reservados
      </motion.p>
    </div>
  );
}