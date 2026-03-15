import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Pencil, Trash2, Check, X, AlertOctagon } from 'lucide-react';
import { auth } from '../utils/auth';
import { postsManager } from '../utils/postsManager';
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
        // Recarga automática como pidió el usuario
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
      initial={{ opacity: 1, scale: 1 }}
      animate={isDeleting ? { opacity: 0, scale: 0.95, height: 0, marginTop: 0, marginBottom: 0, padding: 0 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mb-6"
    >
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl">
      <div className="p-4">
        {/* Shared by header */}
        {post.isShared && (
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-blue-400 mb-4 pb-3 border-b border-white/5">
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartido por ti {post.sharedTimestamp && `· ${post.sharedTimestamp}`}</span>
          </div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-3">
            <button
              onClick={() => handleProfileClick(post.authorId)}
              className="flex-shrink-0 hover:scale-105 transition-transform"
            >
              {post.avatar ? (
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-white/5 shadow-inner"
                />
              ) : (
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-white/5 shadow-inner">
                  <span className="text-white font-black text-lg uppercase tracking-tighter">
                    {post.author.charAt(0)}
                  </span>
                </div>
              )}
            </button>
            <div className="flex flex-col justify-center">
              <button
                onClick={() => handleProfileClick(post.authorId)}
                className="font-bold text-white hover:text-blue-400 transition-colors text-left"
              >
                {post.author}
              </button>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{post.timestamp}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white hover:bg-white/5 rounded-full">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0a0a0a]/95 backdrop-blur-3xl border-white/10 text-white rounded-xl shadow-2xl min-w-[160px]">
              {currentUser && post.authorId === currentUser.id ? (
                <>
                  <DropdownMenuItem 
                    onSelect={() => setIsEditingPost(true)}
                    className="gap-2 cursor-pointer font-bold text-xs hover:bg-white/5 py-2.5"
                  >
                    <Pencil className="w-4 h-4 text-blue-400" /> Editar publicación
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onSelect={handleDeletePost}
                    className="gap-2 cursor-pointer font-bold text-xs text-red-500 hover:bg-red-500/10 py-2.5"
                  >
                    <Trash2 className="w-4 h-4" /> Eliminar publicación
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem 
                    onSelect={() => navigate('/messages')}
                    className="gap-2 cursor-pointer font-bold text-xs hover:bg-white/5 py-2.5"
                  >
                    <Send className="w-4 h-4 text-blue-400" /> Enviar mensaje
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onSelect={handleReportPost}
                    className="gap-2 cursor-pointer font-bold text-xs text-orange-500 hover:bg-orange-500/10 py-2.5"
                  >
                    <AlertOctagon className="w-4 h-4" /> Reportar publicación
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isEditingPost ? (
          <div className="space-y-3 mb-4">
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px] resize-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setIsEditingPost(false);
                  setPostContent(postsManager.getEditedContent(post.id) || post.content);
                }}
                className="text-gray-400 hover:text-white"
              >
                Cancelar
              </Button>
              <Button 
                size="sm" 
                onClick={handleEditPost}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4"
              >
                Guardar cambios
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-200 leading-relaxed mb-4">{postContent}</p>
        )}

        {post.image && (
          <div className="relative group rounded-xl overflow-hidden mb-4 border border-white/5 shadow-inner">
            <img
              src={post.image}
              alt="Post content"
              className="w-full object-cover max-h-[500px] transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center ring-2 ring-[#050505]">
                <Heart className="w-2 h-2 text-white fill-current" />
              </div>
            </div>
            <span>{likeCount} Me gusta</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowComments(!showComments)}
              className="hover:text-blue-400 transition-colors"
            >
              {comments.length} comentarios
            </button>
            <span>{shareCount} compartidos</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <ActionButton 
            icon={<Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />} 
            label="Me gusta" 
            active={liked} 
            activeClass="text-red-500 hover:bg-red-500/10"
            onClick={handleLike} 
          />
          <ActionButton 
            icon={<MessageCircle className="w-5 h-5" />} 
            label="Comentar" 
            onClick={() => setShowComments(!showComments)} 
          />
          <ActionButton 
            icon={<Share2 className="w-5 h-5" />} 
            label="Compartir" 
            onClick={handleShare} 
          />
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                {/* Comment Input */}
                <div className="flex gap-3">
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center ring-1 ring-white/10 text-white font-bold text-xs shadow-lg">
                      {currentUser?.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Comentar algo..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                      className="flex-1 bg-white/5 border-white/10 text-white text-xs h-9 rounded-xl focus:ring-blue-500/20"
                    />
                    <Button size="icon" onClick={handleComment} className="w-9 h-9 bg-blue-600 hover:bg-blue-500 rounded-xl">
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                  {comments.map((comment, index) => (
                    <motion.div 
                      key={comment.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-3"
                    >
                      <button
                        onClick={() => handleProfileClick(comment.authorId)}
                        className="flex-shrink-0 hover:scale-110 transition-transform"
                      >
                        {comment.avatar ? (
                          <img
                            src={comment.avatar}
                            alt={comment.author}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-white/5"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center ring-1 ring-white/5 text-white font-bold text-xs">
                            {comment.author.charAt(0)}
                          </div>
                        )}
                      </button>
                      <div className="flex-1 bg-white/5 hover:bg-white-[8%] transition-colors rounded-2xl px-3.5 py-2.5 relative group/comment border border-white/5">
                        <div className="flex items-center justify-between mb-0.5">
                          <button
                            onClick={() => handleProfileClick(comment.authorId)}
                            className="font-bold text-xs text-white hover:text-blue-400"
                          >
                            {comment.author}
                          </button>
                          
                          {currentUser && comment.authorId === currentUser.id && editingCommentId !== comment.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-6 h-6 p-0 hover:bg-white/10 rounded-full">
                                  <MoreHorizontal className="w-3.5 h-3.5 text-gray-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-[#0a0a0a]/95 backdrop-blur-3xl border-white/10 text-white rounded-xl shadow-2xl">
                                <DropdownMenuItem onSelect={() => handleStartEdit(comment)} className="gap-2 cursor-pointer text-xs font-bold hover:bg-white/5">
                                  <Pencil className="w-3 h-3" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => handleDeleteComment(comment.id)}
                                  className="gap-2 cursor-pointer text-xs font-bold text-red-500 hover:bg-red-500/10 focus:text-red-500"
                                >
                                  <Trash2 className="w-3 h-3" /> Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>

                        {editingCommentId === comment.id ? (
                          <div className="flex gap-2 mt-2">
                            <Input
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(comment.id);
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                              className="flex-1 h-8 text-xs bg-black/40 border-white/10 rounded-xl"
                              autoFocus
                            />
                            <div className="flex gap-1">
                              <Button size="icon" className="w-8 h-8 bg-blue-600 hover:bg-blue-500 rounded-lg" onClick={() => handleSaveEdit(comment.id)}>
                                <Check className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="w-8 h-8 text-gray-400 hover:text-white rounded-lg" onClick={handleCancelEdit}>
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs text-gray-300 leading-normal">{comment.content}</p>
                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-2">{comment.timestamp}</p>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
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
      className={`flex-1 gap-2.5 rounded-xl transition-all duration-300 font-bold text-xs h-10 ${
        active 
          ? (activeClass || 'text-blue-500 bg-blue-500/10') 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
      onClick={onClick}
    >
      <span className={`${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}