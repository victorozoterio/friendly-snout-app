import type { ReactNode } from 'react';
import { type KeyboardTypeOptions, Pressable, TextInput } from 'react-native';
import { Card, Text, XStack, YStack } from 'tamagui';

import { FormErrorInline } from '../form-error-inline';
import { useAppColors } from '../main-layout';

export type FormOption<T extends string> = {
  label: string;
  value: T;
};

export function FieldLabel({ children, required = false }: { children: string; required?: boolean }) {
  const appColors = useAppColors();

  return (
    <Text fontSize={14} fontWeight='700' style={{ color: appColors.text }}>
      {children}
      {required ? <Text style={{ color: appColors.danger }}> *</Text> : null}
    </Text>
  );
}

type InputFieldProps = {
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  label: string;
  maxLength?: number;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
};

export function InputField({
  error,
  keyboardType,
  label,
  maxLength,
  multiline = false,
  onChangeText,
  placeholder,
  required = false,
  value,
}: InputFieldProps) {
  const appColors = useAppColors();

  return (
    <YStack gap='$1'>
      <FieldLabel required={required}>{label}</FieldLabel>
      <TextInput
        accessibilityLabel={label}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={appColors.muted}
        style={{
          backgroundColor: appColors.card,
          borderColor: error ? appColors.danger : appColors.border,
          borderRadius: 12,
          borderWidth: 1,
          color: appColors.text,
          fontSize: 15,
          minHeight: multiline ? 112 : 48,
          paddingHorizontal: 14,
          paddingVertical: 12,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
        value={value}
      />
      <FormErrorInline message={error} />
    </YStack>
  );
}

type ChoiceFieldProps<T extends string> = {
  error?: string;
  label: string;
  onChange: (value: T) => void;
  options: FormOption<T>[];
  required?: boolean;
  value: T | '';
};

export function ChoiceField<T extends string>({
  error,
  label,
  onChange,
  options,
  required = false,
  value,
}: ChoiceFieldProps<T>) {
  const appColors = useAppColors();

  return (
    <YStack gap='$2'>
      <FieldLabel required={required}>{label}</FieldLabel>
      <XStack flexWrap='wrap' gap='$2'>
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <Pressable
              accessibilityLabel={`${label}: ${option.label}`}
              accessibilityRole='radio'
              accessibilityState={{ selected: isSelected }}
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => ({
                backgroundColor: isSelected ? `${appColors.primary}22` : appColors.card,
                borderColor: isSelected ? appColors.primary : error ? appColors.danger : appColors.border,
                borderRadius: 12,
                borderWidth: 1,
                opacity: pressed ? 0.72 : 1,
                paddingHorizontal: 14,
                paddingVertical: 11,
              })}
            >
              <Text
                fontSize={14}
                fontWeight={isSelected ? '700' : '500'}
                style={{ color: isSelected ? appColors.primary : appColors.text }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </XStack>
      <FormErrorInline message={error} />
    </YStack>
  );
}

export function FormSection({ children, subtitle, title }: { children: ReactNode; subtitle: string; title: string }) {
  const appColors = useAppColors();

  return (
    <YStack gap='$3'>
      <YStack gap='$1'>
        <Text fontSize={20} fontWeight='800' style={{ color: appColors.text }}>
          {title}
        </Text>
        <Text fontSize={14} lineHeight={20} style={{ color: appColors.muted }}>
          {subtitle}
        </Text>
      </YStack>
      <Card
        borderWidth={1}
        gap='$2'
        p='$4'
        rounded='$4'
        style={{ backgroundColor: appColors.cardMuted, borderColor: appColors.border }}
      >
        {children}
      </Card>
    </YStack>
  );
}
