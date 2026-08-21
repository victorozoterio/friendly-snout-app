import { Redirect, useRouter } from 'expo-router';
import { Button, H1, YStack } from 'tamagui';

import { useAuth } from '../src/contexts/auth-context';

export default function Index() {
  const { status } = useAuth();

  if (status === 'loading') return null;

  if (status === 'unauthenticated') return <Redirect href='./login' />;

  return <Dashboard />;
}

function Dashboard() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <YStack bg='$background' flex={1} gap='$5' items='center' justify='center' p='$5'>
      <H1 color='$primary'>Dashboard</H1>
      <Button
        onPress={async () => {
          await logout();
          router.replace('./login');
        }}
      >
        Sair
      </Button>
    </YStack>
  );
}
