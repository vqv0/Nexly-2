
const BLOCKED_USERS_KEY = 'nexly_blocked_users';
const REPORTED_USERS_KEY = 'nexly_reported_users';

export const usersManager = {
  blockUser: (userId: string) => {
    const blocked = usersManager.getBlockedUsers();
    if (!blocked.includes(userId)) {
      blocked.push(userId);
      localStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(blocked));
      window.dispatchEvent(new CustomEvent('nexly-users-update'));
    }
  },

  unblockUser: (userId: string) => {
    const blocked = usersManager.getBlockedUsers();
    const filtered = blocked.filter(id => id !== userId);
    localStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('nexly-users-update'));
  },

  getBlockedUsers: (): string[] => {
    const stored = localStorage.getItem(BLOCKED_USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  isBlocked: (userId: string): boolean => {
    return usersManager.getBlockedUsers().includes(userId);
  },

  reportUser: (userId: string, reason: string) => {
    const reported = usersManager.getReportedUsers();
    reported.push({ userId, reason, timestamp: new Date().toISOString() });
    localStorage.setItem(REPORTED_USERS_KEY, JSON.stringify(reported));
  },

  getReportedUsers: (): { userId: string; reason: string; timestamp: string }[] => {
    const stored = localStorage.getItem(REPORTED_USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  }
};
