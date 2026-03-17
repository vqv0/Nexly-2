import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { auth } from '../utils/auth';
import { Navbar } from '../components/Navbar';
import { FriendSuggestion } from '../components/FriendSuggestion';
import { friendsManager, FriendRequest } from '../utils/friendsManager';
import { UserProfile } from '../utils/mockData';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { UserPlus, Users, UserCheck, Check, X, UserMinus, LayoutGrid, Search } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function FriendsPage() {
  const navigate = useNavigate();
  const [pendingReceived, setPendingReceived] = useState<(FriendRequest & { fromUser?: UserProfile })[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [suggestions, setSuggestions] = useState<(UserProfile & { mutualFriends: number })[]>([]);

  const loadData = useCallback(() => {
    setPendingReceived(friendsManager.getPendingReceived());
    setFriends(friendsManager.getFriends());
    setSuggestions(friendsManager.getSuggestions());
  }, []);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate('/');
      return;
    }
    loadData();

    const handler = () => loadData();
    window.addEventListener('nexly-friends-update', handler);
    return () => window.removeEventListener('nexly-friends-update', handler);
  }, [navigate, loadData]);

  const handleAccept = (requestId: string, userName: string) => {
    const result = friendsManager.acceptRequest(requestId);
    if (result.success) {
      toast.success(`¡Ahora eres amigo de ${userName}!`);
      loadData();
    }
  };

  const handleReject = (requestId: string) => {
    const result = friendsManager.rejectRequest(requestId);
    if (result.success) {
      toast.info('Solicitud rechazada');
      loadData();
    }
  };

  const handleRemoveFriend = (friendId: string, friendName: string) => {
    const result = friendsManager.removeFriend(friendId);
    if (result.success) {
      toast.info(`${friendName} eliminado de tus amigos`);
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[180px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-10"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/10 border border-white/10">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">Comunidad Nexly</h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Conecta con personas increíbles</p>
          </div>
        </motion.div>

        <Tabs defaultValue="requests" className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 dark:bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 mb-8"
          >
            <TabsList className="bg-transparent border-0 w-full grid grid-cols-3 h-12">
              <TabsTrigger value="requests" className="gap-2 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300 text-[10px] font-black uppercase tracking-widest">
                <UserPlus className="w-3.5 h-3.5" />
                Solicitudes
                {pendingReceived.length > 0 && (
                  <span className="ml-1.5 bg-red-600 text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-red-600/20">
                    {pendingReceived.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="friends" className="gap-2 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300 text-[10px] font-black uppercase tracking-widest">
                <UserCheck className="w-3.5 h-3.5" />
                Amigos ({friends.length})
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="gap-2 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300 text-[10px] font-black uppercase tracking-widest">
                <Search className="w-3.5 h-3.5" />
                Descubrir
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Solicitudes recibidas */}
          <TabsContent value="requests" className="mt-0 space-y-4">
            <AnimatePresence mode="wait">
              {pendingReceived.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="p-16 text-center border-white/5 bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-3xl border-dashed">
                    <UserPlus className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No tienes solicitudes pendientes</p>
                    <p className="text-gray-600 text-[10px] mt-2 font-medium uppercase tracking-wider">Tu círculo está tranquilo por ahora</p>
                  </Card>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {pendingReceived.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-2xl group hover:border-white/20 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row items-center justify-between p-5 gap-4">
                          <div className="flex items-center gap-4 w-full sm:w-auto">
                            {request.fromUser?.avatar ? (
                              <img
                                src={request.fromUser.avatar}
                                alt={request.fromUser.name}
                                className="w-16 h-16 rounded-full object-cover ring-2 ring-white/5 group-hover:ring-blue-500 transition-all cursor-pointer"
                                onClick={() => navigate(`/profile/${request.fromUserId}`)}
                              />
                            ) : (
                              <div
                                className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center cursor-pointer group-hover:scale-105 transition-transform"
                                onClick={() => navigate(`/profile/${request.fromUserId}`)}
                              >
                                <span className="text-white text-2xl font-black italic">
                                  {request.fromUser?.name?.charAt(0).toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <p
                                className="font-black text-white text-lg uppercase tracking-tight cursor-pointer hover:text-blue-400 transition-colors"
                                onClick={() => navigate(`/profile/${request.fromUserId}`)}
                              >
                                {request.fromUser?.name || request.fromUserId}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">Nexly User</span>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                                  Recibida hace poco
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                              onClick={() => handleAccept(request.id, request.fromUser?.name || 'Usuario')}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest flex-1 sm:flex-none h-11 px-6 rounded-xl shadow-lg shadow-blue-600/20"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Aceptar
                            </Button>
                            <Button
                              onClick={() => handleReject(request.id)}
                              variant="outline"
                              className="bg-white/5 dark:bg-white/5 border-white/10 text-white font-black text-[10px] uppercase tracking-widest flex-1 sm:flex-none h-11 px-6 rounded-xl hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Rechazar
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Mis amigos */}
          <TabsContent value="friends" className="mt-0">
            <AnimatePresence mode="wait">
              {friends.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="p-16 text-center border-white/5 bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-3xl border-dashed">
                    <Users className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Aún no tienes amigos</p>
                    <p className="text-gray-600 text-[10px] mt-2 font-medium uppercase tracking-wider">¡Explora y conecta con la comunidad!</p>
                  </Card>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {friends.map((friend, index) => (
                    <motion.div
                      key={friend.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-2xl group hover:shadow-2xl hover:border-white/20 transition-all duration-500">
                        <div className="flex items-center justify-between p-5">
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="relative">
                              {friend.avatar ? (
                                <img
                                  src={friend.avatar}
                                  alt={friend.name}
                                  className="w-14 h-14 rounded-full object-cover ring-2 ring-white/5 group-hover:ring-blue-500 transition-all cursor-pointer"
                                  onClick={() => navigate(`/profile/${friend.id}`)}
                                />
                              ) : (
                                <div
                                  className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center cursor-pointer group-hover:scale-105 transition-transform"
                                  onClick={() => navigate(`/profile/${friend.id}`)}
                                >
                                  <span className="text-white font-black italic text-xl uppercase">
                                    {friend.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#050505] rounded-full" />
                            </div>
                            <div className="min-w-0">
                              <p
                                className="font-black text-white text-base uppercase tracking-tight group-hover:text-blue-400 transition-colors truncate cursor-pointer"
                                onClick={() => navigate(`/profile/${friend.id}`)}
                              >
                                {friend.name}
                              </p>
                              {friend.location ? (
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate mt-0.5">{friend.location}</p>
                              ) : (
                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest truncate mt-0.5">Nexly Member</p>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={() => handleRemoveFriend(friend.id, friend.name)}
                            size="icon"
                            variant="ghost"
                            className="w-10 h-10 rounded-xl bg-white/5 dark:bg-white/5 border border-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0"
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Sugerencias */}
          <TabsContent value="suggestions" className="mt-0">
            <AnimatePresence mode="wait">
              {suggestions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="p-16 text-center border-white/5 bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-3xl border-dashed">
                    <Search className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No hay sugerencias disponibles</p>
                    <p className="text-gray-600 text-[10px] mt-2 font-medium uppercase tracking-wider">Has conectado con todos, ¡impresionante!</p>
                  </Card>
                </motion.div>
              ) : (
                <Card className="overflow-hidden border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10">
                  <div className="p-2 space-y-1">
                    {suggestions.map((friend, index) => (
                      <motion.div
                        key={friend.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <FriendSuggestion
                          friend={{
                            id: friend.id,
                            name: friend.name,
                            mutualFriends: friend.mutualFriends,
                            avatar: friend.avatar,
                          }}
                          onFriendAction={loadData}
                        />
                      </motion.div>
                    ))}
                  </div>
                </Card>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
