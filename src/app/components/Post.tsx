import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Pencil, Trash2, Check, X, AlertOctagon } from 'lucide-react';
import { auth } from '../utils/auth';
import { postsManager } from '../utils/postsManager';
import { getUserProfile } from '../utils/mockData';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { motion, AnimatePresence } from 'motion/react';

export interface Comment {
  id: string;
  author: string;
  authorId?: string;
  avatar?: string;
  content: string;
  timestamp: string;
}

export interface PostData {
  id: string;
  author: string;
  authorId?: string;
  avatar?: string;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  shares: number;
  isShared?: boolean;
  sharedBy?: string;
  sharedByAvatar?: string;
  sharedTimestamp?: string;
}

const SHARED_POSTS_KEY = 'nexly_shared_posts';

export function getSharedPosts(userId?: string): PostData[] {
  try {
    const data = localStorage.getItem(SHARED_POSTS_KEY);
    const all: PostData[] = data ? JSON.parse(data) : [];
    if (userId) {
      return all.filter(p => p.sharedBy === userId);
    }
    return all;
  } catch {
    return [];
  }
}

function saveSharedPost(post: PostData) {
  const shared = getSharedPosts();
  shared.unshift(post);
  localStorage.setItem(SHARED_POSTS_KEY, JSON.stringify(shared));
  window.dispatchEvent(new CustomEvent('nexly-shared-update'));
}

interface PostProps {
  post: PostData;
  onUpdate?: () => void;
}

export function Post({ post, onUpdate }: PostProps) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [shareCount, setShareCount] = useState(post.shares);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isDeleted, setIsDeleted] = useState(postsManager.isDeleted(post.id));
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [postContent, setPostContent] = useState(postsManager.getEditedContent(post.id) || post.content);
  const currentUser = auth.getCurrentUser();

  useEffect(() => {
    setPostContent(postsManager.getEditedContent(post.id) || post.content);
  }, [post.content, post.id]);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const handleComment = () => {
    if (!commentText.trim() || !currentUser) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: currentUser.name,
      authorId: currentUser.id,
      avatar: currentUser.avatar,
      content: commentText,
      timestamp: 'Ahora',
    };

    setComments([...comments, newComment]);
    setCommentText('');
    toast.success('Comentario publicado');
    onUpdate?.();
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter((c: Comment) => c.id !== commentId));
    toast.success('Comentario eliminado');
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.content);
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editingText.trim()) return;
    setComments(comments.map((c: Comment) =>
      c.id === commentId ? { ...c, content: editingText } : c
    ));
    setEditingCommentId(null);
    setEditingText('');
    toast.success('Comentario editado');
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  const handleShare = () => {
    if (!currentUser) return;

    const sharedPost: PostData = {
      ...post,
      id: `shared_${Date.now()}`,
      isShared: true,
      sharedBy: currentUser.id,
      sharedByAvatar: currentUser.avatar,
      sharedTimestamp: 'Justo ahora',
      comments: [],
      likes: 0,
      shares: 0,
    };

    saveSharedPost(sharedPost);
    setShareCount(shareCount + 1);
    toast.success('Publicación compartida en tu perfil');
    onUpdate?.();
  };

  const handleProfileClick = (userId?: string) => {
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  const handleDeletePost = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      setIsDeleting(true);
      toast.success('Eliminando publicación...');
      
      setTimeout(() => {
        postsManager.deletePost(post.id);
        setIsDeleted(true);
        window.location.reload();
      }, 500);
    }
  };

  const handleEditPost = () => {
    if (!postContent.trim()) return;
    postsManager.editPost(post.id, postContent);
    setIsEditingPost(false);
    toast.success('Publicación actualizada');
    onUpdate?.();
  };

  const handleReportPost = () => {
    const reason = window.prompt('¿Por qué quieres reportar esta publicación?');
    if (reason) {
      postsManager.reportPost(post, reason, currentUser?.id);
      toast.success('Reporte enviado');
    }
  };

  if (isDeleted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isDeleting ? { opacity: 0, scale: 0.9, filter: 'blur(10px)' } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8"
    >
      <div className="glass-effect rounded-[32px] overflow-hidden shadow-2xl smooth-transition group/post border-white/[0.03]">
        <div className="p-6">
          {post.isShared && (
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black text-blue-400/80 mb-6 pb-4 border-b border-white/[0.05]">
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartido por ti {post.sharedTimestamp && `· ${post.sharedTimestamp}`}</span>
            </div>
          )}

          <div className="flex items-start justify-between mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => handleProfileClick(post.authorId)}
                className="flex-shrink-0 hover:scale-105 transition-transform"
              >
                {(() => {
                  const userProfile = post.authorId ? getUserProfile(post.authorId) : null;
                  const displayAvatar = userProfile?.avatar || post.avatar;
                  
                  return displayAvatar ? (
                    <img
                      src={displayAvatar}
                      alt={post.author}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/5 shadow-xl"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center ring-2 ring-white/5 text-white font-black text-xl">
                      {post.author.charAt(0)}
                    </div>
                  );
                })()}
              </button>
              <div className="flex flex-col justify-center">
                <button
                  onClick={() => handleProfileClick(post.authorId)}
                  className="font-black text-white hover:text-blue-400 transition-colors text-left tracking-tight"
                >
                  {post.author}
                </button>
                <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em]">{post.timestamp}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white/20 hover:text-white hover:bg-white/5 dark:bg-white/5 rounded-full w-10 h-10">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#0a0a0a]/95 backdrop-blur-3xl border-white/10 text-white rounded-2xl shadow-2xl min-w-[180px]">
                {currentUser && post.authorId === currentUser.id ? (
                  <>
                    <DropdownMenuItem 
                      onSelect={() => setIsEditingPost(true)}
                      className="gap-3 cursor-pointer p-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 dark:bg-white/5"
                    >
                      <Pencil className="w-4 h-4 text-blue-400" /> Editar Post
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onSelect={handleDeletePost}
                      className="gap-3 cursor-pointer p-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" /> Eliminar Post
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem 
                      onSelect={() => navigate('/messages')}
                      className="gap-3 cursor-pointer p-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 dark:bg-white/5"
                    >
                      <Send className="w-4 h-4 text-blue-400" /> Mensaje
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onSelect={handleReportPost}
                      className="gap-3 cursor-pointer p-3 text-[10px] font-black uppercase tracking-widest text-orange-500 hover:bg-orange-500/10"
                    >
                      <AlertOctagon className="w-4 h-4" /> Reportar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isEditingPost ? (
            <div className="space-y-4 mb-6">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full bg-white/5 dark:bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-md font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 min-h-[120px] resize-none"
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditingPost(false)}
                  className="text-white/40 hover:text-white font-bold uppercase tracking-widest text-[10px]"
                >
                  Cancelar
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleEditPost}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 rounded-xl text-[10px] uppercase tracking-widest"
                >
                  Guardar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-white/90 leading-relaxed mb-6 font-medium text-lg tracking-tight">{postContent}</p>
          )}

          {post.image && (
            <div className="relative group rounded-3xl overflow-hidden mb-6 border border-white/5 shadow-2xl">
              <img
                src={post.image}
                alt="Post content"
                className="w-full object-cover max-h-[600px] transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}

          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-5 pt-5 border-t border-white/[0.05]">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Heart className="w-2.5 h-2.5 text-white fill-current" />
              </div>
              <span className="text-white/60">{likeCount} Likes</span>
            </div>
            <div className="flex gap-6">
              <button onClick={() => setShowComments(!showComments)} className="hover:text-blue-400 transition-colors">
                {comments.length} Comentarios
              </button>
              <span>{shareCount} Shares</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <ActionButton 
              icon={<Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : 'text-white/40 group-hover:text-white'}`} />} 
              label="Like" 
              active={liked} 
              activeClass="text-red-500 bg-red-500/5 shadow-inner"
              onClick={handleLike} 
            />
            <ActionButton 
              icon={<MessageCircle className="w-5 h-5 text-white/40 group-hover:text-white" />} 
              label="Comment" 
              onClick={() => setShowComments(!showComments)} 
            />
            <ActionButton 
              icon={<Share2 className="w-5 h-5 text-white/40 group-hover:text-white" />} 
              label="Share" 
              onClick={handleShare} 
            />
          </div>

          <AnimatePresence>
            {showComments && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-8 pt-8 border-t border-white/[0.05] space-y-6">
                  <div className="flex gap-4">
                    <img
                      src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt="Me"
                      className="w-10 h-10 rounded-2xl object-cover border border-white/10 shadow-lg"
                    />
                    <div className="flex-1 flex gap-3">
                      <Input
                        placeholder="Escribe algo increíble..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                        className="flex-1 bg-white/5 dark:bg-white/5 border-white/10 text-white text-sm h-11 rounded-2xl focus:ring-blue-500/10 placeholder:text-white/20"
                      />
                      <Button size="icon" onClick={handleComment} className="w-11 h-11 bg-blue-600 hover:bg-blue-500 rounded-2xl shadow-lg shadow-blue-600/20">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                    {comments.map((comment, index) => {
                      // Dynamically fetch the latest user profile to ensure avatar is always up-to-date
                      const userProfile = comment.authorId ? getUserProfile(comment.authorId) : null;
                      const displayAvatar = userProfile?.avatar || comment.avatar || 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100';
                      
                      return (
                      <motion.div 
                        key={comment.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-4"
                      >
                        <button onClick={() => handleProfileClick(comment.authorId)} className="flex-shrink-0 hover:scale-110 transition-transform">
                          <img
                            src={displayAvatar}
                            alt={comment.author}
                            className="w-9 h-9 rounded-2xl object-cover ring-1 ring-white/10 shadow-lg"
                          />
                        </button>
                        <div className="flex-1 bg-white/5 dark:bg-white/5 hover:bg-white/[0.07] transition-colors rounded-3xl p-4 border border-white/10 relative group/comment shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <button onClick={() => handleProfileClick(comment.authorId)} className="font-black text-[11px] text-white hover:text-blue-400 uppercase tracking-wider">
                              {comment.author}
                            </button>
                            {currentUser && comment.authorId === currentUser.id && editingCommentId !== comment.id && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="opacity-0 group-hover/comment:opacity-100 transition-opacity p-1 hover:bg-white/10 dark:bg-white/10 rounded-full">
                                    <MoreHorizontal className="w-3.5 h-3.5 text-white/30" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-[#0a0a0a]/95 backdrop-blur-3xl border-white/10 text-white rounded-2xl shadow-2xl">
                                  <DropdownMenuItem onSelect={() => handleStartEdit(comment)} className="gap-3 cursor-pointer p-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 dark:bg-white/5">
                                    <Pencil className="w-3.5 h-3.5" /> Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => handleDeleteComment(comment.id)} className="gap-3 cursor-pointer p-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10">
                                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          {editingCommentId === comment.id ? (
                            <div className="flex gap-2">
                              <Input
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="flex-1 h-9 text-xs bg-black/40 border-white/10 rounded-xl"
                                autoFocus
                              />
                              <Button size="icon" className="w-9 h-9 bg-blue-600 rounded-xl" onClick={() => handleSaveEdit(comment.id)}>
                                <Check className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm text-white/70 leading-relaxed font-medium">{comment.content}</p>
                              <p className="text-[8px] text-white/20 font-black uppercase tracking-widest mt-2">{comment.timestamp}</p>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )})}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function ActionButton({ icon, label, active, activeClass, onClick }: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean, 
  activeClass?: string,
  onClick?: () => void 
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`flex-1 gap-3 rounded-[20px] transition-all duration-300 font-black text-[10px] uppercase tracking-[0.1em] h-12 shadow-sm ${
        active 
          ? (activeClass || 'text-blue-500 bg-blue-500/10 shadow-inner') 
          : 'text-white/40 hover:text-white hover:bg-white/5 dark:bg-white/5 active:scale-95'
      } group`}
      onClick={onClick}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}