import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { adminAuth } from '../utils/adminAuth';
import { AdminNavbar } from '../components/AdminNavbar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Search, MessageSquare, ShieldAlert, History, User, FilterX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/button';

interface Message {
  id: string;
  senderId: string;
  text: string;
  time: string;
  sender?: 'me' | 'other'; // For user-specific view compatibility
}

export default function AdminMessages() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const userFilter = searchParams.get('user');
  
  const [conversations, setConversations] = useState<{[key: string]: Message[]}>({});
  const [searchTerm, setSearchTerm] = useState(userFilter || '');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  useEffect(() => {
    if (!adminAuth.isAuthenticated()) {
      navigate('/admin');
      return;
    }
    loadMessages();
  }, [navigate]);

  useEffect(() => {
    if (userFilter) {
      setSearchTerm(userFilter);
    }
  }, [userFilter]);

  const loadMessages = () => {
    const messages: Message[] = JSON.parse(
      localStorage.getItem('nexly_messages') || '[]'
    );

    const grouped: {[key: string]: Message[]} = {};
    messages.forEach((msg) => {
      // The message ID contains the conversation key: sender_receiver_timestamp
      const parts = msg.id.split('_');
      if (parts.length >= 2) {
        const conversationKey = [parts[0], parts[1]].sort().join(' - ');
        if (!grouped[conversationKey]) {
          grouped[conversationKey] = [];
        }
        grouped[conversationKey].push(msg);
      }
    });

    setConversations(grouped);
  };

  const clearFilter = () => {
    setSearchTerm('');
    setSearchParams({});
  };

  const conversationKeys = Object.keys(conversations);
  const filteredConversations = conversationKeys.filter((key) =>
    key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <AdminNavbar />

      {/* Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 expensive-bg">
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-black italic uppercase tracking-tighter">REGISTRO DE <span className="text-purple-400">MENSAJES</span></h1>
              </div>
              <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px] ml-1">
                Supervisión y auditoría de comunicaciones privadas
              </p>
            </div>
            {searchTerm && (
              <Button 
                onClick={clearFilter}
                variant="outline" 
                className="bg-white/5 border-white/10 hover:bg-white/10 text-xs font-black uppercase tracking-widest rounded-xl h-10 px-4 group"
              >
                <FilterX className="w-4 h-4 mr-2 text-purple-400 group-hover:scale-110 transition-transform" />
                Limpiar Filtro
              </Button>
            )}
          </div>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white/5 border-white/5 backdrop-blur-3xl overflow-hidden">
            <CardContent className="pt-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5 group-focus-within:text-purple-400 transition-colors" />
                <Input
                  placeholder="FILTRAR CONVERSACIONES POR USUARIO O ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-700 h-14 rounded-2xl focus:ring-purple-500/20 focus:border-purple-500/40 transition-all font-bold uppercase tracking-widest text-[10px]"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[650px]">
          {/* Conversations List */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 h-full"
          >
            <Card className="bg-white/5 border-white/5 backdrop-blur-3xl h-full flex flex-col overflow-hidden">
              <CardHeader className="border-b border-white/5 py-4">
                <CardTitle className="text-xs font-black italic uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Hilos Auditados
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="space-y-3">
                  {filteredConversations.length === 0 ? (
                    <div className="text-center py-20 text-gray-600 font-black uppercase tracking-widest text-[10px]">
                      No hay registros disponibles
                    </div>
                  ) : (
                    filteredConversations.map((key) => {
                      const msgs = conversations[key];
                      const lastMsg = msgs[msgs.length - 1];
                      const participants = key.split(' - ');
                      const isSelected = selectedConversation === key;

                      return (
                        <motion.button
                          key={key}
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedConversation(key)}
                          className={`w-full text-left p-4 rounded-2xl transition-all border flex flex-col gap-2 relative group overflow-hidden ${
                            isSelected
                              ? 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/5'
                              : 'bg-white/5 border-white/5 hover:bg-white/10'
                          }`}
                        >
                          {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-purple-500' : 'bg-white/10'}`}>
                                <User className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                              </div>
                              <p className={`font-black uppercase tracking-tight text-[11px] ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                {participants[0]} <span className="text-purple-500 mx-1">/</span> {participants[1]}
                              </p>
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-500 line-clamp-1 italic font-bold">
                            "{lastMsg.text}"
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{msgs.length} EVENTOS</span>
                            <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">ACTIVO</span>
                          </div>
                        </motion.button>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Messages Display */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8 h-full"
          >
            <Card className="bg-white/5 border-white/5 backdrop-blur-3xl h-full flex flex-col overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
              <CardHeader className="border-b border-white/5 py-6">
                <CardTitle className="text-sm font-black italic uppercase tracking-tighter">
                  {selectedConversation ? (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      MONITOREO: <span className="text-purple-400">{selectedConversation}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-gray-600">
                      <ShieldAlert className="w-5 h-5 opacity-30" />
                      SELECCIONE UN HILO DE COMUNICACIÓN
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black/5">
                <AnimatePresence mode="wait">
                  {selectedConversation ? (
                    <motion.div 
                      key={selectedConversation}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-6"
                    >
                      {conversations[selectedConversation].map((msg, idx) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group"
                        >
                          <div className="flex items-center gap-3 mb-2">
                             <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full ring-1 ring-white/10 group-hover:ring-purple-500/30 transition-all">
                                <p className="font-black text-[9px] uppercase tracking-widest text-purple-400">{msg.senderId}</p>
                                <div className="w-1 h-1 bg-gray-700 rounded-full" />
                                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{msg.time}</p>
                             </div>
                          </div>
                          <div className="pl-4 border-l-2 border-white/5 group-hover:border-purple-500/20 transition-all">
                            <p className="text-gray-300 text-[13px] leading-relaxed font-bold tracking-tight bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5 group-hover:border-white/10 transition-all">
                              {msg.text}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                      <MessageSquare className="w-24 h-24 mb-6" />
                      <p className="text-xl font-black uppercase tracking-[0.5em]">SYSTEM HOLD</p>
                    </div>
                  )}
                </AnimatePresence>
              </CardContent>
              {selectedConversation && (
                <div className="p-4 border-t border-white/5 bg-black/20">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.5em] text-center">CANAL DE AUDITORÍA EN TIEMPO REAL - NEXLY SECURE</p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
