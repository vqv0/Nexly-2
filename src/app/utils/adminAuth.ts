interface Admin {
  username: string;
  email: string;
}

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
  email: 'admin@nexly.com',
};

class AdminAuth {
  private storageKey = 'nexly_admin';

  login(username: string, password: string): boolean {
    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      const admin: Admin = {
        username: ADMIN_CREDENTIALS.username,
        email: ADMIN_CREDENTIALS.email,
      };
      localStorage.setItem(this.storageKey, JSON.stringify(admin));
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }

  isAuthenticated(): boolean {
    return localStorage.getItem(this.storageKey) !== null;
  }

  getCurrentAdmin(): Admin | null {
    const adminData = localStorage.getItem(this.storageKey);
    if (adminData) {
      return JSON.parse(adminData);
    }
    return null;
  }
}

export const adminAuth = new AdminAuth();
