import { Redirect, useLocalSearchParams } from 'expo-router';

import { MedicineFormScreen } from '../../src/components/medicine-form-screen';
import { useAuth } from '../../src/contexts/auth-context';
import { routes } from '../../src/routes';

export default function EditMedicineScreen() {
  const { medicineUuid } = useLocalSearchParams<{ medicineUuid: string }>();
  const { status } = useAuth();

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href={routes.login} />;
  if (!medicineUuid) return <Redirect href={routes.medicines} />;

  return <MedicineFormScreen medicineUuid={medicineUuid} />;
}
