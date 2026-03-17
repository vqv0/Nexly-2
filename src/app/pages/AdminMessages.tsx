import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { adminAuth } from '../utils/adminAuth';
import { AdminNavbar } from '../components/AdminNavbar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Search, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
}

export default function AdminMessages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<{[key: string]: Message[]}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  useEffect(() => {
    if (!adminAuth.isAuthenticated()) {
      navigate('/admin');
      return;
    }

    loadMessages();
  }, [navigate]);

  const loadMessages = () => {
    // Cargar mensajes de localStorage y agruparlos por conversación
    const messages: Message[] = JSON.parse(
      localStorage.getItem('nexly_messages') || '[]'
    );

    // Agrupar mensajes por conversación
    const grouped: {[key: string]: Message[]} = {};
    messages.forEach((msg) => {
      const conversationKey = [msg.sender, msg.receiver].sort().join('-');
      if (!grouped[conversationKey]) {
        grouped[conversationKey] = [];
      }
      grouped[conversationKey].push(msg);
    });

    setConversations(grouped);
  };

  const conversationKeys = Object.keys(conversations);
  const filteredConversations = conversationKeys.filter((key) =>
    key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Mensajes
          </h1>
          <p className="text-gray-600 mt-2">
            Ver conversaciones entre usuarios
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar conversaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Conversaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay mensajes</p>
                  </div>
                ) : (
                  filteredConversations.map((key) => {
                    const msgs = conversations[key];
                    const lastMsg = msgs[msgs.length - 1];
                    const participants = key.split('-');

                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedConversation(key)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedConversation === key
                            ? 'bg-blue-50 border-2 border-blue-500'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="w-4 h-4 text-gray-500" />
                          <p className="font-semibold text-sm">
                            {participants[0]} ↔ {participants[1]}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {lastMsg.content}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {msgs.length} mensajes
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages Display */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedConversation
                  ? `Conversación: ${selectedConversation.replace('-', ' ↔ ')}`
                  : 'Selecciona una conversación'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedConversation ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {conversations[selectedConversation].map((msg) => (
                    <div
                      key={msg.id}
                      className="bg-gray-50 rounded-lg p-4 border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">
                              {msg.sender.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{msg.sender}</p>
                            <p className="text-xs text-gray-500">
                              Para: {msg.receiver}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">{msg.timestamp}</p>
                      </div>
                      <p className="text-gray-700">{msg.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Selecciona una conversación para ver los mensajes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
