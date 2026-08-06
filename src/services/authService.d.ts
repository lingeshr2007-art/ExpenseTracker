export interface AuthService {
  login: (username?: string, password?: string) => Promise<any>;
  googleAuth: (email: string, name: string, picture?: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  isAuthenticated: () => boolean;
  logout: () => void;
  getStoredUser: () => any;
}

export const authService: AuthService;
export default authService;
