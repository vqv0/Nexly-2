import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { adminAuth } from '../utils/adminAuth';
import { AdminNavbar } from '../components/AdminNavbar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Trash2,
  Eye,
  Search,
  Mail,
  MapPin,
  ShieldCheck,
  UserCircle2,
  MessageSquare,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import { motion, AnimatePresence } from 'motion/react';

interface User {
  email: string;
  password: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  createdAt?: string;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showTable, setShowTable] = useState(true);

  useEffect(() => {
    if (!adminAuth.isAuthenticated()) {
      navigate('/admin');
      return;
    }
    loadUsers();
  }, [navigate]);

  const loadUsers = () => {
    const usersData = JSON.parse(localStorage.getItem('nexly_users') || '[]');
    setUsers(usersData);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    const updatedUsers = users.filter((u) => u.email !== userToDelete.email);
    localStorage.setItem('nexly_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setDeleteDialogOpen(false);
    setUserToDelete(null);
    toast.success(`Registro de ${userToDelete.name} eliminado del sistema`);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.location?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  return (
    <div className="min-h-screen bg-[#050505] dark:text-white">
      <AdminNavbar />

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none expensive-bg">
        <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[20%] right-[30%] w-[35%] h-[35%] bg-indigo-600/5 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
              <UserCircle2 className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">GESTIÓN DE <span className="text-blue-400">USUARIOS</span></h1>
          </div>
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px] ml-1">
            Administración de cuentas y perfiles autorizados
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8 bg-white/5 dark:bg-white/5 border-white/5 backdrop-blur-3xl overflow-hidden group">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  placeholder="BUSCAR POR NOMBRE, EMAIL O UBICACIÓN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 bg-white/5 dark:bg-white/5 border-white/10 text-white placeholder:text-gray-700 h-14 rounded-2xl focus:ring-blue-500/20 focus:border-blue-500/40 transition-all font-bold uppercase tracking-wider text-xs"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/5 dark:bg-white/5 border-white/5 backdrop-blur-3xl overflow-hidden">
            <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="text-sm font-black italic uppercase tracking-widest text-gray-400">Base de Datos de Usuarios</CardTitle>
                <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                  {users.length} Registros Activos
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTable(!showTable)}
                className="bg-white/5 dark:bg-white/5 hover:bg-white/10 dark:bg-white/10 text-gray-400 hover:text-white rounded-xl font-bold uppercase tracking-widest text-[10px] h-8 px-4"
              >
                {showTable ? 'Ocultar Tabla' : 'Mostrar Tabla'}
                {showTable ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </Button>
            </CardHeader>
            <AnimatePresence>
              {showTable && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                      <th className="py-5 px-6 italic">Identidad</th>
                      <th className="py-5 px-6 italic">Contacto</th>
                      <th className="py-5 px-6 italic">Ubicación</th>
                      <th className="py-5 px-6 text-right italic">Operaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence mode="popLayout">
                      {filteredUsers.map((user, index) => (
                        <motion.tr 
                          key={user.email}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="group hover:bg-white/5 dark:bg-white/5 transition-all outline-none"
                        >
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                {user.avatar ? (
                                  <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-11 h-11 rounded-xl object-cover ring-2 ring-white/5 group-hover:ring-blue-500/50 transition-all"
                                  />
                                ) : (
                                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-white/10 rounded-xl flex items-center justify-center font-black text-blue-400">
                                    {user.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#050505]" />
                              </div>
                              <div>
                                <p className="font-black text-sm uppercase tracking-tight group-hover:text-blue-400 transition-colors">{user.name}</p>
                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">ID: {user.email.split('@')[0].toUpperCase()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                              <Mail className="w-3.5 h-3.5 text-gray-700" />
                              {user.email}
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-tight">
                              <MapPin className="w-3.5 h-3.5 text-gray-700" />
                              {user.location || 'Localización no definida'}
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                                className="bg-white/5 dark:bg-white/5 border-white/10 text-white hover:bg-white/10 dark:bg-white/10 h-8 px-4 rounded-lg font-black text-[10px] uppercase tracking-widest"
                              >
                                <Eye className="w-3.5 h-3.5 mr-2" />
                                Ver
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/admin/messages?user=${user.email}`)}
                                className="bg-purple-500/5 border-purple-500/20 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/40 h-8 px-4 rounded-lg font-black text-[10px] uppercase tracking-widest"
                              >
                                <MessageSquare className="w-3.5 h-3.5 mr-2" />
                                Mensajes
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(user)}
                                className="bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 h-8 px-4 rounded-lg font-black text-[10px] uppercase tracking-widest"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                Borrar
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-20 text-gray-600 font-black uppercase tracking-[0.2em] text-xs">
                    No se encontraron coincidencias en la base de datos
                  </div>
                )}
              </div>
            </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl bg-[#0a0a0a]/95 backdrop-blur-3xl border-white/10 text-white rounded-[2rem] shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <DialogHeader className="pt-6 px-4">
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">PERFIL DEL <span className="text-blue-400">USUARIO</span></DialogTitle>
            <DialogDescription className="text-gray-500 font-bold uppercase tracking-widest text-[9px]">Expediente completo del terminal asociado</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-8 p-4">
              <div className="flex items-center gap-6 p-6 bg-white/5 dark:bg-white/5 rounded-[2rem] ring-1 ring-white/10 shadow-inner">
                <div className="relative">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="w-24 h-24 rounded-3xl object-cover ring-4 ring-blue-500/20"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-3xl flex items-center justify-center font-black text-3xl shadow-2xl">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <ShieldCheck className="absolute -top-2 -right-2 w-8 h-8 text-blue-400 drop-shadow-lg" />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tight">{selectedUser.name}</h3>
                  <div className="flex items-center gap-2 mt-1 px-3 py-1 bg-blue-500/10 rounded-full inline-flex">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{selectedUser.email}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Biografía / Descripción', value: selectedUser.bio, icon: '📜' },
                  { label: 'Ubicación Geográfica', value: selectedUser.location, icon: '📍' },
                  { label: 'Sitio de Enlace', value: selectedUser.website, icon: '🌐' },
                  { label: 'Fecha de Creación', value: selectedUser.createdAt, icon: '🗓️' },
                ].map((info) => (
                  <div key={info.label} className="p-4 bg-white/5 dark:bg-white/5 border border-white/5 rounded-2xl group hover:border-white/10 transition-colors">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{info.label}</p>
                    <p className="text-xs font-bold group-hover:text-blue-400 transition-colors">
                      {info.value || 'SIN DATOS'}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 gap-4 pt-4 border-t border-white/5">
                <Button 
                  onClick={() => {
                    navigate(`/admin/messages?user=${selectedUser.email}`);
                    setSelectedUser(null);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black uppercase tracking-widest h-12 rounded-xl hover:opacity-90 transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  VER MENSAJES PRIVADOS
                </Button>
                <Button 
                  onClick={() => setSelectedUser(null)}
                  variant="outline"
                  className="w-full bg-white/5 dark:bg-white/5 border-white/10 text-white font-black uppercase tracking-widest h-12 rounded-xl hover:bg-white/10 dark:bg-white/10 transition-all shadow-xl"
                >
                  CERRAR EXPEDIENTE
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#0a0a0a]/95 backdrop-blur-3xl border-red-500/20 text-white rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic uppercase tracking-tight text-red-500">¿CONFIRMAR PURGA?</DialogTitle>
            <DialogDescription className="text-gray-500 font-bold uppercase tracking-widest text-[9px] leading-relaxed pt-2">
              Estás a punto de eliminar permanentemente el registro de <span className="text-white">"{userToDelete?.name}"</span>. 
              Esta operación es irreversible y borrará todos los datos asociados en la terminal local.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="bg-white/5 dark:bg-white/5 border-white/10 font-black text-[10px] uppercase tracking-widest h-12 rounded-xl px-8"
            >
              Abortar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-500 font-black text-[10px] uppercase tracking-widest h-12 rounded-xl px-8 shadow-lg shadow-red-600/20"
            >
              Confirmar Eliminación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}