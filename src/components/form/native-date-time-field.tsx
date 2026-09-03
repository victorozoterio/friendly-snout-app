import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { CalendarBlankIcon, ClockIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { Modal, Platform, Pressable, useColorScheme } from 'react-native';
import { Card, Text, XStack, YStack } from 'tamagui';

import { effectColors, palette } from '../../theme';
import { FormErrorInline } from '../form-error-inline';
import { useAppColors } from '../main-layout';
import { FieldLabel, InputField } from './fields';

type NativeDateTimeFieldProps = {
  error?: string;
  label: string;
  maximumDate?: Date;
  minimumDate?: Date;
  mode: 'date' | 'time';
  onChange: (value: Date) => void;
  onTextChange: (value: string) => void;
  required?: boolean;
  textValue: string;
  value: Date;
};

export function NativeDateTimeField({
  error,
  label,
  maximumDate,
  minimumDate,
  mode,
  onChange,
  onTextChange,
  required = false,
  textValue,
  value,
}: NativeDateTimeFieldProps) {
  const colors = useAppColors();
  const colorScheme = useColorScheme();
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [draftValue, setDraftValue] = useState(value);
  const Icon = mode === 'date' ? CalendarBlankIcon : ClockIcon;

  if (Platform.OS === 'web') {
    return (
      <InputField
        error={error}
        keyboardType='number-pad'
        label={label}
        maxLength={mode === 'date' ? 10 : 5}
        onChangeText={onTextChange}
        placeholder={mode === 'date' ? 'DD/MM/AAAA' : 'HH:mm'}
        required={required}
        value={textValue}
      />
    );
  }

  const openPicker = () => {
    setDraftValue(value);

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        display: mode === 'date' ? 'calendar' : 'clock',
        is24Hour: true,
        maximumDate,
        minimumDate,
        mode,
        onValueChange: (_event, selectedValue) => onChange(selectedValue),
        value,
      });
      return;
    }

    setIsPickerVisible(true);
  };

  const closePicker = () => setIsPickerVisible(false);
  const confirmPicker = () => {
    onChange(draftValue);
    closePicker();
  };

  return (
    <YStack gap='$1'>
      <FieldLabel required={required}>{label}</FieldLabel>
      <Pressable
        accessibilityLabel={`Selecionar ${label.toLocaleLowerCase('pt-BR')}`}
        accessibilityRole='button'
        onPress={openPicker}
        style={({ pressed }) => ({
          alignItems: 'center',
          backgroundColor: colors.card,
          borderColor: error ? colors.danger : colors.border,
          borderRadius: 12,
          borderWidth: 1,
          flexDirection: 'row',
          minHeight: 48,
          opacity: pressed ? 0.72 : 1,
          paddingHorizontal: 14,
          paddingVertical: 12,
        })}
      >
        <Text flex={1} fontSize={15} style={{ color: colors.text }}>
          {textValue}
        </Text>
        <Icon color={colors.primary} size={21} weight='bold' />
      </Pressable>
      <FormErrorInline message={error} />

      {Platform.OS === 'ios' ? (
        <Modal animationType='fade' onRequestClose={closePicker} transparent visible={isPickerVisible}>
          <YStack
            flex={1}
            items='center'
            justify='center'
            px='$5'
            style={{ backgroundColor: effectColors.modalOverlay }}
          >
            <Card
              borderWidth={1}
              gap='$4'
              maxWidth={420}
              p='$4'
              rounded='$5'
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
              width='100%'
            >
              <Text fontSize={18} fontWeight='800' style={{ color: colors.text, textAlign: 'center' }}>
                {label}
              </Text>
              <DateTimePicker
                accentColor={colors.primary}
                display='spinner'
                locale='pt-BR'
                maximumDate={maximumDate}
                minimumDate={minimumDate}
                mode={mode}
                onValueChange={(_event, selectedValue) => setDraftValue(selectedValue)}
                style={{ alignSelf: 'stretch' }}
                themeVariant={colorScheme === 'dark' ? 'dark' : 'light'}
                value={draftValue}
              />
              <XStack gap='$3'>
                <Pressable
                  accessibilityLabel='Cancelar seleção'
                  onPress={closePicker}
                  style={({ pressed }) => ({
                    alignItems: 'center',
                    backgroundColor: colors.cardMuted,
                    borderColor: colors.border,
                    borderRadius: 12,
                    borderWidth: 1,
                    flex: 1,
                    opacity: pressed ? 0.72 : 1,
                    paddingVertical: 12,
                  })}
                >
                  <Text fontWeight='700' style={{ color: colors.text }}>
                    Cancelar
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityLabel='Confirmar seleção'
                  onPress={confirmPicker}
                  style={({ pressed }) => ({
                    alignItems: 'center',
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    flex: 1,
                    opacity: pressed ? 0.78 : 1,
                    paddingVertical: 12,
                  })}
                >
                  <Text fontWeight='800' style={{ color: palette.neutral0 }}>
                    Confirmar
                  </Text>
                </Pressable>
              </XStack>
            </Card>
          </YStack>
        </Modal>
      ) : null}
    </YStack>
  );
}
