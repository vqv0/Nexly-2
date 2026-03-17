import { PostData } from '../components/Post';

const DELETED_POSTS_KEY = 'nexly_deleted_posts';
const EDITED_POSTS_KEY = 'nexly_edited_posts';
const REPORTED_POSTS_KEY = 'nexly_reported_posts';

export const postsManager = {
  // Delete patterns
  deletePost: (postId: string) => {
    const deleted = postsManager.getDeletedPosts();
    if (!deleted.includes(postId)) {
      deleted.push(postId);
      localStorage.setItem(DELETED_POSTS_KEY, JSON.stringify(deleted));
      window.dispatchEvent(new CustomEvent('nexly-posts-update'));
    }
  },

  getDeletedPosts: (): string[] => {
    const stored = localStorage.getItem(DELETED_POSTS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  isDeleted: (postId: string): boolean => {
    return postsManager.getDeletedPosts().includes(postId);
  },

  // Edit patterns
  editPost: (postId: string, newContent: string) => {
    const edited = postsManager.getEditedPosts();
    edited[postId] = newContent;
    localStorage.setItem(EDITED_POSTS_KEY, JSON.stringify(edited));
    window.dispatchEvent(new CustomEvent('nexly-posts-update'));
  },

  getEditedPosts: (): Record<string, string> => {
    const stored = localStorage.getItem(EDITED_POSTS_KEY);
    return stored ? JSON.parse(stored) : {};
  },

  getEditedContent: (postId: string): string | null => {
    return postsManager.getEditedPosts()[postId] || null;
  },

  // Report patterns
  reportPost: (post: PostData, reason: string, reporterId?: string) => {
    const reported = postsManager.getReportedPosts();
    reported.push({ 
      id: Date.now().toString(),
      postId: post.id, 
      reason, 
      timestamp: new Date().toISOString(),
      reporterId,
      postSnapshot: post
    });
    localStorage.setItem(REPORTED_POSTS_KEY, JSON.stringify(reported));
    toast_internal('Publicación reportada. Nuestro equipo la revisará pronto.');
  },

  getReportedPosts: (): { 
    id: string;
    postId: string; 
    reason: string; 
    timestamp: string;
    reporterId?: string;
    postSnapshot: PostData;
  }[] => {
    const stored = localStorage.getItem(REPORTED_POSTS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  deleteReport: (reportId: string) => {
    const reported = postsManager.getReportedPosts();
    const updated = reported.filter(r => r.id !== reportId);
    localStorage.setItem(REPORTED_POSTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('nexly-reports-update'));
  }
};

// Simple internal toast helper since we can't easily import sonner here without potential circulars
function toast_internal(msg: string) {
  console.log(`[POSTS_MANAGER] ${msg}`);
  window.dispatchEvent(new CustomEvent('nexly-toast', { detail: { message: msg, type: 'success' } }));
}
