import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { signIn as requestSignIn } from '../services/auth';
import { tokenStorage } from '../services/auth/storage';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    const restoreSession = async () => {
      const [accessToken, refreshToken] = await Promise.all([
        tokenStorage.getAccessToken(),
        tokenStorage.getRefreshToken(),
      ]);
      setStatus(accessToken && refreshToken ? 'authenticated' : 'unauthenticated');
    };

    restoreSession().catch(async () => {
      await tokenStorage.clearTokens();
      setStatus('unauthenticated');
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      signIn: async (email, password) => {
        const { accessToken, refreshToken } = await requestSignIn({ email, password });
        await tokenStorage.setTokens(accessToken, refreshToken);
        setStatus('authenticated');
      },
      logout: async () => {
        await tokenStorage.clearTokens();
        setStatus('unauthenticated');
      },
    }),
    [status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');

  return context;
}
