import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { ArrowClockwise, CaretRight, Heart, House, PawPrint, Pill, WarningCircle } from 'phosphor-react-native';
import { useCallback, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView } from 'react-native';
import { Card, Text, XStack, YStack } from 'tamagui';

import { MainLayout, useAppColors } from '../src/components/main-layout';
import { useAuth } from '../src/contexts/auth-context';
import { type AnimalStageTotals, getAnimalStageTotals } from '../src/services/animals';

type MetricCardProps = {
  accent: string;
  Icon: typeof House;
  label: string;
  value: number;
};

function MetricCard({ accent, Icon, label, value }: MetricCardProps) {
  const colors = useAppColors();

  return (
    <Card
      borderWidth={1}
      flex={1}
      p='$0'
      rounded='$4'
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        overflow: 'hidden',
        minHeight: 176,
      }}
    >
      <YStack flex={1} gap='$2' items='center' justify='space-between'>
        <XStack
          height={7}
          style={{
            alignSelf: 'stretch',
            backgroundColor: accent,
            borderRadius: 10,
            marginHorizontal: 12,
            marginTop: 12,
          }}
        />
        <YStack flex={1} gap='$2' items='center' justify='space-between' pb='$3' px='$3'>
          <YStack gap='$3' items='center'>
            <XStack
              height={54}
              items='center'
              justify='center'
              rounded='$10'
              style={{ backgroundColor: `${accent}20` }}
              width={54}
            >
              <Icon color={accent} size={32} weight='fill' />
            </XStack>
          </YStack>
          <YStack gap='$1' items='center'>
            <Text fontSize={14} fontWeight='700' numberOfLines={1} style={{ color: colors.text, textAlign: 'center' }}>
              {label}
            </Text>
            <Text fontSize={34} fontWeight='800' style={{ color: accent, textAlign: 'center' }}>
              {value}
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </Card>
  );
}

function MetricsSkeleton() {
  const colors = useAppColors();

  return (
    <YStack gap='$4'>
      <XStack height={24} rounded='$3' style={{ backgroundColor: colors.cardMuted }} width={184} />
      <XStack gap='$2'>
        {[0, 1, 2].map((item) => (
          <Card
            borderWidth={1}
            flex={1}
            height={176}
            key={item}
            rounded='$4'
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          />
        ))}
      </XStack>
      <Text style={{ color: colors.muted }}>Carregando indicadores...</Text>
    </YStack>
  );
}

function MetricsError({ onRetry }: { onRetry: () => void }) {
  const colors = useAppColors();

  return (
    <YStack flex={1} gap='$3' items='center' justify='center' px='$6' style={{ minHeight: 260 }}>
      <WarningCircle color={colors.warning} size={40} weight='fill' />
      <Text fontSize={17} fontWeight='700' style={{ color: colors.text, textAlign: 'center' }}>
        Não foi possível carregar os indicadores.
      </Text>
      <Text style={{ color: colors.muted, textAlign: 'center' }}>Verifique sua conexão e tente novamente.</Text>
      <Pressable
        accessibilityLabel='Tentar carregar os indicadores novamente'
        onPress={onRetry}
        style={({ pressed }) => ({
          backgroundColor: colors.primary,
          borderRadius: 12,
          marginTop: 4,
          opacity: pressed ? 0.75 : 1,
          paddingHorizontal: 16,
          paddingVertical: 12,
        })}
      >
        <XStack gap='$2' items='center'>
          <ArrowClockwise color={colors.text} size={18} />
          <Text fontWeight='700' style={{ color: colors.text }}>
            Tentar novamente
          </Text>
        </XStack>
      </Pressable>
    </YStack>
  );
}

type QuickActionProps = {
  description: string;
  Icon: typeof PawPrint;
  onPress: () => void;
  title: string;
};

function QuickAction({ description, Icon, onPress, title }: QuickActionProps) {
  const colors = useAppColors();

  return (
    <Pressable
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.76 : 1 })}
    >
      <YStack
        gap='$3'
        p='$3'
        rounded='$4'
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          minHeight: 148,
        }}
      >
        <XStack items='center' justify='space-between'>
          <XStack
            height={42}
            items='center'
            justify='center'
            rounded='$10'
            style={{ backgroundColor: colors.cardMuted }}
            width={42}
          >
            <Icon color={colors.primary} size={25} weight='fill' />
          </XStack>
          <CaretRight color={colors.muted} size={22} weight='bold' />
        </XStack>
        <YStack gap='$1'>
          <Text fontSize={16} fontWeight='800' style={{ color: colors.text }}>
            {title}
          </Text>
          <Text fontSize={13} lineHeight={18} style={{ color: colors.muted }}>
            {description}
          </Text>
        </YStack>
      </YStack>
    </Pressable>
  );
}

function Dashboard() {
  const router = useRouter();
  const colors = useAppColors();
  const [metrics, setMetrics] = useState<AnimalStageTotals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const hasLoadedMetrics = useRef(false);

  const loadMetrics = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh || hasLoadedMetrics.current) setIsRefreshing(true);
    else setIsLoading(true);

    setHasError(false);

    try {
      const data = await getAnimalStageTotals();
      setMetrics(data);
      hasLoadedMetrics.current = true;
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadMetrics();
    }, [loadMetrics]),
  );

  return (
    <MainLayout description='Resumo geral' title='Dashboard'>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 28 }}
        refreshControl={
          <RefreshControl
            colors={[colors.primary]}
            onRefresh={() => void loadMetrics(true)}
            refreshing={isRefreshing}
            tintColor={colors.primary}
          />
        }
      >
        {isLoading && !metrics ? <MetricsSkeleton /> : null}
        {hasError && !metrics ? <MetricsError onRetry={() => void loadMetrics()} /> : null}
        {metrics ? (
          <YStack gap='$6'>
            <YStack gap='$3'>
              <XStack gap='$2' items='center'>
                <PawPrint color={colors.primary} size={25} weight='fill' />
                <Text fontSize={20} fontWeight='800' style={{ color: colors.text }}>
                  Situação dos animais
                </Text>
              </XStack>
              <XStack gap='$2'>
                <MetricCard accent={colors.warning} Icon={House} label='Quarentena' value={metrics.quarantine} />
                <MetricCard accent={colors.primary} Icon={PawPrint} label='Acolhidos' value={metrics.sheltered} />
                <MetricCard accent={colors.success} Icon={Heart} label='Adotados' value={metrics.adopted} />
              </XStack>
            </YStack>

            <YStack gap='$3'>
              <XStack gap='$2' items='center'>
                <Text fontSize={20} fontWeight='800' style={{ color: colors.text }}>
                  Ações rápidas
                </Text>
              </XStack>
              <XStack gap='$3'>
                <QuickAction
                  description='Ver e gerenciar todos os animais'
                  Icon={PawPrint}
                  onPress={() => router.replace('/animals' as never)}
                  title='Animais'
                />
                <QuickAction
                  description='Gerenciar estoque e aplicações'
                  Icon={Pill}
                  onPress={() => router.replace('/medicines' as never)}
                  title='Medicamentos'
                />
              </XStack>
            </YStack>

            {hasError ? (
              <Text fontSize={13} style={{ color: colors.muted, textAlign: 'center' }}>
                Não foi possível atualizar agora. Os últimos dados carregados continuam visíveis.
              </Text>
            ) : null}
          </YStack>
        ) : null}
      </ScrollView>
    </MainLayout>
  );
}

export default function Index() {
  const { status } = useAuth();

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href='/login' />;

  return <Dashboard />;
}
