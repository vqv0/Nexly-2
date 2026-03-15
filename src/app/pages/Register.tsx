import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { auth } from '../utils/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '../components/ui/card';
import { toast } from 'sonner';
import { User, Mail, MapPin, Lock, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    const result = await auth.register(email, password, name, location || undefined);
    
    if (result.success) {
      toast.success('¡Bienvenido a Nexly!');
      navigate('/');
    } else {
      toast.error(result.error || 'Error al crear la cuenta');
    }
    
    setLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 relative overflow-hidden font-sans py-12">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.25, 1],
            rotate: [0, -45, 0],
            x: [0, -30, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[5%] -right-[5%] w-[45%] h-[45%] bg-purple-600/20 blur-[130px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 45, 0],
            x: [0, 40, 0],
            y: [0, -40, 0]
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[5%] -left-[5%] w-[55%] h-[55%] bg-blue-600/20 blur-[140px] rounded-full" 
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg z-10"
      >
        <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          {/* Subtle top light effect */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <CardHeader className="space-y-4 pt-10 pb-4 text-center">
            <motion.div variants={itemVariants} className="flex justify-center mb-2 items-center gap-3">
              <Link to="/" className="absolute left-6 top-10 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="w-16 h-16 overflow-hidden rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 -rotate-3">
                <img src="/logo.png" alt="Nexly Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-3xl font-extrabold tracking-tight text-white mt-1">
                Únete a Nexly
              </span>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="text-gray-400 text-base">
                Crea tu cuenta de manera segura y rápida
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div variants={itemVariants} className="space-y-2 sm:col-span-2">
                <Label htmlFor="name" className="text-gray-300 ml-1">Nombre completo</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  <Input
                    id="name"
                    placeholder="Juan Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 pl-10 h-12 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all rounded-xl"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2 sm:col-span-2">
                <Label htmlFor="email" className="text-gray-300 ml-1">Correo electrónico</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 pl-10 h-12 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all rounded-xl"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2 sm:col-span-2">
                <Label htmlFor="location" className="text-gray-300 ml-1">Ubicación (opcional)</Label>
                <div className="relative group">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  <Input
                    id="location"
                    placeholder="Madrid, España"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 pl-10 h-12 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all rounded-xl"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 ml-1">Contraseña</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 pl-10 h-12 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all rounded-xl"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300 ml-1">Confirmar</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 pl-10 h-12 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all rounded-xl"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="sm:col-span-2 pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 group transition-all"
                  disabled={loading}
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                    {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  </span>
                </Button>
              </motion.div>
            </form>
            
            <motion.div variants={itemVariants} className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/" className="text-purple-400 font-bold hover:text-purple-300 transition-colors">
                  Inicia sesión
                </Link>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer Text */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-600 text-xs tracking-widest uppercase font-medium"
      >
        Nexly &copy; 2026 • Todos los derechos reservados
      </motion.p>
    </div>
  );
}