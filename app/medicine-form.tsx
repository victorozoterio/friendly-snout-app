import { Redirect } from 'expo-router';

import { MedicineFormScreen } from '../src/components/medicine-form-screen';
import { useAuth } from '../src/contexts/auth-context';
import { routes } from '../src/routes';

export default function MedicineForm() {
  const { status } = useAuth();

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href={routes.login} />;

  return <MedicineFormScreen />;
}
