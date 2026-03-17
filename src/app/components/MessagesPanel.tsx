import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, ArrowLeft, Send } from 'lucide-react';

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
  text: string;
  sender: 'me' | 'other';
  time: string;
}

interface MessagesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MessagesPanel({ open, onOpenChange }: MessagesPanelProps) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const contacts: Contact[] = [
    {
      id: '1',
      name: 'María García',
      lastMessage: 'Hola! ¿Cómo estás?',
      time: 'Hace 5 min',
      unread: 2,
      online: true,
    },
    {
      id: '2',
      name: 'Carlos Rodríguez',
      lastMessage: 'Nos vemos mañana',
      time: 'Hace 1 hora',
      unread: 0,
      online: true,
    },
    {
      id: '3',
      name: 'Ana López',
      lastMessage: 'Gracias por compartir!',
      time: 'Hace 2 horas',
      unread: 0,
      online: false,
    },
    {
      id: '4',
      name: 'Diego Martínez',
      lastMessage: 'Perfecto, confirmo',
      time: 'Ayer',
      unread: 1,
      online: false,
    },
  ];

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    // Mock messages for demo
    setMessages([
      { id: '1', text: 'Hola! ¿Cómo estás?', sender: 'other', time: '10:30' },
      { id: '2', text: 'Todo bien! ¿Y tú?', sender: 'me', time: '10:32' },
      { id: '3', text: 'Genial! Te quería preguntar algo', sender: 'other', time: '10:33' },
    ]);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'me',
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages([...messages, newMessage]);
    setMessageText('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
        {!selectedContact ? (
          <>
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Mensajes</SheetTitle>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Buscar en mensajes" className="pl-10" />
              </div>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-140px)]">
              <div className="divide-y">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => handleContactClick(contact)}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {contact.name.charAt(0)}
                          </span>
                        </div>
                        {contact.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-sm">{contact.name}</p>
                          <span className="text-xs text-gray-500">{contact.time}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                          {contact.unread > 0 && (
                            <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                              {contact.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedContact(null)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {selectedContact.name.charAt(0)}
                    </span>
                  </div>
                  {selectedContact.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm">{selectedContact.name}</p>
                  <p className="text-xs text-gray-500">
                    {selectedContact.online ? 'En línea' : 'Desconectado'}
                  </p>
                </div>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        message.sender === 'me'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Escribe un mensaje..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}