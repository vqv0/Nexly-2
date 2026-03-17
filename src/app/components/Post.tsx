import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react';
import { auth } from '../utils/auth';
import { toast } from 'sonner';

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
  const currentUser = auth.getCurrentUser();

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

  const handleShare = () => {
    setShareCount(shareCount + 1);
    toast.success('Publicación compartida');
    onUpdate?.();
  };

  const handleProfileClick = (userId?: string) => {
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-3">
          <button
            onClick={() => handleProfileClick(post.authorId)}
            className="flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            {post.avatar ? (
              <img
                src={post.avatar}
                alt={post.author}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {post.author.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </button>
          <div>
            <button
              onClick={() => handleProfileClick(post.authorId)}
              className="font-semibold hover:underline text-left"
            >
              {post.author}
            </button>
            <p className="text-xs text-gray-500">{post.timestamp}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      <p className="mb-3">{post.content}</p>

      {post.image && (
        <img
          src={post.image}
          alt="Post content"
          className="w-full rounded-lg mb-3 object-cover max-h-96"
        />
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 mb-3 pt-2 border-t">
        <span>{likeCount} Me gusta</span>
        <div className="flex gap-3">
          <button
            onClick={() => setShowComments(!showComments)}
            className="hover:underline"
          >
            {comments.length} comentarios
          </button>
          <span>{shareCount} compartidos</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 gap-2 ${liked ? 'text-red-600' : ''}`}
          onClick={handleLike}
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          Me gusta
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 gap-2"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="w-5 h-5" />
          Comentar
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 gap-2" onClick={handleShare}>
          <Share2 className="w-5 h-5" />
          Compartir
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t space-y-3">
          {/* Comment Input */}
          <div className="flex gap-2">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">
                  {currentUser?.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Escribe un comentario..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                className="flex-1"
              />
              <Button size="icon" onClick={handleComment}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Comments List */}
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <button
                onClick={() => handleProfileClick(comment.authorId)}
                className="flex-shrink-0 hover:opacity-80 transition-opacity"
              >
                {comment.avatar ? (
                  <img
                    src={comment.avatar}
                    alt={comment.author}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {comment.author.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </button>
              <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2">
                <button
                  onClick={() => handleProfileClick(comment.authorId)}
                  className="font-semibold text-sm hover:underline"
                >
                  {comment.author}
                </button>
                <p className="text-sm">{comment.content}</p>
                <p className="text-xs text-gray-500 mt-1">{comment.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}