import { Redirect, useLocalSearchParams } from 'expo-router';

import { AnimalFormScreen } from '../../src/components/animal-form-screen';
import { useAuth } from '../../src/contexts/auth-context';

export default function EditAnimalScreen() {
  const { animalUuid } = useLocalSearchParams<{ animalUuid: string }>();
  const { status } = useAuth();

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href='/login' />;
  if (!animalUuid) return <Redirect href='/animals' />;

  return <AnimalFormScreen animalUuid={animalUuid} />;
}
