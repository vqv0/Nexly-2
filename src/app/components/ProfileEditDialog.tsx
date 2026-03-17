import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Camera, MapPin, Globe, Loader2, Image as ImageIcon } from 'lucide-react';
import { auth } from '../utils/auth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdate: () => void;
}

export function ProfileEditDialog({ open, onOpenChange, onProfileUpdate }: ProfileEditDialogProps) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load user data on open
  useEffect(() => {
    if (open) {
      const user = auth.getCurrentUser();
      if (user) {
        setName(user.name || '');
        setBio(user.bio || '');
        setLocation(user.location || '');
        setWebsite(user.website || '');
        setAvatarUrl(user.avatar || '');
        setCoverPhotoUrl(user.coverPhoto || '');
      }
    } else {
      setIsSaving(false);
    }
  }, [open]);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate a brief network delay for the animations to shine
    await new Promise(resolve => setTimeout(resolve, 800));

    const result = auth.updateProfile({
      name,
      bio,
      location,
      website,
      avatar: avatarUrl,
      coverPhoto: coverPhotoUrl,
    });

    if (result.success) {
      toast.success('Perfil actualizado con éxito');
      onProfileUpdate();
      onOpenChange(false);
    } else {
      toast.error('Error al actualizar el perfil');
    }
    setIsSaving(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'avatar') {
          setAvatarUrl(reader.result as string);
        } else {
          setCoverPhotoUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 border-white/10 bg-[#0a0a0a]/90 backdrop-blur-3xl overflow-hidden rounded-3xl shadow-[0_0_80px_rgba(59,130,246,0.15)]">
        
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0">
          <motion.div 
            animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -top-32 -left-32 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full" 
          />
          <motion.div 
            animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-32 -right-32 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full" 
          />
        </div>

        <DialogTitle className="sr-only">Editar Perfil</DialogTitle>
        <DialogDescription className="sr-only">Modifica tu información personal de Nexly.</DialogDescription>

        <div className="relative z-10 w-full h-full p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tight flex items-center gap-3">
                Editar Perfil
              </h2>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">PERSONALIZA TU IDENTIDAD DIGITAL</p>
            </div>
            <button 
              onClick={() => onOpenChange(false)}
              className="w-10 h-10 rounded-full bg-white/5 dark:bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 dark:bg-white/10 hover:border-white/20 transition-colors text-white"
            >
              &times;
            </button>
          </div>

          <div className="space-y-8">
            {/* Cover Photo Area */}
            <div className="relative w-full h-32 sm:h-40 rounded-2xl overflow-hidden group/cover ring-1 ring-white/10 shadow-2xl">
              {coverPhotoUrl ? (
                <img src={coverPhotoUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-xl backdrop-blur-md text-white font-bold text-xs uppercase tracking-widest border border-white/10">
                  <Camera className="w-4 h-4" />
                  Cambiar Portada
                </div>
              </div>
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => handleImageUpload(e, 'cover')}
              />
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col items-center justify-center group/avatar -mt-16 sm:-mt-20 relative z-20">
              <div className="relative">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-32 h-32 rounded-full ring-4 ring-black shadow-2xl overflow-hidden relative"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <span className="text-white text-5xl font-black italic">
                        {name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 cursor-pointer">
                     <ImageIcon className="w-6 h-6 text-white" />
                     <span className="text-[10px] text-white font-bold tracking-widest uppercase">Cambiar</span>
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => handleImageUpload(e, 'avatar')}
                  />
                </motion.div>
                <div className="absolute bottom-1 right-1 w-10 h-10 bg-blue-600 rounded-full border-4 border-[#0a0a0a] flex items-center justify-center shadow-lg pointer-events-none">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              {/* Name Input */}
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-gray-500 group-focus-within:text-blue-400 transition-colors ml-1">NOMBRE PÚBLICO</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="¿Cómo te llamas?"
                  className="w-full h-14 bg-white/5 dark:bg-white/5 border border-white/10 rounded-2xl px-5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-bold tracking-wide"
                />
              </div>

              {/* Bio Input */}
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-gray-500 group-focus-within:text-blue-400 transition-colors ml-1">BIOGRAFÍA</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Cuéntale al mundo quién eres..."
                  className="w-full min-h-[120px] bg-white/5 dark:bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium resize-none custom-scrollbar leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Location Input */}
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-[2px] text-gray-500 group-focus-within:text-blue-400 transition-colors ml-1 flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    UBICACIÓN
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ciudad, País"
                    className="w-full h-14 bg-white/5 dark:bg-white/5 border border-white/10 rounded-2xl px-5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-bold text-sm tracking-wide"
                  />
                </div>

                {/* Website Input */}
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-[2px] text-gray-500 group-focus-within:text-blue-400 transition-colors ml-1 flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    SITIO WEB
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full h-14 bg-white/5 dark:bg-white/5 border border-white/10 rounded-2xl px-5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-bold text-sm tracking-wide"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-white/10 flex gap-4">
              <button 
                onClick={() => onOpenChange(false)}
                className="flex-1 h-14 rounded-2xl bg-white/5 dark:bg-white/5 hover:bg-white/10 dark:bg-white/10 text-white font-black uppercase tracking-widest text-xs transition-colors border border-white/5"
              >
                CANCELAR
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-[2] h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                <AnimatePresence mode="wait">
                  {isSaving ? (
                    <motion.div
                      key="saving"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                      GUARDANDO...
                    </motion.div>
                  ) : (
                    <motion.span
                      key="save"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      GUARDAR CAMBIOS
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}