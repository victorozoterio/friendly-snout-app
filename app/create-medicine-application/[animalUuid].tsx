import { Redirect, useLocalSearchParams } from 'expo-router';

import { MedicineApplicationFormScreen } from '../../src/components/medicine-application-form-screen';
import { useAuth } from '../../src/contexts/auth-context';
import { routes } from '../../src/routes';

export default function CreateMedicineApplicationScreen() {
  const { animalUuid } = useLocalSearchParams<{ animalUuid: string }>();
  const { status } = useAuth();

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href={routes.login} />;
  if (!animalUuid) return <Redirect href={routes.animals} />;

  return <MedicineApplicationFormScreen animalUuid={animalUuid} />;
}
