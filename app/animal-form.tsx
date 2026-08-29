import { Redirect } from 'expo-router';

import { AnimalFormScreen } from '../src/components/animal-form-screen';
import { useAuth } from '../src/contexts/auth-context';

export default function AnimalForm() {
  const { status } = useAuth();

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href='/login' />;

  return <AnimalFormScreen />;
}
