import { useState } from 'react';
import { useNavigate } from 'react-router';
import { adminAuth } from '../utils/adminAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '../components/ui/card';
import { Shield, AlertCircle, ArrowRight, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate small delay for cinematic feel
    await new Promise(r => setTimeout(r, 600));

    if (!username || !password) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    if (adminAuth.login(username, password)) {
      toast.success('Acceso concedido. Bienvenido Administrador.');
      navigate('/admin/dashboard');
    } else {
      setError('Credenciales de administrador no válidas');
      toast.error('Acceso denegado');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 relative overflow-hidden font-sans">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-purple-600/10 blur-[130px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            x: [0, -40, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full" 
        />
        {/* Guard Grid Effect */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          {/* Subtle security line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          
          <CardHeader className="space-y-4 pt-12 pb-8 text-center">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <div className="w-20 h-20 overflow-hidden rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-600/30 ring-1 ring-white/20">
                <img src="/logo.png" alt="Nexly Logo" className="w-full h-full object-cover" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-3xl font-black tracking-tighter text-white italic uppercase">
                ADMIN <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">ACCESS</span>
              </h1>
              <CardDescription className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
                Nexly Operations Control Center
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="px-10 pb-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Terminal ID / Username</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ADMIN_ID"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-700 pl-10 h-12 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all rounded-xl font-mono uppercase tracking-widest text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Access Key</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-700 pl-10 h-12 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-red-400 text-[11px] font-bold bg-red-400/10 p-3 rounded-lg border border-red-400/20"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error.toUpperCase()}
                </motion.div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-white text-black hover:bg-gray-200 font-black uppercase tracking-widest rounded-xl shadow-xl transition-all group overflow-hidden relative"
                disabled={loading}
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? 'AUTENTICANDO...' : 'INICIAR SESIÓN'}
                  {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </div>
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-center gap-4">
              <p className="text-[10px] font-bold text-gray-600 tracking-widest uppercase">
                Demo Auth: admin / admin123
              </p>
              <button
                onClick={() => navigate('/')}
                className="text-[10px] font-black text-purple-400 hover:text-purple-300 tracking-widest uppercase transition-colors flex items-center gap-2"
              >
                <ArrowRight className="w-3 h-3 rotate-180" /> VOLVER AL PORTAL
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Footer */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 opacity-30 grayscale pointer-events-none">
        <span className="text-[8px] font-black tracking-[0.5em] text-white">SECURE ACCESS ONLY</span>
        <div className="w-1 h-1 bg-white rounded-full" />
        <span className="text-[8px] font-black tracking-[0.5em] text-white">SYSTEM V2.0.4</span>
      </div>
    </div>
  );
}
