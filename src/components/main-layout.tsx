import { usePathname, useRouter } from 'expo-router';
import { HouseIcon, PawPrintIcon, PillIcon, SignOutIcon } from 'phosphor-react-native';
import type { PropsWithChildren } from 'react';
import { Pressable, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';

import { useAuth } from '../contexts/auth-context';
import { routes } from '../routes';
import { appColors, effectColors, palette } from '../theme';

export function useAppColors() {
  const colorScheme = useColorScheme();
  return appColors[colorScheme === 'dark' ? 'dark' : 'light'];
}

type NavigationItem = {
  label: string;
  href: (typeof routes)[keyof Pick<typeof routes, 'animals' | 'home' | 'medicines'>];
  Icon: typeof HouseIcon;
};

const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', href: routes.home, Icon: HouseIcon },
  { label: 'Animais', href: routes.animals, Icon: PawPrintIcon },
  { label: 'Medicamentos', href: routes.medicines, Icon: PillIcon },
];

type MainLayoutProps = PropsWithChildren<{
  title: string;
  description?: string;
}>;

export function MainLayout({ children, description, title }: MainLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const colors = useAppColors();
  const isDarkTheme = useColorScheme() === 'dark';
  const glassBackground = isDarkTheme ? effectColors.surfaceGlassDark : effectColors.surfaceGlassLight;
  const glassBorder = isDarkTheme ? effectColors.surfaceGlassBorderDark : effectColors.surfaceGlassBorderLight;
  const HeaderIcon = navigationItems.find((item) => item.href === pathname)?.Icon ?? HouseIcon;
  const titleFontSize = title.length > 10 ? 26 : 31;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <YStack flex={1} style={{ backgroundColor: colors.background }}>
        <XStack items='flex-start' justify='space-between' px='$5' pt='$5' style={{ minHeight: 92 }}>
          <XStack flex={1} gap='$3' items='flex-start'>
            <XStack
              height={46}
              items='center'
              justify='center'
              rounded='$4'
              style={{ backgroundColor: `${colors.primary}22`, borderColor: `${colors.primary}4D`, borderWidth: 1 }}
              width={46}
            >
              <HeaderIcon color={colors.primary} size={25} weight='fill' />
            </XStack>
            <YStack flex={1} gap='$1'>
              <Text
                fontSize={titleFontSize}
                fontWeight='800'
                numberOfLines={1}
                style={{ color: colors.text, letterSpacing: -0.5 }}
              >
                {title}
              </Text>
              {description ? (
                <Text fontSize={15} lineHeight={20} style={{ color: colors.muted }}>
                  {description}
                </Text>
              ) : null}
            </YStack>
          </XStack>
          <Pressable
            accessibilityLabel='Sair da conta'
            onPress={() => {
              void logout().then(() => router.replace(routes.login));
            }}
            style={({ pressed }) => ({
              alignItems: 'center',
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: 14,
              borderWidth: 1,
              height: 48,
              justifyContent: 'center',
              marginLeft: 16,
              opacity: pressed ? 0.72 : 1,
              width: 48,
            })}
          >
            <SignOutIcon color={colors.muted} size={24} weight='bold' />
          </Pressable>
        </XStack>

        <YStack flex={1}>{children}</YStack>

        <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.background }}>
          <YStack
            mx='$2'
            px='$2'
            py='$2'
            style={{
              backgroundColor: glassBackground,
              borderColor: glassBorder,
              borderRadius: 26,
              borderWidth: 1,
              elevation: 10,
              shadowColor: isDarkTheme ? palette.black : palette.blue900,
              shadowOffset: { height: -3, width: 0 },
              shadowOpacity: isDarkTheme ? 0.32 : 0.16,
              shadowRadius: 14,
            }}
          >
            <XStack justify='space-around'>
              {navigationItems.map(({ Icon, href, label }) => {
                const isActive = pathname === href;
                const itemColor = isActive ? colors.primary : colors.muted;

                return (
                  <Pressable
                    accessibilityLabel={label}
                    accessibilityRole='tab'
                    accessibilityState={{ selected: isActive }}
                    key={href}
                    onPress={() => router.replace(href as never)}
                    style={({ pressed }) => ({
                      alignItems: 'center',
                      flex: 1,
                      gap: 5,
                      opacity: pressed ? 0.72 : 1,
                      paddingVertical: 7,
                    })}
                  >
                    <Icon color={itemColor} size={25} weight={isActive ? 'fill' : 'regular'} />
                    <Text fontSize={11} fontWeight={isActive ? '700' : '500'} style={{ color: itemColor }}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </XStack>
          </YStack>
        </SafeAreaView>
      </YStack>
    </SafeAreaView>
  );
}
