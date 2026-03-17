import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { auth } from '../utils/auth';
import { Navbar } from '../components/Navbar';
import { CreatePost } from '../components/CreatePost';
import { Post, PostData } from '../components/Post';
import { Reel, ReelData } from '../components/Reel';
import { FriendSuggestion, FriendData } from '../components/FriendSuggestion';
import { NewsCard, NewsData } from '../components/NewsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Sparkles } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = auth.getCurrentUser();
  const [posts, setPosts] = useState<PostData[]>([]);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate('/');
      return;
    }

    // Mock data inicial
    setPosts([
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
    ]);
  }, [navigate]);

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

  const friendSuggestions: FriendData[] = [
    { id: '1', name: 'Laura Pérez', mutualFriends: 12 },
    { id: '2', name: 'Pedro Sánchez', mutualFriends: 8 },
    { id: '3', name: 'Isabel Moreno', mutualFriends: 15 },
    { id: '4', name: 'Roberto Jiménez', mutualFriends: 6 },
    { id: '5', name: 'Carmen Ruiz', mutualFriends: 10 },
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar izquierdo - Sugerencias de amigos */}
          <aside className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Sugerencias de amigos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {friendSuggestions.map((friend) => (
                  <FriendSuggestion key={friend.id} friend={friend} />
                ))}
              </CardContent>
            </Card>
          </aside>

          {/* Contenido principal */}
          <main className="lg:col-span-6 space-y-4">
            <Tabs defaultValue="feed" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="feed">Publicaciones</TabsTrigger>
                <TabsTrigger value="reels">Reels</TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="space-y-4 mt-4">
                <CreatePost onPostCreated={handlePostCreated} />
                
                {posts.map((post) => (
                  <Post key={post.id} post={post} />
                ))}
              </TabsContent>

              <TabsContent value="reels" className="mt-4">
                <div className="grid grid-cols-2 gap-3">
                  {reels.map((reel) => (
                    <Reel key={reel.id} reel={reel} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </main>

          {/* Sidebar derecho - Noticias */}
          <aside className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Noticias destacadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {news.map((item) => (
                  <NewsCard key={item.id} news={item} />
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}