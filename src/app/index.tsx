import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';

import { TamaguiTestCard } from '../components/tamagui-test-card';

export default function Home() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack bg='$background' flex={1} items='center' justify='center' p='$5'>
        <TamaguiTestCard />
      </YStack>
    </SafeAreaView>
  );
}
