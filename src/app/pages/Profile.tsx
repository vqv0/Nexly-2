import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Post, PostData, getSharedPosts } from '../components/Post';
import { ProfileEditDialog } from '../components/ProfileEditDialog';
import { auth } from '../utils/auth';
import { getUserProfile, getUserPosts, UserProfile } from '../utils/mockData';
import { friendsManager } from '../utils/friendsManager';
import { postsManager } from '../utils/postsManager';
import { usersManager } from '../utils/usersManager';
import { Camera, MapPin, Globe, Calendar, Settings, UserPlus, UserCheck, MessageCircle, Share2, Check, Clock, X, Info, Users, Image as ImageIcon, LayoutGrid, MoreHorizontal, Ban, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'motion/react';

export function Profile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const currentUser = auth.getCurrentUser();
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<PostData[]>([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [friendStatus, setFriendStatus] = useState<'none' | 'friends' | 'pending_sent' | 'pending_received'>('none');
  const [friendsList, setFriendsList] = useState<UserProfile[]>([]);
  const [sharedPosts, setSharedPosts] = useState<PostData[]>([]);
  const [isBlocked, setIsBlocked] = useState(userId ? usersManager.isBlocked(userId) : false);

  const isOwnProfile = !userId || userId === currentUser?.id;

  const loadFriendData = useCallback(() => {
    if (userId && !isOwnProfile) {
      setFriendStatus(friendsManager.getRelationshipStatus(userId));
    }
    const targetId = isOwnProfile ? currentUser?.id : userId;
    if (targetId) {
      setFriendsList(friendsManager.getFriends(targetId));
    }
  }, [userId, isOwnProfile, currentUser?.id]);

  const buildOwnProfile = useCallback((user: ReturnType<typeof auth.getCurrentUser>) => {
    if (!user) return;
    const mockProfile = getUserProfile(user.id);
    const registered = auth.getUserById(user.id);
    setProfileUser({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar || mockProfile?.avatar,
      bio: user.bio || mockProfile?.bio,
      location: user.location || mockProfile?.location,
      website: user.website || mockProfile?.website,
      coverPhoto: user.coverPhoto || mockProfile?.coverPhoto || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200',
      followers: mockProfile?.followers || 0,
      following: mockProfile?.following || 0,
      posts: mockProfile?.posts || 0,
      photos: mockProfile?.photos || 0,
      joinedDate: user.createdAt || registered?.createdAt || mockProfile?.joinedDate || 'Marzo 2024',
      friends: mockProfile?.friends || [],
      stories: mockProfile?.stories || []
    });
  }, []);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    const filterAndMap = (posts: PostData[]) => {
      return posts
        .filter(p => !postsManager.isDeleted(p.id))
        .map(p => {
          const editedContent = postsManager.getEditedContent(p.id);
          return editedContent ? { ...p, content: editedContent } : p;
        });
    };

    if (isOwnProfile) {
      buildOwnProfile(currentUser);
      setUserPosts(filterAndMap(getUserPosts(currentUser.id)));
      setSharedPosts(filterAndMap(getSharedPosts(currentUser.id)));
    } else if (userId) {
      const otherUser = getUserProfile(userId);
      if (otherUser) {
        setProfileUser(otherUser);
        setUserPosts(filterAndMap(getUserPosts(userId)));
        setSharedPosts(filterAndMap(getSharedPosts(userId)));
      } else {
        // Check if user exists in localStorage
        const registeredUser = auth.getUserById(userId);
        if (registeredUser) {
          const mockProfile = getUserProfile(userId); // Might still be null
          setProfileUser({
            id: registeredUser.email,
            email: registeredUser.email,
            name: registeredUser.name,
            avatar: registeredUser.avatar || mockProfile?.avatar,
            bio: registeredUser.bio || mockProfile?.bio,
            location: registeredUser.location || mockProfile?.location,
            website: registeredUser.website || mockProfile?.website,
            coverPhoto: registeredUser.coverPhoto || mockProfile?.coverPhoto || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200',
            followers: mockProfile?.followers || 0,
            following: mockProfile?.following || 0,
            posts: mockProfile?.posts || 0,
            photos: mockProfile?.photos || 0,
            joinedDate: registeredUser.createdAt || mockProfile?.joinedDate || 'Recientemente',
            friends: mockProfile?.friends || [],
            stories: mockProfile?.stories || []
          });
          setUserPosts(filterAndMap(getUserPosts(userId)));
          setSharedPosts(filterAndMap(getSharedPosts(userId)));
        } else {
          toast.error('Usuario no encontrado');
          navigate('/dashboard');
        }
      }
    }

    loadFriendData();

    const friendsHandler = () => loadFriendData();
    const profileHandler = () => {
      if (isOwnProfile) {
        const refreshedUser = auth.getCurrentUser();
        buildOwnProfile(refreshedUser);
      }
    };
    const sharedHandler = () => {
      const targetId = isOwnProfile ? currentUser?.id : userId;
      if (targetId) setSharedPosts(getSharedPosts(targetId));
    };
    const postsUpdateHandler = () => {
      setUserPosts(current => 
        current
          .filter(p => !postsManager.isDeleted(p.id))
          .map(p => {
            const editedContent = postsManager.getEditedContent(p.id);
            return editedContent ? { ...p, content: editedContent } : p;
          })
      );
      setSharedPosts(current => 
        current
          .filter(p => !postsManager.isDeleted(p.id))
          .map(p => {
            const editedContent = postsManager.getEditedContent(p.id);
            return editedContent ? { ...p, content: editedContent } : p;
          })
      );
    };

    const usersUpdateHandler = () => {
      if (userId) setIsBlocked(usersManager.isBlocked(userId));
    };

    window.addEventListener('nexly-friends-update', friendsHandler);
    window.addEventListener('nexly-profile-update', profileHandler);
    window.addEventListener('nexly-shared-update', sharedHandler);
    window.addEventListener('nexly-posts-update', postsUpdateHandler);
    window.addEventListener('nexly-users-update', usersUpdateHandler);
    return () => {
      window.removeEventListener('nexly-friends-update', friendsHandler);
      window.removeEventListener('nexly-profile-update', profileHandler);
      window.removeEventListener('nexly-shared-update', sharedHandler);
      window.removeEventListener('nexly-posts-update', postsUpdateHandler);
      window.removeEventListener('nexly-users-update', usersUpdateHandler);
    };
  }, [userId, currentUser?.id, isOwnProfile, navigate, loadFriendData, buildOwnProfile]);

  const handleProfileUpdate = () => {
    const updatedUser = auth.getCurrentUser();
    buildOwnProfile(updatedUser);
  };

  const handleAddFriend = () => {
    if (!userId) return;
    const result = friendsManager.sendRequest(userId);
    if (result.success) {
      setFriendStatus('pending_sent');
      toast.success(`Solicitud de amistad enviada`);
    } else {
      toast.error(result.error || 'Error al enviar solicitud');
    }
  };

  const handleCancelRequest = () => {
    if (!userId) return;
    friendsManager.cancelRequest(userId);
    setFriendStatus('none');
    toast.info('Solicitud cancelada');
  };

  const handleAcceptRequest = () => {
    if (!userId) return;
    const request = friendsManager.getPendingRequestFrom(userId);
    if (request) {
      friendsManager.acceptRequest(request.id);
      setFriendStatus('friends');
      toast.success(`¡Ahora eres amigo de ${profileUser?.name}!`);
      loadFriendData();
    }
  };

  const handleRejectRequest = () => {
    if (!userId) return;
    const request = friendsManager.getPendingRequestFrom(userId);
    if (request) {
      friendsManager.rejectRequest(request.id);
      setFriendStatus('none');
      toast.info('Solicitud rechazada');
    }
  };

  const handleRemoveFriend = () => {
    if (!userId) return;
    friendsManager.removeFriend(userId);
    setFriendStatus('none');
    toast.info('Eliminado de tus amigos');
    loadFriendData();
  };

  const handleMessage = () => {
    navigate(`/messages/${userId}`);
    toast.success(`Iniciando chat con ${profileUser?.name}`);
  };

  const handleBlockUser = () => {
    if (!userId) return;
    if (window.confirm(`¿Estás seguro de que quieres bloquear a ${profileUser?.name}? No verás sus publicaciones ni podrá contactarte.`)) {
      usersManager.blockUser(userId);
      toast.error(`Usuario ${profileUser?.name} bloqueado`);
      navigate('/dashboard');
    }
  };

  const handleReportUser = () => {
    if (!userId) return;
    const reason = window.prompt(`¿Por qué quieres reportar a ${profileUser?.name}?`);
    if (reason) {
      usersManager.reportUser(userId, reason);
      toast.success('Reporte de usuario enviado correctamente');
    }
  };

  if (!currentUser || !profileUser) {
    return null;
  }

  const stats = [
    { label: 'Publicaciones', value: profileUser.posts.toString() },
    { label: 'Seguidores', value: profileUser.followers.toLocaleString() },
    { label: 'Amigos', value: friendsList.length.toString() },
  ];

  const renderFriendButton = () => {
    switch (friendStatus) {
      case 'friends':
        return (
          <Button onClick={handleRemoveFriend} variant="outline" className="gap-2 bg-white/5 dark:bg-white/5 border-white/10 text-white hover:bg-red-500/10 hover:text-red-400">
            <UserCheck className="w-4 h-4" />
            Amigos
          </Button>
        );
      case 'pending_sent':
        return (
          <div className="flex gap-1">
            <Button variant="outline" className="gap-2 bg-blue-500/10 border-blue-500/20 text-blue-400" disabled>
              <Clock className="w-4 h-4" />
              Enviado
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCancelRequest} className="hover:bg-red-500/10 hover:text-red-400 text-gray-500">
              <X className="w-4 h-4" />
            </Button>
          </div>
        );
      case 'pending_received':
        return (
          <div className="flex gap-2">
            <Button onClick={handleAcceptRequest} className="gap-2 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20">
              <Check className="w-4 h-4" />
              Aceptar
            </Button>
            <Button onClick={handleRejectRequest} variant="outline" className="gap-2 bg-white/5 dark:bg-white/5 border-white/10 text-white hover:bg-red-500/10 hover:text-red-400">
              <X className="w-4 h-4" />
              Rechazar
            </Button>
          </div>
        );
      default:
        return (
          <Button onClick={handleAddFriend} className="gap-2 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20">
            <UserPlus className="w-4 h-4" />
            Añadir amigo
          </Button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 100, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, -100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[180px] rounded-full" 
        />
      </div>
      
      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
        {isBlocked ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-20 flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 bg-white/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
              <Ban className="w-12 h-12 text-red-500/50" />
            </div>
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">
              Este usuario está bloqueado
            </h2>
            <p className="text-gray-500 max-w-sm font-bold uppercase tracking-widest text-xs leading-loose mb-8">
              No puedes ver las publicaciones de este usuario porque lo has bloqueado.
            </p>
            <Button
              onClick={() => {
                if (window.confirm('¿Quieres desbloquear a este usuario?')) {
                  usersManager.unblockUser(userId!);
                  toast.success('Usuario desbloqueado');
                }
              }}
              className="bg-white text-black hover:bg-gray-200 font-bold px-8 py-6 rounded-2xl"
            >
              Desbloquear usuario
            </Button>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
          {/* Profile Header Card */}
          <Card className="mb-8 overflow-hidden border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-2xl shadow-2xl rounded-3xl">
            {/* Cover Photo */}
            <div className="h-48 sm:h-72 relative">
              <img 
                src={profileUser.coverPhoto || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200'}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {isOwnProfile && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setProfileEditOpen(true)}
                  className="absolute bottom-4 right-4 gap-2 bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/60 rounded-xl"
                >
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">Editar portada</span>
                </Button>
              )}
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-20 relative z-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                  {/* Profile Picture */}
                  <div className="relative group">
                    <div className="ring-4 ring-[#050505] rounded-full overflow-hidden shadow-2xl">
                    {profileUser.avatar ? (
                      <img
                        src={profileUser.avatar}
                        alt={profileUser.name}
                        className="w-32 h-32 sm:w-44 sm:h-44 object-cover bg-[#1a1a1a]"
                      />
                    ) : (
                      <div className="w-32 h-32 sm:w-44 sm:h-44 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-white text-5xl font-black italic">
                          {profileUser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    </div>
                    {isOwnProfile && (
                      <button 
                        onClick={() => setProfileEditOpen(true)}
                        className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-blue-500 transition-all border-4 border-[#050505] active:scale-90"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Name and Bio */}
                  <div className="text-center sm:text-left mb-4 sm:mb-2">
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{profileUser.name}</h1>
                    {profileUser.bio && <p className="text-gray-400 mt-2 font-medium max-w-md">{profileUser.bio}</p>}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                      {profileUser.location && (
                        <div className="flex items-center gap-1.5 bg-white/5 dark:bg-white/5 py-1.5 px-3 rounded-full border border-white/5">
                          <MapPin className="w-3.5 h-3.5 text-blue-400" />
                          {profileUser.location}
                        </div>
                      )}
                      {profileUser.website && (
                        <div className="flex items-center gap-1.5 bg-white/5 dark:bg-white/5 py-1.5 px-3 rounded-full border border-white/5">
                          <Globe className="w-3.5 h-3.5 text-indigo-400" />
                          <a href={profileUser.website} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                            Web
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 bg-white/5 dark:bg-white/5 py-1.5 px-3 rounded-full border border-white/5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {profileUser.joinedDate}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-6 sm:mb-2">
                  {isOwnProfile ? (
                    <Button
                      onClick={() => setProfileEditOpen(true)}
                      className="gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-6 rounded-2xl shadow-lg shadow-blue-600/20"
                    >
                      <Settings className="w-4 h-4" />
                      Editar perfil
                    </Button>
                  ) : (
                    <>
                      {renderFriendButton()}
                      <Button
                        onClick={handleMessage}
                        variant="outline"
                        className="gap-2 bg-white/5 dark:bg-white/5 border-white/10 text-white hover:bg-white/10 dark:bg-white/10 py-6 px-6 rounded-2xl"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Mensaje
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="bg-white/5 dark:bg-white/5 border-white/10 text-white hover:bg-white/10 dark:bg-white/10 w-12 h-12 flex items-center justify-center rounded-2xl">
                            <MoreHorizontal className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0a0a0a]/95 backdrop-blur-3xl border-white/10 text-white rounded-xl shadow-2xl min-w-[180px]">
                          <DropdownMenuItem 
                            onSelect={handleReportUser}
                            className="gap-2 cursor-pointer font-bold text-xs text-orange-500 hover:bg-orange-500/10 py-2.5"
                          >
                            <ShieldAlert className="w-4 h-4" /> Reportar usuario
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onSelect={handleBlockUser}
                            className="gap-2 cursor-pointer font-bold text-xs text-red-500 hover:bg-red-500/10 py-2.5"
                          >
                            <Ban className="w-4 h-4" /> Bloquear usuario
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-8 mt-10 pt-8 border-t border-white/5">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center group cursor-pointer p-4 rounded-3xl hover:bg-white/5 dark:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/5">
                    <p className="text-2xl sm:text-3xl font-black text-white group-hover:text-blue-400 transition-colors uppercase italic">{stat.value}</p>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stories Destacadas */}
        {profileUser.stories && profileUser.stories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-8 p-6 border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-3xl">
              <h2 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-blue-400" />
                Historias destacadas
              </h2>
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {profileUser.stories.map((story) => (
                  <div key={story.id} className="flex flex-col items-center gap-3 min-w-fit cursor-pointer group">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full border-4 border-blue-600/50 p-1 group-hover:border-blue-500 transition-all duration-500 group-hover:scale-105">
                        <img
                          src={story.image}
                          alt={story.title}
                          className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">{story.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
            <div className="bg-white/5 dark:bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 mb-8 overflow-x-auto scrollbar-hide">
              <TabsList className="bg-transparent border-0 w-full min-w-max">
                <TabsTrigger 
                  value="posts" 
                  className="flex-1 gap-2 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300 text-xs font-bold uppercase tracking-widest"
                >
                  <LayoutGrid className="w-4 h-4" />
                  Feed
                </TabsTrigger>
                <TabsTrigger 
                  value="shared" 
                  className="flex-1 gap-2 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300 text-xs font-bold uppercase tracking-widest"
                >
                  <Share2 className="w-4 h-4" />
                  Compartidos
                </TabsTrigger>
                <TabsTrigger 
                  value="info" 
                  className="flex-1 gap-2 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300 text-xs font-bold uppercase tracking-widest"
                >
                  <Info className="w-4 h-4" />
                  Info
                </TabsTrigger>
                <TabsTrigger 
                  value="friends" 
                  className="flex-1 gap-2 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300 text-xs font-bold uppercase tracking-widest"
                >
                  <Users className="w-4 h-4" />
                  Amigos ({friendsList.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="photos" 
                  className="flex-1 gap-2 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300 text-xs font-bold uppercase tracking-widest"
                >
                  <ImageIcon className="w-4 h-4" />
                  Fotos
                </TabsTrigger>
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <TabsContent value="posts" className="space-y-8 mt-0">
                {userPosts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-8">
                    {userPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Post post={post} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="p-16 text-center border-white/5 bg-white/5 dark:bg-white/5 rounded-3xl border-dashed">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No hay publicaciones todavía</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="shared" className="space-y-8 mt-0">
                {sharedPosts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-8">
                    {sharedPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Post post={post} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="p-16 text-center border-white/5 bg-white/5 dark:bg-white/5 rounded-3xl border-dashed">
                    <Share2 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No hay publicaciones compartidas todavía</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="info" className="mt-0">
                <Card className="p-8 border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-3xl">
                  <h2 className="text-xl font-black text-white italic uppercase tracking-tight mb-8">Información Personal</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    {profileUser.bio && (
                      <InfoItem label="Acerca de" value={profileUser.bio} icon={<Info className="w-4 h-4" />} />
                    )}
                    {profileUser.location && (
                      <InfoItem label="Ubicación" value={profileUser.location} icon={<MapPin className="w-4 h-4" />} />
                    )}
                    {profileUser.website && (
                      <InfoItem label="Web" value={profileUser.website} isLink icon={<Globe className="w-4 h-4" />} />
                    )}
                    <InfoItem label="Nexly Member" value={`Se unió en ${profileUser.joinedDate}`} icon={<Calendar className="w-4 h-4" />} />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="friends" className="mt-0">
                <Card className="p-8 border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-3xl">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tight">Amigos ({friendsList.length})</h2>
                  </div>
                  {friendsList.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      {friendsList.map((friend, index) => (
                        <motion.div
                          key={friend.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 dark:bg-white/5 hover:bg-white/10 dark:bg-white/10 border border-white/5 transition-all duration-300 cursor-pointer group"
                          onClick={() => navigate(`/profile/${friend.id}`)}
                        >
                          <div className="relative">
                            {friend.avatar ? (
                              <img
                                src={friend.avatar}
                                alt={friend.name}
                                className="w-20 h-20 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-blue-500 transition-all shadow-2xl"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center ring-2 ring-white/10">
                                <span className="text-white text-2xl font-black italic">
                                  {friend.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-center min-w-0 w-full">
                            <p className="text-xs font-black text-white truncate uppercase tracking-tight group-hover:text-blue-400 transition-colors">{friend.name}</p>
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-60">Nexly Friend</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-center py-12">Sin amigos todavía</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="photos" className="mt-0">
                <Card className="p-8 border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-3xl">
                  <h2 className="text-xl font-black text-white italic uppercase tracking-tight mb-8">Galería de Fotos ({profileUser.photos})</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {userPosts
                      .filter(post => post.image)
                      .map((post, index) => (
                        <motion.div 
                          key={post.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="aspect-square rounded-2xl overflow-hidden cursor-pointer border border-white/10 shadow-xl group"
                        >
                          <img
                            src={post.image}
                            alt="Photo"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0"
                          />
                        </motion.div>
                      ))}
                  </div>
                </Card>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
          </>
        )}
      </div>

      <ProfileEditDialog
        open={profileEditOpen}
        onOpenChange={setProfileEditOpen}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
}

function InfoItem({ label, value, isLink, icon }: { label: string, value: string, isLink?: boolean, icon: React.ReactNode }) {
  return (
    <div className="space-y-2 group">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-blue-400 transition-colors">
        {icon}
        {label}
      </div>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="block text-sm font-bold text-white hover:text-blue-400 transition-colors truncate">
          {value}
        </a>
      ) : (
        <p className="text-sm font-bold text-white leading-relaxed">{value}</p>
      )}
    </div>
  );
}