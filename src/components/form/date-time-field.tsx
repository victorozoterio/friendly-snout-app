import { CalendarBlankIcon, CaretLeftIcon, CaretRightIcon, ClockIcon } from 'phosphor-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, XStack, YStack } from 'tamagui';

import { effectColors, palette } from '../../theme';
import { FormErrorInline } from '../form-error-inline';
import { useAppColors } from '../main-layout';
import { FieldLabel } from './fields';

type DateTimeFieldProps = {
  error?: string;
  label: string;
  maximumDate?: Date;
  minimumDate?: Date;
  mode: 'date' | 'time';
  onChange: (value: Date) => void;
  required?: boolean;
  showErrorMessage?: boolean;
  textValue: string;
  value: Date;
};

const weekDays = [
  { key: 'sunday', label: 'D' },
  { key: 'monday', label: 'S' },
  { key: 'tuesday', label: 'T' },
  { key: 'wednesday', label: 'Q' },
  { key: 'thursday', label: 'Q' },
  { key: 'friday', label: 'S' },
  { key: 'saturday', label: 'S' },
];

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function formatTimePart(value: number) {
  return String(value).padStart(2, '0');
}

function isOutsideAllowedRange(date: Date, minimumDate?: Date, maximumDate?: Date) {
  const dateAtMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const minimumAtMidnight = minimumDate
    ? new Date(minimumDate.getFullYear(), minimumDate.getMonth(), minimumDate.getDate()).getTime()
    : undefined;
  const maximumAtMidnight = maximumDate
    ? new Date(maximumDate.getFullYear(), maximumDate.getMonth(), maximumDate.getDate()).getTime()
    : undefined;

  return (
    (minimumAtMidnight !== undefined && dateAtMidnight < minimumAtMidnight) ||
    (maximumAtMidnight !== undefined && dateAtMidnight > maximumAtMidnight)
  );
}

/** Campo de data ou horário com seletor visual alinhado ao tema do aplicativo. */
export function DateTimeField({
  error,
  label,
  maximumDate,
  minimumDate,
  mode,
  onChange,
  required = false,
  showErrorMessage = true,
  textValue,
  value,
}: DateTimeFieldProps) {
  const colors = useAppColors();
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [draftValue, setDraftValue] = useState(value);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(value.getFullYear(), value.getMonth(), 1));
  const [draftHour, setDraftHour] = useState(formatTimePart(value.getHours()));
  const [draftMinute, setDraftMinute] = useState(formatTimePart(value.getMinutes()));
  const [timeError, setTimeError] = useState<string | null>(null);
  const Icon = mode === 'date' ? CalendarBlankIcon : ClockIcon;

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const leadingDays = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: { date: Date | null; key: string }[] = Array.from({ length: leadingDays }, (_, index) => ({
      date: null,
      key: `leading-${year}-${month}-${index}`,
    }));

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      days.push({ date, key: date.toISOString() });
    }
    while (days.length % 7 !== 0) {
      days.push({ date: null, key: `trailing-${year}-${month}-${days.length}` });
    }

    return days;
  }, [visibleMonth]);

  const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(visibleMonth);

  const openPicker = () => {
    setDraftValue(value);
    setVisibleMonth(new Date(value.getFullYear(), value.getMonth(), 1));
    setDraftHour(formatTimePart(value.getHours()));
    setDraftMinute(formatTimePart(value.getMinutes()));
    setTimeError(null);
    setIsPickerVisible(true);
  };

  const closePicker = () => setIsPickerVisible(false);

  const selectDate = (date: Date) => {
    setDraftValue(
      new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        draftValue.getHours(),
        draftValue.getMinutes(),
        0,
        0,
      ),
    );
  };

  const confirmPicker = () => {
    if (mode === 'time') {
      const hour = Number(draftHour);
      const minute = Number(draftMinute);
      const isValidTime =
        Number.isInteger(hour) && Number.isInteger(minute) && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;

      if (!isValidTime) {
        setTimeError('Informe um horário entre 00:00 e 23:59.');
        return;
      }

      const nextValue = new Date(value);
      nextValue.setHours(hour, minute, 0, 0);
      onChange(nextValue);
    } else {
      onChange(draftValue);
    }

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
      {showErrorMessage ? <FormErrorInline message={error} /> : null}

      <Modal animationType='fade' onRequestClose={closePicker} transparent visible={isPickerVisible}>
        <YStack flex={1} justify='center' px='$5' style={{ backgroundColor: effectColors.modalOverlay }}>
          <Pressable
            accessibilityLabel='Fechar seletor'
            onPress={closePicker}
            style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
          />
          <SafeAreaView edges={['bottom', 'left', 'right', 'top']}>
            <Card
              borderWidth={1}
              gap='$4'
              maxWidth={420}
              mx='auto'
              p='$4'
              rounded='$5'
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
              width='100%'
            >
              <YStack gap='$1'>
                <Text fontSize={19} fontWeight='800' style={{ color: colors.text }}>
                  {label}
                </Text>
                <Text fontSize={13} style={{ color: colors.muted }}>
                  {mode === 'date' ? 'Escolha a data desejada.' : 'Informe o horário desejado.'}
                </Text>
              </YStack>

              {mode === 'date' ? (
                <YStack gap='$3'>
                  <XStack items='center' justify='space-between'>
                    <MonthButton
                      direction='previous'
                      onPress={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                    />
                    <Text fontSize={16} fontWeight='800' style={{ color: colors.text, textTransform: 'capitalize' }}>
                      {monthLabel}
                    </Text>
                    <MonthButton
                      direction='next'
                      onPress={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                    />
                  </XStack>

                  <XStack>
                    {weekDays.map((weekDay) => (
                      <YStack items='center' key={weekDay.key} py='$1' style={{ width: '14.2857%' }}>
                        <Text fontSize={11} fontWeight='800' style={{ color: colors.muted }}>
                          {weekDay.label}
                        </Text>
                      </YStack>
                    ))}
                  </XStack>

                  <XStack flexWrap='wrap'>
                    {calendarDays.map(({ date, key }) => {
                      if (!date) return <YStack height={44} key={key} style={{ width: '14.2857%' }} />;

                      const isDisabled = isOutsideAllowedRange(date, minimumDate, maximumDate);
                      const isSelected = isSameDay(date, draftValue);
                      return (
                        <YStack items='center' key={key} p={2} style={{ width: '14.2857%' }}>
                          <Pressable
                            accessibilityLabel={`Selecionar dia ${date.getDate()}`}
                            disabled={isDisabled}
                            onPress={() => selectDate(date)}
                            style={({ pressed }) => ({
                              alignItems: 'center',
                              backgroundColor: isSelected ? colors.primary : 'transparent',
                              borderColor: isSelected ? colors.primary : 'transparent',
                              borderRadius: 12,
                              borderWidth: 1,
                              height: 38,
                              justifyContent: 'center',
                              opacity: isDisabled ? 0.32 : pressed ? 0.7 : 1,
                              width: 38,
                            })}
                          >
                            <Text
                              fontSize={14}
                              fontWeight={isSelected ? '800' : '500'}
                              style={{ color: isSelected ? palette.neutral0 : colors.text }}
                            >
                              {date.getDate()}
                            </Text>
                          </Pressable>
                        </YStack>
                      );
                    })}
                  </XStack>
                </YStack>
              ) : (
                <YStack gap='$3'>
                  <XStack gap='$3' justify='center'>
                    <TimeInput label='Hora' onChangeText={setDraftHour} value={draftHour} />
                    <Text fontSize={32} fontWeight='800' mt='$5' style={{ color: colors.text }}>
                      :
                    </Text>
                    <TimeInput label='Minutos' onChangeText={setDraftMinute} value={draftMinute} />
                  </XStack>
                  {timeError ? <FormErrorInline message={timeError} /> : null}
                </YStack>
              )}

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
          </SafeAreaView>
        </YStack>
      </Modal>
    </YStack>
  );
}

function MonthButton({ direction, onPress }: { direction: 'previous' | 'next'; onPress: () => void }) {
  const colors = useAppColors();
  const Icon = direction === 'previous' ? CaretLeftIcon : CaretRightIcon;

  return (
    <Pressable
      accessibilityLabel={direction === 'previous' ? 'Mês anterior' : 'Próximo mês'}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: 'center',
        backgroundColor: colors.cardMuted,
        borderRadius: 10,
        height: 36,
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
        width: 36,
      })}
    >
      <Icon color={colors.text} size={18} weight='bold' />
    </Pressable>
  );
}

function TimeInput({
  label,
  onChangeText,
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  value: string;
}) {
  const colors = useAppColors();

  return (
    <YStack gap='$1' width={104}>
      <Text fontSize={13} fontWeight='700' style={{ color: colors.muted, textAlign: 'center' }}>
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        keyboardType='number-pad'
        maxLength={2}
        onChangeText={(nextValue) => onChangeText(nextValue.replace(/\D/g, ''))}
        selectTextOnFocus
        style={{
          backgroundColor: colors.cardMuted,
          borderColor: colors.border,
          borderRadius: 12,
          borderWidth: 1,
          color: colors.text,
          fontSize: 28,
          fontWeight: '700',
          paddingHorizontal: 12,
          paddingVertical: 12,
          textAlign: 'center',
        }}
        value={value}
      />
    </YStack>
  );
}
