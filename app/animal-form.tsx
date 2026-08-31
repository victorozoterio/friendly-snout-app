import { Redirect } from 'expo-router';

import { AnimalFormScreen } from '../src/components/animal-form-screen';
import { useAuth } from '../src/contexts/auth-context';
import { routes } from '../src/routes';

export default function AnimalForm() {
  const { status } = useAuth();

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href={routes.login} />;

  return <AnimalFormScreen />;
}
