export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  coverPhoto?: string;
}

export interface UserAccount {
  email: string;
  password: string;
  name: string;
  createdAt?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  coverPhoto?: string;
}

const USERS_KEY = 'nexly_users';
const CURRENT_USER_KEY = 'nexly_current_user';
const LAST_LOGIN_KEY = 'nexly_last_login';
const SECURITY_OPTIONS_KEY = 'nexly_security_options';

export const auth = {
  register: (email: string, password: string, name: string, location?: string): { success: boolean; error?: string } => {
    const users = auth.getAllRegisteredUsers();
    
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Esta cuenta ya existe' };
    }

    const newUser: UserAccount = { 
      email, 
      password, 
      name,
      location: location?.trim() || undefined,
      createdAt: new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    return { success: true };
  },

  login: (email: string, password: string): { success: boolean; user?: User; error?: string } => {
    const users = auth.getAllRegisteredUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return { success: false, error: 'Cuenta no existente o credenciales incorrectas' };
    }

    const currentUser: User = {
      id: email,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      website: user.website,
      coverPhoto: user.coverPhoto,
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    localStorage.setItem(LAST_LOGIN_KEY, new Date().toISOString());
    return { success: true, user: currentUser };
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!auth.getCurrentUser();
  },

  updateProfile: (updates: Partial<User>): { success: boolean; error?: string } => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'No hay usuario autenticado' };
    }

    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    // Also sync to users array so changes persist across logout/login
    const users = auth.getAllRegisteredUsers();
    const userAccount = users.find(u => u.email === currentUser.email);
    if (userAccount) {
      if (updates.name !== undefined) userAccount.name = updates.name;
      if (updates.avatar !== undefined) userAccount.avatar = updates.avatar;
      if (updates.bio !== undefined) userAccount.bio = updates.bio;
      if (updates.location !== undefined) userAccount.location = updates.location;
      if (updates.website !== undefined) userAccount.website = updates.website;
      if (updates.coverPhoto !== undefined) userAccount.coverPhoto = updates.coverPhoto;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    // Emit event for cross-component sync (Navbar, etc.)
    window.dispatchEvent(new CustomEvent('nexly-profile-update'));
    return { success: true };
  },

  changeEmail: (newEmail: string, password: string): { success: boolean; error?: string } => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'No hay usuario autenticado' };
    }

    const users = auth.getAllRegisteredUsers();
    const userAccount = users.find(u => u.email === currentUser.email && u.password === password);
    if (!userAccount) {
      return { success: false, error: 'Contraseña incorrecta' };
    }
    if (users.some(u => u.email === newEmail && u.email !== currentUser.email)) {
      return { success: false, error: 'Este correo ya está en uso' };
    }

    userAccount.email = newEmail;
    const updatedCurrentUser: User = { ...currentUser, id: newEmail, email: newEmail };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedCurrentUser));
    return { success: true };
  },

  changePassword: (currentPassword: string, newPassword: string): { success: boolean; error?: string } => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'No hay usuario autenticado' };
    }
    if (newPassword.length < 6) {
      return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' };
    }

    const users = auth.getAllRegisteredUsers();
    const userAccount = users.find(u => u.email === currentUser.email && u.password === currentPassword);
    if (!userAccount) {
      return { success: false, error: 'Contraseña actual incorrecta' };
    }

    userAccount.password = newPassword;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true };
  },

  getSecurityInfo: (): { lastLogin?: string; createdAt?: string } => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return {};
    const users = auth.getAllRegisteredUsers();
    const account = users.find(u => u.email === currentUser.email);
    const lastLogin = localStorage.getItem(LAST_LOGIN_KEY);
    return {
      lastLogin: lastLogin || undefined,
      createdAt: account?.createdAt,
    };
  },

  getSecurityOptions: (): { loginAlerts: boolean; twoFactorEnabled: boolean } => {
    try {
      const stored = localStorage.getItem(SECURITY_OPTIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return { loginAlerts: false, twoFactorEnabled: false };
  },

  setSecurityOptions: (options: { loginAlerts?: boolean; twoFactorEnabled?: boolean }): void => {
    const current = auth.getSecurityOptions();
    const next = { ...current, ...options };
    localStorage.setItem(SECURITY_OPTIONS_KEY, JSON.stringify(next));
  },

  // Password Reset Flow (Simulated)
  requestPasswordReset: (email: string): { success: boolean; error?: string } => {
    const users = auth.getAllRegisteredUsers();
    const user = users.find(u => u.email === email);
    if (!user) {
      // For security, don't reveal if email exists, but Nexly is a friendly place
      return { success: false, error: 'No encontramos ninguna cuenta con ese correo' };
    }

    // Generate a 6-digit code (simulated)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(`nexly_reset_${email}`, JSON.stringify({
      code,
      expiry: Date.now() + 15 * 60 * 1000 // 15 mins
    }));

    console.log(`[SIMULACIÓN DE CORREO] Para: ${email}. Tu código Nexly de recuperación es: ${code}`);
    return { success: true };
  },

  verifyResetCode: (email: string, code: string): { success: boolean; error?: string } => {
    const stored = localStorage.getItem(`nexly_reset_${email}`);
    if (!stored) return { success: false, error: 'El código ha expirado o no es válido' };

    const { code: storedCode, expiry } = JSON.parse(stored);
    if (Date.now() > expiry) {
      localStorage.removeItem(`nexly_reset_${email}`);
      return { success: false, error: 'El código ha expirado' };
    }

    if (code !== storedCode) {
      return { success: false, error: 'Código incorrecto' };
    }

    return { success: true };
  },

  resetPassword: (email: string, code: string, newPassword: string): { success: boolean; error?: string } => {
    const verification = auth.verifyResetCode(email, code);
    if (!verification.success) return verification;

    const users = auth.getAllRegisteredUsers();
    const userAccount = users.find(u => u.email === email);
    if (!userAccount) return { success: false, error: 'Error al actualizar la cuenta' };

    userAccount.password = newPassword;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.removeItem(`nexly_reset_${email}`);
    
    return { success: true };
  },

  getUserById: (id: string): UserAccount | null => {
    const users = auth.getAllRegisteredUsers();
    return users.find(u => u.email === id) || null;
  },

  getAllRegisteredUsers: (): UserAccount[] => {
    const usersStr = localStorage.getItem(USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  }
};