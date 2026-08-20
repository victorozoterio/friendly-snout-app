import { Redirect } from 'expo-router';

import { useAuth } from '../contexts/auth-context';

export default function Index() {
  const { status } = useAuth();

  if (status === 'loading') return null;

  return <Redirect href={status === 'authenticated' ? '/dashboard' : '/login'} />;
}
