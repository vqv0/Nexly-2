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
import { Newspaper, PlayCircle, LayoutGrid } from 'lucide-react';
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
  ];

  const news: NewsData[] = [
    {
      id: '1',
      title: 'Nuevos avances en IA',
      source: 'Tech News',
      time: 'Hace 1h',
      image: 'https://images.unsplash.com/photo-1760199789464-eff5ba507e32?w=400',
      category: 'Tecnología',
    },
    {
      id: '2',
      title: 'Destinos 2026',
      source: 'Travel Weekly',
      time: 'Hace 3h',
      image: 'https://images.unsplash.com/photo-1743699537171-750edd44bd87?w=400',
      category: 'Viajes',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto relative z-10">
      {/* Background Glows */}
      <div className="expensive-bg">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 60, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-indigo-500/5 blur-[150px] rounded-full" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <main className="lg:col-span-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 p-8 rounded-[3rem] bg-white/5 dark:bg-white/5 border border-white/10 backdrop-blur-3xl shadow-[0_0_80px_rgba(59,130,246,0.1)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-indigo-600/10 pointer-events-none" />
              <div className="relative z-10">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2 italic uppercase">
                  Feed <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">para ti</span>
                </h1>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                  Descubre lo que está pasando en Nexly
                </p>
              </div>
              <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl relative z-10 shadow-2xl">
                <button 
                  onClick={() => setActiveTab('feed')}
                  className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'feed' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-105' : 'text-gray-500 hover:text-white'}`}
                >
                  Trending
                </button>
                <button 
                  onClick={() => setActiveTab('reels')}
                  className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'reels' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-105' : 'text-gray-500 hover:text-white'}`}
                >
                  Reels
                </button>
              </div>
            </div>

            {activeTab === 'feed' ? (
              <div className="space-y-8">
                <CreatePost onPostCreated={handlePostCreated} />
                <AnimatePresence mode="popLayout">
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.98, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                    >
                      <Post post={post} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
            )}
          </motion.div>
        </main>

        <aside className="lg:col-span-4 space-y-8 hidden lg:block">
          <div className="bg-white/5 dark:bg-white/5 border border-white/10 backdrop-blur-3xl rounded-[2.5rem] p-8 space-y-6 shadow-[0_0_60px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full group-hover:bg-blue-500/20 transition-colors" />
            <h2 className="text-sm font-black text-white flex items-center gap-3 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Sugerencias
            </h2>
            <div className="space-y-2">
              {suggestions.slice(0, 4).map((friend) => (
                <FriendSuggestion
                  key={friend.id}
                  friend={friend} // Contains users mapped directly to friends via suggestions
                  onFriendAction={loadSuggestions}
                />
              ))}
            </div>
          </div>

          <div className="bg-white/5 dark:bg-white/5 border border-white/10 backdrop-blur-3xl rounded-[2.5rem] p-8 space-y-6 shadow-[0_0_60px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full group-hover:bg-purple-500/20 transition-colors" />
            <h2 className="text-sm font-black text-white flex items-center gap-3 uppercase tracking-widest">
              <Newspaper className="w-4 h-4 text-purple-400" />
              Tendencias Globales
            </h2>
            <div className="space-y-5">
              {news.slice(0, 3).map((item) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
          </div>

          <div className="px-6 text-center pt-4">
            <p className="text-[9px] text-gray-600 tracking-widest uppercase font-black leading-relaxed">
              NEXLY INTERACTIVE &copy; 2026<br/>
              <span className="text-gray-700">RED SOCIAL DE PRÓXIMA GENERACIÓN</span>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}