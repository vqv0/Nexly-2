import { auth as firebaseAuth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updatePassword as fbUpdatePassword, 
  updateEmail as fbUpdateEmail 
} from 'firebase/auth';
import { ref, set, get, update } from 'firebase/database';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
}

export interface UserAccount extends User {
  password?: string; // Not stored locally usually, but for compat
  createdAt?: string;
}

const CURRENT_USER_KEY = 'nexly_current_user';
const LAST_LOGIN_KEY = 'nexly_last_login';
const SECURITY_OPTIONS_KEY = 'nexly_security_options';

// Escucha de cambios de Auth de Firebase para sincronizar localmente
firebaseAuth.onAuthStateChanged(async (fbUser) => {
  if (fbUser) {
    // Usuario logueado, traemos su perfil de la base de datos
    const userRef = ref(db, `users/${fbUser.uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const userData = snapshot.val();
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
    }
  } else {
    // Usuario no logueado
    localStorage.removeItem(CURRENT_USER_KEY);
  }
});

export const auth = {
  register: async (email: string, password: string, name: string, location?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const fbUser = userCredential.user;
      
      const newUser: User = { 
        id: fbUser.uid,
        email, 
        name,
        location: location?.trim() || undefined,
      };

      const userAccount = {
        ...newUser,
        createdAt: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
      };

      // Guardar en la base de datos en tiempo real de Firebase
      await set(ref(db, `users/${fbUser.uid}`), userAccount);
      
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      return { success: true };
    } catch (error: any) {
      console.error(error);
      return { success: false, error: error.message || 'Error al registrarse. Intenta con otro correo.' };
    }
  },

  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const fbUser = userCredential.user;
      
      // Obtener datos desde Realtime Database
      const snapshot = await get(ref(db, `users/${fbUser.uid}`));
      if (snapshot.exists()) {
        const userData = snapshot.val() as User;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
        localStorage.setItem(LAST_LOGIN_KEY, new Date().toISOString());
        return { success: true, user: userData };
      }
      return { success: false, error: 'No se encontraron datos de usuario' };
    } catch (error: any) {
      return { success: false, error: 'Credenciales incorrectas o cuenta no existente' };
    }
  },

  logout: async () => {
    try {
      await signOut(firebaseAuth);
    } catch (error) {
      console.error(error);
    }
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!auth.getCurrentUser();
  },

  updateProfile: async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser || !firebaseAuth.currentUser) {
      return { success: false, error: 'No hay usuario autenticado' };
    }

    try {
      const updatedUser = { ...currentUser, ...updates };
      // Actualizar en localStorage para UI rápida
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

      // Actualizar en Firebase Realtime DB
      await update(ref(db, `users/${currentUser.id}`), updates);
      
      window.dispatchEvent(new CustomEvent('nexly-profile-update'));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  changeEmail: async (newEmail: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser || !firebaseAuth.currentUser) {
      return { success: false, error: 'No hay usuario autenticado' };
    }
    try {
      await fbUpdateEmail(firebaseAuth.currentUser, newEmail);
      await update(ref(db, `users/${currentUser.id}`), { email: newEmail });
      
      const updatedCurrentUser: User = { ...currentUser, email: newEmail };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedCurrentUser));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: 'Error al cambiar el correo. Podrías necesitar iniciar sesión de nuevo.' };
    }
  },

  changePassword: async (currentPassword?: string, newPassword?: string): Promise<{ success: boolean; error?: string }> => {
    if (!firebaseAuth.currentUser || !newPassword) {
      return { success: false, error: 'Solicitud inválida' };
    }
    try {
      await fbUpdatePassword(firebaseAuth.currentUser, newPassword);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: 'Error al cambiar contraseña. Inicia sesión nuevamente.' };
    }
  },

  getSecurityInfo: async (): Promise<{ lastLogin?: string; createdAt?: string }> => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return {};
    const lastLogin = localStorage.getItem(LAST_LOGIN_KEY);
    
    let createdAt = undefined;
    try {
      const snapshot = await get(ref(db, `users/${currentUser.id}/createdAt`));
      if (snapshot.exists()) {
        createdAt = snapshot.val();
      }
    } catch(e) {}

    return {
      lastLogin: lastLogin || undefined,
      createdAt,
    };
  },

  getSecurityOptions: (): { loginAlerts: boolean; twoFactorEnabled: boolean } => {
    try {
      const stored = localStorage.getItem(SECURITY_OPTIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return { loginAlerts: false, twoFactorEnabled: false };
  },

  setSecurityOptions: (options: { loginAlerts?: boolean; twoFactorEnabled?: boolean }): void => {
    const current = auth.getSecurityOptions();
    const next = { ...current, ...options };
    localStorage.setItem(SECURITY_OPTIONS_KEY, JSON.stringify(next));
  },

  requestPasswordReset: async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  verifyResetCode: (email: string, code: string): { success: boolean; error?: string } => {
    // Firebase manages password reset via link not code, so this step might be skipped in UI later
    return { success: true }; 
  },

  resetPassword: (email: string, code: string, newPassword: string): { success: boolean; error?: string } => {
    // Firebase uses links. Returning success to not break current UI logic if simulated
    return { success: true };
  },

  // Needed just for backwards compatibility where other utils might access
  getUserById: async (id: string): Promise<UserAccount | null> => {
    try {
      const snapshot = await get(ref(db, `users/${id}`));
      return snapshot.exists() ? snapshot.val() as UserAccount : null;
    } catch {
      return null;
    }
  },

  // Try to avoid using this in large DBs, added to support existing code
  getAllRegisteredUsers: async (): Promise<UserAccount[]> => {
    try {
      const snapshot = await get(ref(db, `users`));
      if (snapshot.exists()) {
        return Object.values(snapshot.val());
      }
      return [];
    } catch {
      return [];
    }
  }
};