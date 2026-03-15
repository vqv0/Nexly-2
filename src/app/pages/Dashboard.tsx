import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { auth } from '../utils/auth';
import { Navbar } from '../components/Navbar';
import { CreatePost } from '../components/CreatePost';
import { Post, PostData } from '../components/Post';
import { Reel, ReelData } from '../components/Reel';
import { FriendSuggestion } from '../components/FriendSuggestion';
import { NewsCard, NewsData } from '../components/NewsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Sparkles, Newspaper, PlayCircle, LayoutGrid } from 'lucide-react';
import { friendsManager } from '../utils/friendsManager';
import { postsManager } from '../utils/postsManager';
import { usersManager } from '../utils/usersManager';
import { UserProfile } from '../utils/mockData';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = auth.getCurrentUser();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [suggestions, setSuggestions] = useState<(UserProfile & { mutualFriends: number })[]>([]);
  const [activeTab, setActiveTab] = useState('feed');

  const loadSuggestions = useCallback(() => {
    setSuggestions(friendsManager.getSuggestions());
  }, []);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate('/');
      return;
    }

    loadSuggestions();

    const initialPosts: PostData[] = [
      {
        id: '1',
        author: 'María García',
        authorId: 'maria@nexly.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        content: '¡Increíble día explorando la naturaleza! 🌲✨',
        image: 'https://images.unsplash.com/photo-1607206637161-97cf47a9a9df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
        timestamp: 'Hace 2 horas',
        likes: 124,
        comments: [],
        shares: 5,
      },
      {
        id: '2',
        author: 'Carlos Rodríguez',
        authorId: 'carlos@nexly.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        content: 'Compartiendo mi nueva receta favorita. ¿Alguien más ama la cocina italiana? 🍝',
        image: 'https://images.unsplash.com/photo-1700137805953-c5708d9cd955?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
        timestamp: 'Hace 5 horas',
        likes: 89,
        comments: [],
        shares: 3,
      },
    ];

    setPosts(
      initialPosts
        .filter(p => !postsManager.isDeleted(p.id) && !usersManager.isBlocked(p.authorId || ''))
        .map(p => {
          const editedContent = postsManager.getEditedContent(p.id);
          return editedContent ? { ...p, content: editedContent } : p;
        })
    );

    const postsUpdateHandler = () => {
      setPosts(currentPosts => 
        currentPosts
          .filter(p => !postsManager.isDeleted(p.id) && !usersManager.isBlocked(p.authorId || ''))
          .map(p => {
            const editedContent = postsManager.getEditedContent(p.id);
            return editedContent ? { ...p, content: editedContent } : p;
          })
      );
    };

    const usersUpdateHandler = () => postsUpdateHandler();

    const friendsHandler = () => loadSuggestions();
    window.addEventListener('nexly-friends-update', friendsHandler);
    window.addEventListener('nexly-posts-update', postsUpdateHandler);
    window.addEventListener('nexly-users-update', usersUpdateHandler);
    return () => {
      window.removeEventListener('nexly-friends-update', friendsHandler);
      window.removeEventListener('nexly-posts-update', postsUpdateHandler);
      window.removeEventListener('nexly-users-update', usersUpdateHandler);
    };
  }, [navigate, loadSuggestions]);

  const handlePostCreated = (content: string, image?: string) => {
    const newPost: PostData = {
      id: Date.now().toString(),
      author: user?.name || 'Usuario',
      authorId: user?.id,
      avatar: user?.avatar,
      content,
      image,
      timestamp: 'Justo ahora',
      likes: 0,
      comments: [],
      shares: 0,
    };
    setPosts([newPost, ...posts]);
  };

  const reels: ReelData[] = [
    {
      id: '1',
      author: 'Ana López',
      thumbnail: 'https://images.unsplash.com/photo-1694878982098-1cec80d96eca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      title: 'Tutorial de fotografía móvil',
      views: '125K',
    },
    {
      id: '2',
      author: 'Diego Martínez',
      thumbnail: 'https://images.unsplash.com/photo-1743699537171-750edd44bd87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      title: 'Aventura en las montañas',
      views: '89K',
    },
    {
      id: '3',
      author: 'Sofía Torres',
      thumbnail: 'https://images.unsplash.com/photo-1706900034128-aadc237ded70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      title: 'Entrenamiento diario',
      views: '67K',
    },
    {
      id: '4',
      author: 'Luis Hernández',
      thumbnail: 'https://images.unsplash.com/photo-1635367216109-aa3353c0c22e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      title: 'Rutina de meditación',
      views: '54K',
    },
  ];

  const news: NewsData[] = [
    {
      id: '1',
      title: 'Nuevos avances en inteligencia artificial transforman la industria',
      source: 'Tech News',
      time: 'Hace 1h',
      image: 'https://images.unsplash.com/photo-1760199789464-eff5ba507e32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      category: 'Tecnología',
    },
    {
      id: '2',
      title: 'Los mejores destinos para viajar este año',
      source: 'Travel Weekly',
      time: 'Hace 3h',
      image: 'https://images.unsplash.com/photo-1743699537171-750edd44bd87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      category: 'Viajes',
    },
    {
      id: '3',
      title: 'Mercados financieros alcanzan nuevos récords',
      source: 'Finance Today',
      time: 'Hace 5h',
      image: 'https://images.unsplash.com/photo-1579532536935-619928decd08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      category: 'Finanzas',
    },
    {
      id: '4',
      title: 'Consejos de salud para una vida más equilibrada',
      source: 'Health Magazine',
      time: 'Hace 7h',
      image: 'https://images.unsplash.com/photo-1635367216109-aa3353c0c22e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      category: 'Salud',
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden font-sans">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed expensive-bg">
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ x: [0, -80, 0], y: [0, 100, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[180px] rounded-full" 
        />
      </div>

      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar izquierdo - Sugerencias */}
          <motion.aside 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 space-y-6 hidden lg:block"
          >
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl">
              <CardHeader className="pb-2 border-b border-white/5 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  Sugerencias
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 py-4 space-y-1">
                <AnimatePresence>
                  {suggestions.length > 0 ? (
                    suggestions.slice(0, 5).map((friend, index) => (
                      <motion.div
                        key={friend.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <FriendSuggestion
                          friend={{
                            id: friend.id,
                            name: friend.name,
                            mutualFriends: friend.mutualFriends,
                            avatar: friend.avatar,
                          }}
                          onFriendAction={loadSuggestions}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-6">
                      ¡Ya conoces a todos! 🎉
                    </p>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
            
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.8 }}
              className="px-4"
            >
              <p className="text-[10px] text-gray-600 tracking-widest uppercase font-bold">
                Nexly &copy; 2026 • Premium Experience
              </p>
            </motion.div>
          </motion.aside>

          {/* Contenido principal */}
          <main className="lg:col-span-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 mb-6 flex justify-center">
                  <TabsList className="bg-transparent border-0 w-full">
                    <TabsTrigger 
                      value="feed" 
                      className="flex-1 gap-2 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      Publicaciones
                    </TabsTrigger>
                    <TabsTrigger 
                      value="reels" 
                      className="flex-1 gap-2 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Reels
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="feed" className="space-y-6 mt-0">
                  <CreatePost onPostCreated={handlePostCreated} />
                  
                  <div className="space-y-6">
                    <AnimatePresence mode="popLayout">
                      {posts.map((post, index) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Post post={post} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </TabsContent>

                <TabsContent value="reels" className="mt-0">
                  <div className="grid grid-cols-2 gap-4">
                    {reels.map((reel, index) => (
                      <motion.div
                        key={reel.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Reel reel={reel} />
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </main>

          {/* Sidebar derecho - Noticias */}
          <motion.aside 
            initial={{ opacity: 0, x: 30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 space-y-6"
          >
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl">
              <CardHeader className="pb-2 border-b border-white/5 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Newspaper className="w-5 h-5 text-indigo-400" />
                  Noticias Nexly
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {news.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <NewsCard news={item} />
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}