import { getAllUsers, mockUsers, UserProfile } from './mockData';
import { auth } from './auth';

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

const FRIEND_REQUESTS_KEY = 'nexly_friend_requests';
const FRIENDS_KEY = 'nexly_friends';

// Evento custom para sincronizar estado entre componentes
export function emitFriendsUpdate() {
  window.dispatchEvent(new CustomEvent('nexly-friends-update'));
}

function getFriendRequests(): FriendRequest[] {
  try {
    const data = localStorage.getItem(FRIEND_REQUESTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveFriendRequests(requests: FriendRequest[]) {
  localStorage.setItem(FRIEND_REQUESTS_KEY, JSON.stringify(requests));
}

function getFriendsList(): Record<string, string[]> {
  try {
    const data = localStorage.getItem(FRIENDS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveFriendsList(friends: Record<string, string[]>) {
  localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
}

export const friendsManager = {
  /** Enviar solicitud de amistad */
  sendRequest(toUserId: string): { success: boolean; error?: string } {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return { success: false, error: 'No autenticado' };

    const requests = getFriendRequests();

    // Ya existe una solicitud pendiente
    const existing = requests.find(
      r =>
        r.status === 'pending' &&
        ((r.fromUserId === currentUser.id && r.toUserId === toUserId) ||
          (r.fromUserId === toUserId && r.toUserId === currentUser.id))
    );
    if (existing) return { success: false, error: 'Ya existe una solicitud pendiente' };

    // Ya son amigos
    if (this.areFriends(currentUser.id, toUserId)) {
      return { success: false, error: 'Ya son amigos' };
    }

    const request: FriendRequest = {
      id: `fr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      fromUserId: currentUser.id,
      toUserId,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };

    requests.push(request);
    saveFriendRequests(requests);
    emitFriendsUpdate();
    return { success: true };
  },

  /** Aceptar solicitud de amistad */
  acceptRequest(requestId: string): { success: boolean; error?: string } {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return { success: false, error: 'No autenticado' };

    const requests = getFriendRequests();
    const request = requests.find(r => r.id === requestId && r.toUserId === currentUser.id && r.status === 'pending');
    if (!request) return { success: false, error: 'Solicitud no encontrada' };

    request.status = 'accepted';
    saveFriendRequests(requests);

    // Agregar ambos a la lista de amigos
    const friends = getFriendsList();
    if (!friends[currentUser.id]) friends[currentUser.id] = [];
    if (!friends[request.fromUserId]) friends[request.fromUserId] = [];

    if (!friends[currentUser.id].includes(request.fromUserId)) {
      friends[currentUser.id].push(request.fromUserId);
    }
    if (!friends[request.fromUserId].includes(currentUser.id)) {
      friends[request.fromUserId].push(currentUser.id);
    }

    saveFriendsList(friends);
    emitFriendsUpdate();
    return { success: true };
  },

  /** Rechazar solicitud de amistad */
  rejectRequest(requestId: string): { success: boolean; error?: string } {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return { success: false, error: 'No autenticado' };

    const requests = getFriendRequests();
    const request = requests.find(r => r.id === requestId && r.toUserId === currentUser.id && r.status === 'pending');
    if (!request) return { success: false, error: 'Solicitud no encontrada' };

    request.status = 'rejected';
    saveFriendRequests(requests);
    emitFriendsUpdate();
    return { success: true };
  },

  /** Cancelar solicitud enviada */
  cancelRequest(toUserId: string): { success: boolean } {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return { success: false };

    const requests = getFriendRequests();
    const idx = requests.findIndex(
      r => r.fromUserId === currentUser.id && r.toUserId === toUserId && r.status === 'pending'
    );
    if (idx !== -1) {
      requests.splice(idx, 1);
      saveFriendRequests(requests);
      emitFriendsUpdate();
    }
    return { success: true };
  },

  /** Eliminar amigo */
  removeFriend(friendId: string): { success: boolean } {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return { success: false };

    const friends = getFriendsList();
    if (friends[currentUser.id]) {
      friends[currentUser.id] = friends[currentUser.id].filter(id => id !== friendId);
    }
    if (friends[friendId]) {
      friends[friendId] = friends[friendId].filter(id => id !== currentUser.id);
    }
    saveFriendsList(friends);
    emitFriendsUpdate();
    return { success: true };
  },

  /** ¿Son amigos? */
  areFriends(userId1: string, userId2: string): boolean {
    const friends = getFriendsList();
    return friends[userId1]?.includes(userId2) || false;
  },

  /** Obtener lista de amigos del usuario */
  getFriends(userId?: string): UserProfile[] {
    const currentUser = auth.getCurrentUser();
    const targetId = userId || currentUser?.id;
    if (!targetId) return [];

    const friends = getFriendsList();
    const friendIds = friends[targetId] || [];

    return friendIds
      .map(id => mockUsers[id])
      .filter((u): u is UserProfile => !!u);
  },

  /** Obtener solicitudes pendientes RECIBIDAS */
  getPendingReceived(): (FriendRequest & { fromUser?: UserProfile })[] {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return [];

    return getFriendRequests()
      .filter(r => r.toUserId === currentUser.id && r.status === 'pending')
      .map(r => ({ ...r, fromUser: mockUsers[r.fromUserId] }));
  },

  /** Obtener solicitudes pendientes ENVIADAS */
  getPendingSent(): FriendRequest[] {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return [];

    return getFriendRequests()
      .filter(r => r.fromUserId === currentUser.id && r.status === 'pending');
  },

  /** Estado de relación con otro usuario */
  getRelationshipStatus(otherUserId: string): 'none' | 'friends' | 'pending_sent' | 'pending_received' {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return 'none';

    if (this.areFriends(currentUser.id, otherUserId)) return 'friends';

    const requests = getFriendRequests();
    const pendingSent = requests.find(
      r => r.fromUserId === currentUser.id && r.toUserId === otherUserId && r.status === 'pending'
    );
    if (pendingSent) return 'pending_sent';

    const pendingReceived = requests.find(
      r => r.fromUserId === otherUserId && r.toUserId === currentUser.id && r.status === 'pending'
    );
    if (pendingReceived) return 'pending_received';

    return 'none';
  },

  /** Obtener la solicitud pendiente recibida de un usuario */
  getPendingRequestFrom(fromUserId: string): FriendRequest | undefined {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return undefined;

    return getFriendRequests().find(
      r => r.fromUserId === fromUserId && r.toUserId === currentUser.id && r.status === 'pending'
    );
  },

  /** Obtener sugerencias de amigos (usuarios que no son amigos ni tienen solicitud pendiente) */
  getSuggestions(): (UserProfile & { mutualFriends: number })[] {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return [];

    const allUsers = getAllUsers();
    const friends = getFriendsList();
    const myFriends = friends[currentUser.id] || [];
    const requests = getFriendRequests();

    return allUsers
      .filter(user => {
        if (user.id === currentUser.id) return false;
        if (myFriends.includes(user.id)) return false;
        // Excluir si ya hay solicitud pendiente
        const hasPending = requests.some(
          r =>
            r.status === 'pending' &&
            ((r.fromUserId === currentUser.id && r.toUserId === user.id) ||
              (r.fromUserId === user.id && r.toUserId === currentUser.id))
        );
        return !hasPending;
      })
      .map(user => {
        // Calcular amigos en común
        const theirFriends = friends[user.id] || user.friends || [];
        const mutualFriends = myFriends.filter(f => theirFriends.includes(f)).length;
        return { ...user, mutualFriends };
      });
  },

  /** Número total de solicitudes pendientes recibidas */
  getPendingCount(): number {
    return this.getPendingReceived().length;
  },
};
