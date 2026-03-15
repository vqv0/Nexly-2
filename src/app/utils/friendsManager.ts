import { auth, db } from './firebase';
import { ref, set, get, update, remove, onValue, push } from 'firebase/database';
import { UserProfile } from './mockData';

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

// Evento custom para sincronizar estado entre componentes UI si es necesario
// aunque con Firebase onValue ya se actualiza solo, lo dejamos por compatibilidad
export function emitFriendsUpdate() {
  window.dispatchEvent(new CustomEvent('nexly-friends-update'));
}

export const friendsManager = {
  /** Enviar solicitud de amistad */
  sendRequest: async (toUserId: string): Promise<{ success: boolean; error?: string }> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, error: 'No autenticado' };

    try {
      // Verificar si ya son amigos
      const areFriendsSnapshot = await get(ref(db, `friends/${currentUser.uid}/${toUserId}`));
      if (areFriendsSnapshot.exists() && areFriendsSnapshot.val() === true) {
        return { success: false, error: 'Ya son amigos' };
      }

      // Buscar si ya hay una solicitud pendiente entre ellos
      const requestsRef = ref(db, 'friendRequests');
      const snapshot = await get(requestsRef);
      if (snapshot.exists()) {
        const requests = snapshot.val();
        const existing = Object.values(requests).find((r: any) => 
          r.status === 'pending' &&
          ((r.fromUserId === currentUser.uid && r.toUserId === toUserId) ||
           (r.fromUserId === toUserId && r.toUserId === currentUser.uid))
        );
        if (existing) return { success: false, error: 'Ya existe una solicitud pendiente' };
      }

      // Crear nueva solicitud
      const newRequestRef = push(ref(db, 'friendRequests'));
      const request: FriendRequest = {
        id: newRequestRef.key as string,
        fromUserId: currentUser.uid,
        toUserId,
        status: 'pending',
        timestamp: new Date().toISOString(),
      };

      await set(newRequestRef, request);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /** Aceptar solicitud de amistad */
  acceptRequest: async (requestId: string): Promise<{ success: boolean; error?: string }> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, error: 'No autenticado' };

    try {
      const requestRef = ref(db, `friendRequests/${requestId}`);
      const snapshot = await get(requestRef);
      
      if (!snapshot.exists()) return { success: false, error: 'Solicitud no encontrada' };
      
      const request = snapshot.val() as FriendRequest;
      if (request.toUserId !== currentUser.uid || request.status !== 'pending') {
         return { success: false, error: 'Solicitud no válida' };
      }

      // Actualizar estado de la solicitud
      await update(requestRef, { status: 'accepted' });

      // Agregarse mutuamente
      await set(ref(db, `friends/${currentUser.uid}/${request.fromUserId}`), true);
      await set(ref(db, `friends/${request.fromUserId}/${currentUser.uid}`), true);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /** Rechazar solicitud de amistad */
  rejectRequest: async (requestId: string): Promise<{ success: boolean; error?: string }> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, error: 'No autenticado' };

    try {
      const requestRef = ref(db, `friendRequests/${requestId}`);
      const snapshot = await get(requestRef);
      
      if (!snapshot.exists()) return { success: false, error: 'Solicitud no encontrada' };
      
      const request = snapshot.val() as FriendRequest;
      if (request.toUserId !== currentUser.uid || request.status !== 'pending') {
         return { success: false, error: 'Solicitud no válida' };
      }

      await update(requestRef, { status: 'rejected' });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /** Cancelar solicitud enviada */
  cancelRequest: async (toUserId: string): Promise<{ success: boolean; error?: string }> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, error: 'No autenticado' };

    try {
      const requestsRef = ref(db, 'friendRequests');
      const snapshot = await get(requestsRef);
      if (snapshot.exists()) {
        const requests = snapshot.val();
        const requestEntry = Object.entries(requests).find(([_, r]: [string, any]) => 
          r.fromUserId === currentUser.uid && r.toUserId === toUserId && r.status === 'pending'
        );
        
        if (requestEntry) {
          await remove(ref(db, `friendRequests/${requestEntry[0]}`));
          return { success: true };
        }
      }
      return { success: false, error: 'Solicitud no encontrada' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /** Eliminar amigo */
  removeFriend: async (friendId: string): Promise<{ success: boolean; error?: string }> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, error: 'No autenticado' };

    try {
      await remove(ref(db, `friends/${currentUser.uid}/${friendId}`));
      await remove(ref(db, `friends/${friendId}/${currentUser.uid}`));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /** ¿Son amigos? */
  areFriends: async (userId1: string, userId2: string): Promise<boolean> => {
    try {
      const snapshot = await get(ref(db, `friends/${userId1}/${userId2}`));
      return snapshot.exists() && snapshot.val() === true;
    } catch {
      return false;
    }
  },

  /** Listen to friends list */
  listenToFriends: (userId: string, callback: (friendIds: string[]) => void): () => void => {
    const friendsRef = ref(db, `friends/${userId}`);
    return onValue(friendsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(Object.keys(data).filter(key => data[key] === true));
      } else {
        callback([]);
      }
    });
  },

  /** Listen to pending requests received */
  listenToPendingReceived: (userId: string, callback: (requests: FriendRequest[]) => void): () => void => {
    const requestsRef = ref(db, 'friendRequests');
    return onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const pending = Object.values(data).filter((r: any) => 
          r.toUserId === userId && r.status === 'pending'
        ) as FriendRequest[];
        callback(pending);
      } else {
        callback([]);
      }
    });
  },

  /** Listen to pending requests sent */
  listenToPendingSent: (userId: string, callback: (requests: FriendRequest[]) => void): () => void => {
    const requestsRef = ref(db, 'friendRequests');
    return onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const pending = Object.values(data).filter((r: any) => 
          r.fromUserId === userId && r.status === 'pending'
        ) as FriendRequest[];
        callback(pending);
      } else {
        callback([]);
      }
    });
  },

  // Maintain backward compat names for local sync variables if needed by UI
  getPendingCount: (): number => {
    // This is synchronous, so it might not be accurate unless we wait for state.
    // UI should refer to the local state fetched by the listeners instead.
    return 0; 
  }
};
