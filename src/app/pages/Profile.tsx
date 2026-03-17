import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Post, PostData } from '../components/Post';
import { ProfileEditDialog } from '../components/ProfileEditDialog';
import { auth } from '../utils/auth';
import { getUserProfile, getUserPosts, UserProfile } from '../utils/mockData';
import { Camera, MapPin, Globe, Calendar, Settings, UserPlus, MessageCircle, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export function Profile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const currentUser = auth.getCurrentUser();
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<PostData[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const isOwnProfile = !userId || userId === currentUser?.id;

  useEffect(() => {
    // Verificar autenticación
    if (!currentUser) {
      navigate('/');
      return;
    }

    // Cargar perfil del usuario
    if (isOwnProfile) {
      // Perfil propio: combinar datos de auth con datos mock si existen
      const mockProfile = getUserProfile(currentUser.id);
      setProfileUser({
        ...currentUser,
        coverPhoto: mockProfile?.coverPhoto || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200',
        followers: mockProfile?.followers || 342,
        following: mockProfile?.following || 234,
        posts: mockProfile?.posts || 24,
        photos: mockProfile?.photos || 89,
        joinedDate: mockProfile?.joinedDate || 'Marzo 2024',
        friends: mockProfile?.friends || [],
        stories: mockProfile?.stories || []
      });
      setUserPosts(getUserPosts(currentUser.id));
    } else if (userId) {
      // Perfil de otro usuario
      const otherUser = getUserProfile(userId);
      if (otherUser) {
        setProfileUser(otherUser);
        setUserPosts(getUserPosts(userId));
      } else {
        toast.error('Usuario no encontrado');
        navigate('/dashboard');
      }
    }
  }, [userId, currentUser?.id, isOwnProfile, navigate]);

  const handleProfileUpdate = () => {
    const updatedUser = auth.getCurrentUser();
    if (updatedUser) {
      const mockProfile = getUserProfile(updatedUser.id);
      setProfileUser({
        ...updatedUser,
        coverPhoto: mockProfile?.coverPhoto || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200',
        followers: mockProfile?.followers || 342,
        following: mockProfile?.following || 234,
        posts: mockProfile?.posts || 24,
        photos: mockProfile?.photos || 89,
        joinedDate: mockProfile?.joinedDate || 'Marzo 2024',
        friends: mockProfile?.friends || [],
        stories: mockProfile?.stories || []
      });
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? 'Dejaste de seguir' : '¡Ahora sigues a este usuario!');
  };

  const handleMessage = () => {
    toast.success('Función de mensajes próximamente');
  };

  // Render nothing while loading or if not authenticated
  if (!currentUser || !profileUser) {
    return null;
  }

  const stats = [
    { label: 'Publicaciones', value: profileUser.posts.toString() },
    { label: 'Seguidores', value: profileUser.followers.toLocaleString() },
    { label: 'Siguiendo', value: profileUser.following.toString() },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Profile Header Card */}
        <Card className="mb-6 overflow-hidden">
          {/* Cover Photo */}
          <div className="h-64 relative">
            <img 
              src={profileUser.coverPhoto || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200'}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            {isOwnProfile && (
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-4 right-4 gap-2"
              >
                <Camera className="w-4 h-4" />
                Editar portada
              </Button>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 sm:-mt-20">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                {/* Profile Picture */}
                <div className="relative">
                  {profileUser.avatar ? (
                    <img
                      src={profileUser.avatar}
                      alt={profileUser.name}
                      className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white object-cover bg-white"
                    />
                  ) : (
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                      <span className="text-white text-5xl font-bold">
                        {profileUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {isOwnProfile && (
                    <button className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors border">
                      <Camera className="w-5 h-5 text-gray-700" />
                    </button>
                  )}
                </div>

                {/* Name and Bio */}
                <div className="text-center sm:text-left mb-4 sm:mb-0">
                  <h1 className="text-3xl font-bold">{profileUser.name}</h1>
                  {profileUser.bio && <p className="text-gray-600 mt-1">{profileUser.bio}</p>}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-2 text-sm text-gray-500">
                    {profileUser.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {profileUser.location}
                      </div>
                    )}
                    {profileUser.website && (
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        <a href={profileUser.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Sitio web
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Se unió en {profileUser.joinedDate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 sm:mt-0">
                {isOwnProfile ? (
                  <Button
                    onClick={() => setProfileEditOpen(true)}
                    className="gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Editar perfil
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleFollow}
                      variant={isFollowing ? 'outline' : 'default'}
                      className="gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      {isFollowing ? 'Siguiendo' : 'Seguir'}
                    </Button>
                    <Button
                      onClick={handleMessage}
                      variant="outline"
                      className="gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Mensaje
                    </Button>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center sm:justify-start gap-8 mt-6 pt-6 border-t">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center cursor-pointer hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Stories Destacadas */}
        {profileUser.stories && profileUser.stories.length > 0 && (
          <Card className="mb-6 p-4">
            <h2 className="text-lg font-semibold mb-4">Historias destacadas</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {profileUser.stories.map((story) => (
                <div key={story.id} className="flex flex-col items-center gap-2 min-w-fit cursor-pointer group">
                  <div className="w-20 h-20 rounded-full border-4 border-blue-500 p-0.5 group-hover:border-blue-600 transition-colors">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium truncate max-w-[80px]">{story.title}</p>
                    <p className="text-xs text-gray-500">{story.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="posts">Publicaciones</TabsTrigger>
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="friends">Amigos</TabsTrigger>
            <TabsTrigger value="photos">Fotos</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6 mt-6">
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <Post key={post.id} post={post} />
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No hay publicaciones todavía</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="info" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Información</h2>
              <div className="space-y-4">
                {profileUser.bio && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Biografía</h3>
                    <p className="text-gray-600">{profileUser.bio}</p>
                  </div>
                )}
                {profileUser.location && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Ubicación</h3>
                    <p className="text-gray-600">{profileUser.location}</p>
                  </div>
                )}
                {profileUser.website && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Sitio web</h3>
                    <a href={profileUser.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {profileUser.website}
                    </a>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-700">Se unió</h3>
                  <p className="text-gray-600">{profileUser.joinedDate}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="friends" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Amigos ({profileUser.friends?.length || 0})</h2>
              {profileUser.friends && profileUser.friends.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {/* Aquí podrías listar los amigos */}
                  <p className="text-gray-500 col-span-full">Lista de amigos próximamente</p>
                </div>
              ) : (
                <p className="text-gray-500">Sin amigos todavía</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Fotos ({profileUser.photos})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {userPosts
                  .filter(post => post.image)
                  .map((post) => (
                    <div key={post.id} className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                      <img
                        src={post.image}
                        alt="Photo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ProfileEditDialog
        open={profileEditOpen}
        onOpenChange={setProfileEditOpen}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
}