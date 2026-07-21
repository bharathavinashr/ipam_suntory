import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, usersApi, setActingEmail } from '../api';

const ROLE_NAMES = { 0: 'System Admin', 1: 'User', 2: 'Approver', 3: 'Viewer' };

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authMode, setAuthMode] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshUsers = useCallback(() => usersApi.list().then(setAllUsers), []);

  // LOCAL-mode dev convenience: switch the "acting as" user. Even though this trusts a
  // client-picked email, the server always re-resolves that email's role itself on every
  // request rather than trusting anything else about the user sent from the browser.
  const actAs = useCallback((email) => {
    setActingEmail(email);
    const u = allUsers.find(x => x.email === email) || null;
    setCurrentUser(u);
  }, [allUsers]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setError(null);
      try {
        const { auth_mode } = await authApi.getConfig();
        if (cancelled) return;
        setAuthMode(auth_mode);

        if (auth_mode === 'LOCAL') {
          const users = await usersApi.list();
          if (cancelled) return;
          setAllUsers(users);
          const savedEmail = localStorage.getItem('ipam_acting_email');
          const initial = users.find(u => u.email === savedEmail) || users[0] || null;
          if (initial) {
            setActingEmail(initial.email);
            setCurrentUser(initial);
          }
        } else {
          const me = await authApi.getMe();
          if (cancelled) return;
          setCurrentUser(me);
        }
      } catch (err) {
        if (!cancelled) setError(err?.detail || 'Failed to resolve current user');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const userRole = currentUser ? (ROLE_NAMES[currentUser.role] ?? 'User') : null;

  return (
    <AuthContext.Provider value={{ authMode, currentUser, userRole, allUsers, actAs, refreshUsers, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
