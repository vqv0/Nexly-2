import { useState, useEffect } from 'react';
import { auth } from '../utils/auth';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, ArrowLeft, Send, MessageSquare, MoreVertical, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  sender: 'me' | 'other';
  time: string;
}

interface MessagesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MessagesPanel({ open, onOpenChange }: MessagesPanelProps) {
  const currentUser = auth.getCurrentUser();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const contacts: Contact[] = [
    {
      id: 'maria@nexly.com',
      name: 'María García',
      lastMessage: 'Hola! ¿Cómo estás?',
      time: 'Hace 5 min',
      unread: 2,
      online: true,
    },
    {
      id: 'carlos@nexly.com',
      name: 'Carlos Rodríguez',
      lastMessage: 'Nos vemos mañana',
      time: 'Hace 1 hora',
      unread: 0,
      online: true,
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

  const loadMessages = () => {
    if (!selectedContact || !currentUser) return;
    const allMessages: Message[] = JSON.parse(localStorage.getItem('nexly_messages') || '[]');
    const conversationKey = [currentUser.id, selectedContact.id].sort().join('_');
    const conversationMessages = allMessages.filter(m => m.id.includes(conversationKey));
    
    if (conversationMessages.length > 0) {
      setMessages(conversationMessages);
    } else {
      setMessages([
        { id: `${conversationKey}_1`, senderId: selectedContact.id, text: 'Hola! ¿En qué puedo ayudarte?', sender: 'other', time: '10:30' },
      ]);
    }
  };

  useEffect(() => {
    if (open && selectedContact) {
      loadMessages();
    }
  }, [open, selectedContact?.id]);

  useEffect(() => {
    const handler = () => {
      if (open && selectedContact) loadMessages();
    };
    window.addEventListener('nexly-messages-update', handler);
    return () => window.removeEventListener('nexly-messages-update', handler);
  }, [open, selectedContact?.id]);

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
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
    localStorage.setItem('nexly_messages', JSON.stringify([...allMessages, newMessage]));
    
    setMessages(prev => [...prev, newMessage]);
    setMessageText('');
    window.dispatchEvent(new CustomEvent('nexly-messages-update'));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[450px] p-0 border-white/10 bg-[#0a0a0a]/95 backdrop-blur-3xl shadow-2xl">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full" />
        </div>

        <div className="relative z-10 h-full flex flex-col">
          {!selectedContact ? (
            <>
              <SheetHeader className="p-6 border-b border-white/5 space-y-0 text-left">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                  </div>
                  <SheetTitle className="text-xl font-black text-white italic uppercase tracking-tight">Nexly Chat</SheetTitle>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input 
                    placeholder="BUSCAR CONTACTOS..." 
                    className="pl-10 bg-white/5 border-white/5 text-white placeholder:text-gray-600 rounded-xl focus:ring-blue-500/50 uppercase text-[10px] font-bold tracking-widest h-11" 
                  />
                </div>
              </SheetHeader>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {contacts.map((contact, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={contact.id}
                      onClick={() => handleContactClick(contact)}
                      className="group p-4 hover:bg-white/5 rounded-2xl cursor-pointer transition-all duration-300 border border-transparent hover:border-white/5"
                    >
                      <div className="flex gap-4">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center p-0.5">
                            <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                              <span className="text-white font-black italic text-lg uppercase">
                                {contact.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          {contact.online && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-[3px] border-[#0a0a0a] rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-black text-white text-[11px] uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                              {contact.name}
                            </p>
                            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{contact.time}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-500 truncate font-medium">{contact.lastMessage}</p>
                            {contact.unread > 0 && (
                              <span className="ml-2 bg-blue-600 text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-blue-600/20">
                                {contact.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-white/[2%]">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedContact(null)}
                  className="rounded-xl hover:bg-white/5 text-gray-400"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-0.5">
                      <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center">
                        <span className="text-white font-black italic uppercase">
                          {selectedContact.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    {selectedContact.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0a0a0a] rounded-full" />
                    )}
                  </div>
                  <div>
                    <p className="font-black text-white text-[11px] uppercase tracking-tight">{selectedContact.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Circle className={`w-1.5 h-1.5 ${selectedContact.online ? 'fill-green-500 text-green-500' : 'fill-gray-600 text-gray-600'}`} />
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                        {selectedContact.online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5 text-gray-400">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
              
              <ScrollArea className="flex-1 px-6 py-8">
                <style dangerouslySetInnerHTML={{ __html: `
                  .scrollbar-hide::-webkit-scrollbar { display: none; }
                `}} />
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
              
              <div className="p-6 border-t border-white/5">
                <div className="flex gap-3 bg-white/5 p-1 rounded-2xl border border-white/5">
                  <Input
                    placeholder="Escribe algo brillante..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="bg-transparent border-0 text-white placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 h-12"
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
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}