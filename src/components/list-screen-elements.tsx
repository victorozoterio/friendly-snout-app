import { CaretRightIcon, MagnifyingGlassIcon, PlusIcon, XCircleIcon } from 'phosphor-react-native';
import type { PropsWithChildren } from 'react';
import { Pressable, TextInput } from 'react-native';
import { Card, Text, XStack, YStack } from 'tamagui';

import { palette } from '../theme';
import { useAppColors } from './main-layout';

type ListScreenControlsProps = PropsWithChildren;

type ListSearchFieldProps = {
  accessibilityLabel: string;
  onChangeText: (value: string) => void;
  onClear: () => void;
  placeholder: string;
  value: string;
};

type ListItemCardProps = PropsWithChildren<{
  accessibilityLabel: string;
  onPress: () => void;
}>;

type ListFloatingActionProps = {
  accessibilityLabel: string;
  label: string;
  onPress: () => void;
};

/** Espaçamento padrão para os controles no topo das telas de listagem. */
export function ListScreenControls({ children }: ListScreenControlsProps) {
  return (
    <YStack gap='$3' pb='$3' pt='$3' px='$5'>
      {children}
    </YStack>
  );
}

/** Campo de busca com as mesmas dimensões nas listagens do aplicativo. */
export function ListSearchField({
  accessibilityLabel,
  onChangeText,
  onClear,
  placeholder,
  value,
}: ListSearchFieldProps) {
  const colors = useAppColors();

  return (
    <XStack
      gap='$2'
      items='center'
      px='$3'
      rounded='$4'
      style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}
    >
      <MagnifyingGlassIcon color={colors.muted} size={20} />
      <TextInput
        accessibilityLabel={accessibilityLabel}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={{ color: colors.text, flex: 1, fontSize: 15, paddingVertical: 12 }}
        value={value}
      />
      {value.length > 0 ? (
        <Pressable accessibilityLabel='Limpar busca' onPress={onClear}>
          <XCircleIcon color={colors.muted} size={20} weight='fill' />
        </Pressable>
      ) : null}
    </XStack>
  );
}

/** Base visual dos itens de listagem, com altura e interação padronizadas. */
export function ListItemCard({ accessibilityLabel, children, onPress }: ListItemCardProps) {
  const colors = useAppColors();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.76 : 1 })}
    >
      <Card
        borderWidth={1}
        p='$3'
        rounded='$4'
        style={{ backgroundColor: colors.card, borderColor: colors.border, minHeight: 92 }}
      >
        {children}
      </Card>
    </Pressable>
  );
}

/** Ação de cadastro posicionada de forma consistente acima da navegação inferior. */
export function ListFloatingAction({ accessibilityLabel, label, onPress }: ListFloatingActionProps) {
  const colors = useAppColors();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.primary,
        borderRadius: 28,
        bottom: 20,
        elevation: 6,
        opacity: pressed ? 0.85 : 1,
        paddingHorizontal: 18,
        paddingVertical: 14,
        position: 'absolute',
        right: 20,
        shadowColor: palette.black,
        shadowOffset: { height: 3, width: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      })}
    >
      <XStack gap='$2' items='center'>
        <PlusIcon color={palette.neutral0} size={20} weight='bold' />
        <Text fontSize={15} fontWeight='700' style={{ color: palette.neutral0 }}>
          {label}
        </Text>
      </XStack>
    </Pressable>
  );
}

/** Espaçamento compartilhado para o conteúdo rolável das listagens. */
export const listContentContainerStyle = {
  flexGrow: 1,
  gap: 12,
  paddingBottom: 96,
  paddingHorizontal: 20,
} as const;

/** Ícone de navegação dos cards de listagem. */
export function ListItemChevron() {
  const colors = useAppColors();

  return <CaretRightIcon color={colors.muted} size={18} weight='bold' />;
}
