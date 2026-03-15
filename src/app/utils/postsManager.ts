import { auth, db } from './firebase';
import { ref, set, get, update, remove, push, onValue, query, orderByChild } from 'firebase/database';
import { PostData, Comment } from '../components/Post';

export const postsManager = {
  /** Crear una nueva publicación */
  createPost: async (content: string, image?: string): Promise<{ success: boolean; error?: string; postId?: string }> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, error: 'No autenticado' };

    try {
      // Necesitamos el perfil para guardar el author name/avatar
      const userRef = ref(db, `users/${currentUser.uid}`);
      const snapshot = await get(userRef);
      const userData = snapshot.val();

      const newPostRef = push(ref(db, 'posts'));
      const post: PostData = {
        id: newPostRef.key as string,
        author: userData?.name || 'Usuario',
        authorId: currentUser.uid,
        avatar: userData?.avatar,
        content,
        image,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: [], // Firebase RTDB a menudo omite arrays vacíos, lo manejaremos al leer
        shares: 0,
      };

      await set(newPostRef, post);
      return { success: true, postId: post.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /** Eliminar una publicación */
  deletePost: async (postId: string): Promise<{ success: boolean; error?: string }> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, error: 'No autenticado' };

    try {
      const postRef = ref(db, `posts/${postId}`);
      await remove(postRef);
      // Removemos los likes/reports asocidados para no ensuciar, o los dejamos huérfanos. 
      // Por simplicidad eliminamos el nodo del post.
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /** Editar el contenido de una publicación */
  editPost: async (postId: string, newContent: string): Promise<{ success: boolean; error?: string }> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, error: 'No autenticado' };

    try {
      const postRef = ref(db, `posts/${postId}`);
      await update(postRef, { content: newContent });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /** Reportar una publicación */
  reportPost: async (post: PostData, reason: string): Promise<{ success: boolean; error?: string }> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, error: 'No autenticado' };

    try {
      const newReportRef = push(ref(db, 'reports'));
      const report = {
        id: newReportRef.key as string,
        postId: post.id,
        reason,
        timestamp: new Date().toISOString(),
        reporterId: currentUser.uid,
        postSnapshot: post
      };

      await set(newReportRef, report);
      toast_internal('Publicación reportada. Nuestro equipo la revisará pronto.');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /** Toggle Like on a Post */
  toggleLike: async (postId: string): Promise<{ success: boolean; error?: string }> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, error: 'No autenticado' };

    try {
      const likeRef = ref(db, `postLikes/${postId}/${currentUser.uid}`);
      const snapshot = await get(likeRef);
      
      const postRef = ref(db, `posts/${postId}`);
      const postSnap = await get(postRef);
      if (!postSnap.exists()) return { success: false, error: 'La publicación ya no existe' };

      let currentLikes = postSnap.val().likes || 0;

      if (snapshot.exists()) {
        // Un-like
        await remove(likeRef);
        await update(postRef, { likes: Math.max(0, currentLikes - 1) });
      } else {
        // Like
        await set(likeRef, true);
        await update(postRef, { likes: currentLikes + 1 });
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /** Add a comment */
  addComment: async (postId: string, content: string): Promise<{ success: boolean; error?: string }> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, error: 'No autenticado' };

    try {
      const userRef = ref(db, `users/${currentUser.uid}`);
      const snapshot = await get(userRef);
      const userData = snapshot.val();

      const newCommentRef = push(ref(db, `postComments/${postId}`));
      const comment: Comment = {
        id: newCommentRef.key as string,
        author: userData?.name || 'Usuario',
        authorId: currentUser.uid,
        avatar: userData?.avatar,
        content,
        timestamp: new Date().toISOString()
      };

      await set(newCommentRef, comment);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /** Delete a comment */
  deleteComment: async (postId: string, commentId: string): Promise<{ success: boolean; error?: string }> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, error: 'No autenticado' };

    try {
      await remove(ref(db, `postComments/${postId}/${commentId}`));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /** Edit a comment */
  editComment: async (postId: string, commentId: string, newContent: string): Promise<{ success: boolean; error?: string }> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, error: 'No autenticado' };

    try {
      await update(ref(db, `postComments/${postId}/${commentId}`), { content: newContent });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /** Listen to all posts */
  listenToPosts: (callback: (posts: PostData[]) => void): () => void => {
    const postsRef = ref(db, 'posts');
    return onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert to array and sort by timestamp desc (newest first)
        const postsArray = Object.values(data) as PostData[];
        postsArray.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        callback(postsArray);
      } else {
        callback([]);
      }
    });
  },

  /** Share post */
  sharePost: async (postToShare: PostData): Promise<{ success: boolean; error?: string }> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, error: 'No autenticado' };

    try {
      const userRef = ref(db, `users/${currentUser.uid}`);
      const userSnap = await get(userRef);
      const userData = userSnap.val();

      const newPostRef = push(ref(db, 'posts'));
      const post: PostData = {
        ...postToShare,
        id: newPostRef.key as string,
        isShared: true,
        sharedBy: currentUser.uid,
        sharedByAvatar: userData?.avatar,
        sharedTimestamp: new Date().toISOString(),
        comments: [],
        likes: 0,
        shares: 0,
      };

      await set(newPostRef, post);

      // Increment original post share count
      const originalRef = ref(db, `posts/${postToShare.id}`);
      const originalSnap = await get(originalRef);
      if (originalSnap.exists()) {
        const currentShares = originalSnap.val().shares || 0;
        await update(originalRef, { shares: currentShares + 1 });
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Functions specific strictly to listeners / checks
  listenToPostLikes: (postId: string, callback: (likesMap: Record<string, boolean>) => void): () => void => {
    return onValue(ref(db, `postLikes/${postId}`), (snap) => {
      callback(snap.val() || {});
    });
  },

  listenToPostComments: (postId: string, callback: (comments: Comment[]) => void): () => void => {
    return onValue(ref(db, `postComments/${postId}`), (snap) => {
      const commentsMap = snap.val();
      if (commentsMap) {
        const comments = Object.values(commentsMap) as Comment[];
        comments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        callback(comments);
      } else {
        callback([]);
      }
    });
  },

  // Helper properties for legacy code that checks synchronously (to avoid crashing before full refactor)
  isDeleted: () => false,
  getEditedContent: () => null,
  getDeletedPosts: () => [],
};

function toast_internal(msg: string) {
  window.dispatchEvent(new CustomEvent('nexly-toast', { detail: { message: msg, type: 'success' } }));
}
