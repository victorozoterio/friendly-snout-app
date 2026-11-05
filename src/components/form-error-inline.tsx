import { XCircleIcon } from 'phosphor-react-native';
import { Text, XStack } from 'tamagui';

import { colors } from '../theme/tokens';

type FormErrorInlineProps = {
  message?: string | null;
};

export function FormErrorInline({ message }: FormErrorInlineProps) {
  return (
    <XStack aria-hidden={!message} gap='$1' items='flex-start' opacity={message ? 1 : 0} style={{ minHeight: 18 }}>
      <XCircleIcon color={colors.error} size={16} weight='duotone' />
      <Text flex={1} color='$error' fontSize={14} lineHeight={18}>
        {message ?? ' '}
      </Text>
    </XStack>
  );
}
