import { CaretLeftIcon, CaretRightIcon, ClockIcon, WarningCircleIcon } from 'phosphor-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import { Card, Text, XStack, YStack } from 'tamagui';

import { formatApplicationDateTime, type MedicineApplication } from '../services/medicine-applications';
import { palette } from '../theme';
import { useAppColors } from './main-layout';

type MedicineApplicationCalendarProps = {
  applications: MedicineApplication[];
  hasError: boolean;
  isLoading: boolean;
};

type CalendarOccurrence = {
  application: MedicineApplication;
  date: Date;
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

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseApplicationDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isRecurring(application: MedicineApplication) {
  return Boolean(application.frequency && application.frequency !== 'não se repete');
}

function getOccurrenceForDay(application: MedicineApplication, day: Date): CalendarOccurrence | null {
  const end = parseApplicationDate(application.nextApplicationAt);
  if (!end) return null;

  const start = isRecurring(application) ? parseApplicationDate(application.appliedAt) : end;
  if (!start) return null;

  const occurrenceDate = new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    start.getHours(),
    start.getMinutes(),
    0,
    0,
  );
  if (occurrenceDate.getTime() < start.getTime() || occurrenceDate.getTime() > end.getTime()) return null;

  const startDay = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const occurrenceDay = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate());
  const daysSinceStart = Math.round((occurrenceDay - startDay) / 86_400_000);
  const matchesFrequency = {
    anual: day.getMonth() === start.getMonth() && day.getDate() === start.getDate(),
    diário: true,
    mensal: day.getDate() === start.getDate(),
    'não se repete': daysSinceStart === 0,
    semanal: daysSinceStart % 7 === 0,
    'todos os dias da semana': day.getDay() >= 1 && day.getDay() <= 5,
  }[application.frequency ?? 'não se repete'];

  return matchesFrequency ? { application, date: occurrenceDate } : null;
}

function getOccurrencesForMonth(applications: MedicineApplication[], month: Date) {
  const occurrences: CalendarOccurrence[] = [];
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    for (const application of applications) {
      const occurrence = getOccurrenceForDay(application, date);
      if (occurrence) occurrences.push(occurrence);
    }
  }

  return occurrences;
}

function getNearestOccurrence(applications: MedicineApplication[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const upcoming: CalendarOccurrence[] = [];
  const previous: CalendarOccurrence[] = [];

  for (const application of applications) {
    const end = parseApplicationDate(application.nextApplicationAt);
    const start = isRecurring(application) ? parseApplicationDate(application.appliedAt) : end;
    if (!start || !end) continue;

    const firstDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const lastDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const futureSearchStart = firstDay > today ? firstDay : today;
    for (let day = new Date(futureSearchStart), attempts = 0; day <= lastDay && attempts < 3_660; attempts += 1) {
      const occurrence = getOccurrenceForDay(application, day);
      if (occurrence && occurrence.date.getTime() >= now.getTime()) {
        upcoming.push(occurrence);
        break;
      }
      day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
    }

    const previousSearchStart = lastDay < today ? lastDay : today;
    for (let day = new Date(previousSearchStart), attempts = 0; day >= firstDay && attempts < 3_660; attempts += 1) {
      const occurrence = getOccurrenceForDay(application, day);
      if (occurrence && occurrence.date.getTime() < now.getTime()) {
        previous.push(occurrence);
        break;
      }
      day = new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1);
    }
  }

  upcoming.sort((first, second) => first.date.getTime() - second.date.getTime());
  previous.sort((first, second) => second.date.getTime() - first.date.getTime());

  return upcoming[0] ?? previous[0];
}

function MonthNavigationButton({ direction, onPress }: { direction: 'previous' | 'next'; onPress: () => void }) {
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

export function MedicineApplicationCalendar({ applications, hasError, isLoading }: MedicineApplicationCalendarProps) {
  const colors = useAppColors();
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const hasPositionedCalendar = useRef(false);

  const scheduledApplications = useMemo(
    () => applications.filter((application) => parseApplicationDate(application.nextApplicationAt)),
    [applications],
  );

  useEffect(() => {
    if (isLoading || hasPositionedCalendar.current) return;
    const initial = getNearestOccurrence(scheduledApplications);
    if (initial) {
      setVisibleMonth(new Date(initial.date.getFullYear(), initial.date.getMonth(), 1));
      setSelectedDateKey(toDateKey(initial.date));
      hasPositionedCalendar.current = true;
    } else if (!hasError) {
      hasPositionedCalendar.current = true;
    }
  }, [hasError, isLoading, scheduledApplications]);

  const applicationsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarOccurrence[]>();
    for (const occurrence of getOccurrencesForMonth(scheduledApplications, visibleMonth)) {
      const key = toDateKey(occurrence.date);
      grouped.set(key, [...(grouped.get(key) ?? []), occurrence]);
    }
    return grouped;
  }, [scheduledApplications, visibleMonth]);

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const leadingDays = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: { date: Date | null; key: string }[] = Array.from({ length: leadingDays }, (_, weekday) => ({
      date: null,
      key: `before-${weekday}`,
    }));

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      cells.push({ date, key: toDateKey(date) });
    }
    while (cells.length % 7 !== 0) cells.push({ date: null, key: `after-${cells.length}` });
    return cells;
  }, [visibleMonth]);

  const selectedApplications = selectedDateKey ? (applicationsByDate.get(selectedDateKey) ?? []) : [];
  const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(visibleMonth);
  const todayKey = toDateKey(new Date());

  const moveMonth = (offset: number) => {
    const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1);
    const firstOccurrence = getOccurrencesForMonth(scheduledApplications, nextMonth).sort(
      (first, second) => first.date.getTime() - second.date.getTime(),
    )[0];

    setVisibleMonth(nextMonth);
    setSelectedDateKey(firstOccurrence ? toDateKey(firstOccurrence.date) : null);
  };

  return (
    <Card borderWidth={1} p='$3' rounded='$4' style={{ backgroundColor: colors.card, borderColor: colors.border }}>
      <YStack gap='$3'>
        <XStack items='center' justify='space-between'>
          <MonthNavigationButton direction='previous' onPress={() => moveMonth(-1)} />
          <Text fontSize={16} fontWeight='800' style={{ color: colors.text, textTransform: 'capitalize' }}>
            {monthLabel}
          </Text>
          <MonthNavigationButton direction='next' onPress={() => moveMonth(1)} />
        </XStack>

        <XStack>
          {weekDays.map((day) => (
            <YStack items='center' key={day.key} py='$1' style={{ width: '14.2857%' }}>
              <Text fontSize={11} fontWeight='800' style={{ color: colors.muted }}>
                {day.label}
              </Text>
            </YStack>
          ))}
        </XStack>

        <XStack flexWrap='wrap'>
          {calendarDays.map((cell) => {
            const { date } = cell;
            if (!date) return <YStack height={40} key={cell.key} style={{ width: '14.2857%' }} />;

            const key = toDateKey(date);
            const dayOccurrences = applicationsByDate.get(key) ?? [];
            const hasApplication = dayOccurrences.length > 0;
            const isSelected = selectedDateKey === key;
            const isToday = todayKey === key;
            const isLate = dayOccurrences.every((occurrence) => occurrence.date.getTime() < Date.now());
            const accent = isLate ? colors.danger : colors.primary;

            return (
              <YStack items='center' justify='center' key={key} p={2} style={{ width: '14.2857%' }}>
                <Pressable
                  accessibilityLabel={`${date.getDate()} de ${monthLabel}${
                    hasApplication
                      ? `, ${dayOccurrences.length} ${dayOccurrences.length === 1 ? 'agendamento' : 'agendamentos'}`
                      : ''
                  }`}
                  accessibilityState={{ selected: isSelected }}
                  disabled={!hasApplication}
                  onPress={() => setSelectedDateKey(key)}
                  style={({ pressed }) => ({
                    alignItems: 'center',
                    backgroundColor: isSelected ? accent : hasApplication ? `${accent}1C` : 'transparent',
                    borderColor: hasApplication ? accent : isToday ? colors.muted : 'transparent',
                    borderRadius: 11,
                    borderWidth: 1,
                    height: 36,
                    justifyContent: 'center',
                    opacity: pressed ? 0.7 : 1,
                    width: 36,
                  })}
                >
                  <Text
                    fontSize={13}
                    fontWeight={hasApplication || isToday ? '800' : '500'}
                    style={{ color: isSelected ? palette.neutral0 : hasApplication ? accent : colors.text }}
                  >
                    {date.getDate()}
                  </Text>
                  {hasApplication && !isSelected ? (
                    <YStack height={3} rounded='$6' style={{ backgroundColor: accent }} width={3} />
                  ) : null}
                </Pressable>
              </YStack>
            );
          })}
        </XStack>

        <YStack pt='$3' style={{ borderTopColor: colors.border, borderTopWidth: 1 }}>
          {isLoading ? (
            <XStack gap='$2' items='center' justify='center' py='$2'>
              <ActivityIndicator color={colors.primary} size='small' />
              <Text fontSize={13} style={{ color: colors.muted }}>
                Carregando agenda...
              </Text>
            </XStack>
          ) : hasError && scheduledApplications.length === 0 ? (
            <XStack gap='$2' items='center' py='$2'>
              <WarningCircleIcon color={colors.warning} size={20} weight='fill' />
              <Text flex={1} fontSize={13} lineHeight={18} style={{ color: colors.muted }}>
                Não foi possível carregar os agendamentos.
              </Text>
            </XStack>
          ) : selectedApplications.length > 0 ? (
            <YStack gap='$2'>
              {selectedApplications.slice(0, 2).map((occurrence) => (
                <XStack gap='$2' items='center' key={`${occurrence.application.uuid}-${toDateKey(occurrence.date)}`}>
                  <ClockIcon color={colors.primary} size={18} weight='fill' />
                  <YStack flex={1}>
                    <Text fontSize={13} fontWeight='700' numberOfLines={1} style={{ color: colors.text }}>
                      {occurrence.application.medicine?.name ?? 'Medicamento'}
                    </Text>
                    <Text fontSize={12} style={{ color: colors.muted }}>
                      {formatApplicationDateTime(occurrence.date.toISOString())} · {occurrence.application.quantity}{' '}
                      {occurrence.application.quantity === 1 ? 'unidade' : 'unidades'}
                    </Text>
                  </YStack>
                </XStack>
              ))}
              {selectedApplications.length > 2 ? (
                <Text fontSize={12} style={{ color: colors.muted }}>
                  + {selectedApplications.length - 2} neste dia
                </Text>
              ) : null}
            </YStack>
          ) : (
            <Text fontSize={13} style={{ color: colors.muted, textAlign: 'center' }}>
              Nenhum agendamento neste mês.
            </Text>
          )}
        </YStack>

        {!isLoading && scheduledApplications.length > 0 ? (
          <XStack gap='$3' justify='center'>
            <XStack gap='$1' items='center'>
              <YStack height={7} rounded='$6' style={{ backgroundColor: colors.primary }} width={7} />
              <Text fontSize={11} style={{ color: colors.muted }}>
                Agendado
              </Text>
            </XStack>
            <XStack gap='$1' items='center'>
              <YStack height={7} rounded='$6' style={{ backgroundColor: colors.danger }} width={7} />
              <Text fontSize={11} style={{ color: colors.muted }}>
                Em atraso
              </Text>
            </XStack>
          </XStack>
        ) : null}
      </YStack>
    </Card>
  );
}
