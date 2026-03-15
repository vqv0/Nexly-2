import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Search, Send, ArrowLeft, MessageSquare, Circle, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../utils/auth';
import { getUserProfile, UserProfile } from '../utils/mockData';

interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  avatar?: string;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  sender: 'me' | 'other';
  time: string;
}

const CONTACTS: Contact[] = [
  {
    id: 'maria@nexly.com',
    name: 'María García',
    lastMessage: 'Hola! ¿Cómo estás?',
    time: 'Hace 5 min',
    unread: 2,
    online: true,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
  },
  {
    id: 'carlos@nexly.com',
    name: 'Carlos Rodríguez',
    lastMessage: 'Nos vemos mañana',
    time: 'Hace 1 hora',
    unread: 0,
    online: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  },
  {
    id: 'ana@nexly.com',
    name: 'Ana López',
    lastMessage: 'Gracias por compartir!',
    time: 'Hace 2 horas',
    unread: 0,
    online: false,
  },
  {
    id: 'diego@nexly.com',
    name: 'Diego Martínez',
    lastMessage: 'Perfecto, confirmo',
    time: 'Ayer',
    unread: 1,
    online: false,
  },
];

export default function MessagesPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = auth.getCurrentUser();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadMessages = (contactId: string) => {
    const allMessages: Message[] = JSON.parse(localStorage.getItem('nexly_messages') || '[]');
    const filtered = allMessages.filter(m => 
      (m.senderId === currentUser?.id && m.id.startsWith(contactId)) || // This is a bit hacky, let's improve
      (m.senderId === contactId && m.id.endsWith(currentUser?.id || ''))
    );
    
    // For now, let's keep it simple with a unique conversation key
    const conversationKey = [currentUser?.id, contactId].sort().join('_');
    const conversationMessages = allMessages.filter(m => m.id.includes(conversationKey));
    
    if (conversationMessages.length > 0) {
      setMessages(conversationMessages);
    } else {
      // Mock initial messages if none found
      setMessages([
        { id: `${conversationKey}_1`, senderId: contactId, text: `¡Hola! Soy ${CONTACTS.find(c => c.id === contactId)?.name || 'tu contacto'}.`, sender: 'other', time: '10:30' },
        { id: `${conversationKey}_2`, senderId: currentUser?.id || 'me', text: 'Hola! ¿Cómo estás?', sender: 'me', time: '10:32' },
      ]);
    }
  };

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    loadMessages(contact.id);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedContact || !currentUser) return;
    
    const conversationKey = [currentUser.id, selectedContact.id].sort().join('_');
    const newMessage: Message = {
      id: `${conversationKey}_${Date.now()}`,
      senderId: currentUser.id,
      text: messageText,
      sender: 'me',
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };
    
    const allMessages: Message[] = JSON.parse(localStorage.getItem('nexly_messages') || '[]');
    const updatedMessages = [...allMessages, newMessage];
    localStorage.setItem('nexly_messages', JSON.stringify(updatedMessages));
    
    setMessages(prev => [...prev, newMessage]);
    setMessageText('');
    window.dispatchEvent(new CustomEvent('nexly-messages-update'));
  };

  const filteredContacts = CONTACTS.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    if (userId) {
      const contact = CONTACTS.find(c => c.id === userId) || (getUserProfile(userId) ? {
        id: userId,
        name: getUserProfile(userId)!.name,
        lastMessage: 'Inicia una conversación',
        time: 'Recién',
        unread: 0,
        online: true,
        avatar: getUserProfile(userId)!.avatar
      } : null);
      
      if (contact) {
        setSelectedContact(contact);
        loadMessages(contact.id);
      }
    }
  }, [userId, currentUser?.id]);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      {/* Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[180px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-100px)] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* Contacts Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:col-span-4 h-full ${selectedContact ? 'hidden lg:block' : 'block'}`}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-3xl h-full flex flex-col overflow-hidden rounded-3xl">
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter">Mensajes</h2>
                </div>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input 
                    placeholder="BUSCAR CHATS..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/5 text-white placeholder:text-gray-600 rounded-xl focus:ring-blue-500/20 uppercase text-[10px] font-bold tracking-widest h-12" 
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {filteredContacts.map((contact, index) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleContactClick(contact)}
                      className={`group p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                        selectedContact?.id === contact.id 
                          ? 'bg-blue-600/10 border-blue-500/30' 
                          : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className="relative">
                          {contact.avatar ? (
                            <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-white/5" />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-black italic text-lg uppercase">
                              {contact.name.charAt(0)}
                            </div>
                          )}
                          {contact.online && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-[3px] border-[#0a0a0a] rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className={`font-black uppercase tracking-tight text-[11px] ${selectedContact?.id === contact.id ? 'text-blue-400' : 'text-white'}`}>
                              {contact.name}
                            </p>
                            <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">{contact.time}</span>
                          </div>
                          <p className="text-xs text-gray-500 truncate font-medium">{contact.lastMessage}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </motion.div>

          {/* Chat Window */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:col-span-8 h-full ${selectedContact ? 'block' : 'hidden lg:block'}`}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-3xl h-full flex flex-col overflow-hidden rounded-3xl">
              {selectedContact ? (
                <div className="h-full flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-white/[2%]">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate('/messages')}
                      className="lg:hidden rounded-xl hover:bg-white/5 text-gray-400"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative">
                        {selectedContact.avatar ? (
                          <img src={selectedContact.avatar} alt={selectedContact.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-black italic uppercase">
                            {selectedContact.name.charAt(0)}
                          </div>
                        )}
                        {selectedContact.online && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0a0a0a] rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-white text-[11px] uppercase tracking-tight">{selectedContact.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Circle className={`w-1.5 h-1.5 ${selectedContact.online ? 'fill-green-500 text-green-500' : 'fill-gray-600 text-gray-600'}`} />
                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                            {selectedContact.online ? 'En línea' : 'Desconectado'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5 text-gray-400">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  {/* Messages Area */}
                  <ScrollArea className="flex-1 px-6 py-8">
                    <div className="space-y-6">
                      <AnimatePresence>
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-xl ${
                                message.sender === 'me'
                                  ? 'bg-blue-600 text-white rounded-tr-none'
                                  : 'bg-white/5 border border-white/5 text-white rounded-tl-none'
                              }`}
                            >
                              <p className="text-sm font-medium leading-relaxed">{message.text}</p>
                              <p
                                className={`text-[9px] font-black uppercase tracking-widest mt-2 ${
                                  message.sender === 'me' ? 'text-blue-100/60' : 'text-gray-500'
                                }`}
                              >
                                {message.time}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                  
                  {/* Message Input */}
                  <div className="p-6 border-t border-white/5">
                    <div className="flex gap-3 bg-white/5 p-1 rounded-2xl border border-white/5">
                      <Input
                        placeholder="Escribe un mensaje..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="bg-transparent border-0 text-white placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 h-12 font-bold text-sm"
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        size="icon" 
                        className="w-12 h-12 rounded-xl bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex-shrink-0"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-50">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <MessageSquare className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-black uppercase italic tracking-widest mb-2">Tus Conversaciones</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Selecciona un chat para empezar a escribir</p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
