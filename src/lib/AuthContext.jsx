import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  const normalizeAuthError = useCallback((error) => {
    const status = error?.status || error?.response?.status;
    const reason = error?.data?.extra_data?.reason || error?.response?.data?.extra_data?.reason;

    if (reason === 'user_not_registered') {
      return { type: 'user_not_registered', message: 'User not registered for this app' };
    }

    if (status === 401 || status === 403 || reason === 'auth_required') {
      return null;
    }

    return { type: 'unknown', message: error?.message || 'Unable to verify your session' };
  }, []);

  const checkUserAuth = useCallback(async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      return currentUser;
    } catch (error) {
      const normalizedError = normalizeAuthError(error);
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(normalizedError);
      return null;
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, [normalizeAuthError]);

  useEffect(() => {
    checkUserAuth();
  }, [checkUserAuth]);

  const logout = useCallback((redirectUrl = '/login') => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthChecked(true);
    setAuthError(null);

    const nextUrl = typeof redirectUrl === 'string' ? redirectUrl : '/login';
    const absoluteRedirectUrl = new URL(nextUrl, window.location.origin).toString();
    base44.auth.logout(absoluteRedirectUrl);
  }, []);

  const loginWithGoogle = useCallback((fromUrl = '/') => {
    const redirectUrl = new URL(fromUrl, window.location.origin);
    if (redirectUrl.origin !== window.location.origin) {
      redirectUrl.pathname = '/';
      redirectUrl.search = '';
      redirectUrl.hash = '';
    }
    base44.auth.loginWithProvider('google', redirectUrl.toString());
  }, []);

  const navigateToLogin = useCallback((fromUrl = window.location.href) => {
    const loginUrl = new URL('/login', window.location.origin);
    loginUrl.searchParams.set('from_url', new URL(fromUrl, window.location.origin).toString());
    window.location.assign(loginUrl.toString());
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isLoadingAuth,
    authChecked,
    authError,
    logout,
    loginWithGoogle,
    navigateToLogin,
    checkUserAuth,
  }), [
    user,
    isAuthenticated,
    isLoadingAuth,
    authChecked,
    authError,
    logout,
    loginWithGoogle,
    navigateToLogin,
    checkUserAuth,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};