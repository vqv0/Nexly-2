export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
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
}

const USERS_KEY = 'nexly_users';
const CURRENT_USER_KEY = 'nexly_current_user';

export const auth = {
  register: (email: string, password: string, name: string): { success: boolean; error?: string } => {
    const users = getUsers();
    
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Esta cuenta ya existe' };
    }

    const newUser: UserAccount = { 
      email, 
      password, 
      name,
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
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return { success: false, error: 'Cuenta no existente o credenciales incorrectas' };
    }

    const currentUser: User = {
      id: email,
      email: user.email,
      name: user.name,
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
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
    return { success: true };
  }
};

function getUsers(): UserAccount[] {
  const usersStr = localStorage.getItem(USERS_KEY);
  return usersStr ? JSON.parse(usersStr) : [];
}