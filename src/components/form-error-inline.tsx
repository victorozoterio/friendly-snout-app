import { XCircleIcon } from 'phosphor-react-native';
import { Text, XStack } from 'tamagui';

import { colors } from '../theme/tokens';

type FormErrorInlineProps = {
  message?: string | null;
};

export function FormErrorInline({ message }: FormErrorInlineProps) {
  return (
    <XStack aria-hidden={!message} gap='$1' height={22} items='center' opacity={message ? 1 : 0}>
      <XCircleIcon color={colors.error} size={16} weight='duotone' />
      <Text color='$error' fontSize={14}>
        {message ?? ' '}
      </Text>
    </XStack>
  );
}
