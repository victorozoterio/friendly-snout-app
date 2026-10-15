import { CheckCircleIcon, WarningCircleIcon, XCircleIcon } from 'phosphor-react-native';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, XStack, YStack } from 'tamagui';

import { appColors, effectColors, palette } from '../theme/colors';

type AppDialogType = 'confirmation' | 'error' | 'success' | 'warning';

type AppDialogOptions = {
  cancelLabel?: string;
  confirmLabel?: string;
  description: string;
  destructive?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void | Promise<void>;
  title: string;
  type: AppDialogType;
};

type AppDialogInput = Omit<AppDialogOptions, 'type'>;

type AppDialogContextValue = {
  confirm: (options: AppDialogInput) => void;
  showError: (options: AppDialogInput) => void;
  showSuccess: (options: AppDialogInput) => void;
  showWarning: (options: AppDialogInput) => void;
};

const AppDialogContext = createContext<AppDialogContextValue | null>(null);

/** Exibe feedbacks e confirmações com o visual compartilhado da aplicação. */
export function AppDialogProvider({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();
  const colors = appColors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [dialog, setDialog] = useState<AppDialogOptions | null>(null);
  const dialogRef = useRef<AppDialogOptions | null>(null);

  const setCurrentDialog = useCallback((nextDialog: AppDialogOptions | null) => {
    dialogRef.current = nextDialog;
    setDialog(nextDialog);
  }, []);

  const closeDialog = useCallback(() => {
    const currentDialog = dialogRef.current;
    setCurrentDialog(null);
    currentDialog?.onCancel?.();
  }, [setCurrentDialog]);

  const confirmDialog = useCallback(() => {
    const currentDialog = dialogRef.current;
    setCurrentDialog(null);
    if (currentDialog?.onConfirm) void currentDialog.onConfirm();
  }, [setCurrentDialog]);

  const value = useMemo<AppDialogContextValue>(
    () => ({
      confirm: (options) => setCurrentDialog({ ...options, type: 'confirmation' }),
      showError: (options) => setCurrentDialog({ ...options, type: 'error' }),
      showSuccess: (options) => setCurrentDialog({ ...options, type: 'success' }),
      showWarning: (options) => setCurrentDialog({ ...options, type: 'warning' }),
    }),
    [setCurrentDialog],
  );

  const accentColor = dialog
    ? { confirmation: colors.warning, error: colors.danger, success: colors.success, warning: colors.warning }[
        dialog.type
      ]
    : colors.primary;
  const Icon =
    dialog?.type === 'success' ? CheckCircleIcon : dialog?.type === 'error' ? XCircleIcon : WarningCircleIcon;
  const isConfirmation = dialog?.type === 'confirmation';
  const confirmLabel = dialog?.confirmLabel ?? (isConfirmation ? 'Confirmar' : 'Entendi');

  return (
    <AppDialogContext.Provider value={value}>
      {children}

      <Modal animationType='fade' onRequestClose={closeDialog} transparent visible={Boolean(dialog)}>
        <YStack flex={1} items='center' justify='center' px='$5' style={{ backgroundColor: effectColors.modalOverlay }}>
          <Pressable
            accessibilityLabel='Fechar diálogo'
            onPress={closeDialog}
            style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
          />
          <SafeAreaView edges={['bottom', 'left', 'right', 'top']} style={{ width: '100%' }}>
            {dialog ? (
              <Card
                borderWidth={1}
                elevation={8}
                gap='$4'
                maxWidth={440}
                mx='auto'
                p='$5'
                rounded='$5'
                style={{ backgroundColor: colors.card, borderColor: colors.border, width: '100%' }}
              >
                <XStack gap='$3' items='flex-start'>
                  <XStack
                    height={48}
                    items='center'
                    justify='center'
                    rounded='$4'
                    style={{ backgroundColor: `${accentColor}20` }}
                    width={48}
                  >
                    <Icon color={accentColor} size={28} weight='fill' />
                  </XStack>
                  <YStack flex={1} gap='$1' pt='$1'>
                    <Text fontSize={18} fontWeight='800' style={{ color: colors.text }}>
                      {dialog.title}
                    </Text>
                    <Text fontSize={14} lineHeight={20} style={{ color: colors.muted }}>
                      {dialog.description}
                    </Text>
                  </YStack>
                </XStack>

                <XStack gap='$3' justify='flex-end'>
                  {isConfirmation ? (
                    <Pressable
                      accessibilityLabel={dialog.cancelLabel ?? 'Cancelar'}
                      onPress={closeDialog}
                      style={({ pressed }) => ({
                        alignItems: 'center',
                        backgroundColor: colors.cardMuted,
                        borderColor: colors.border,
                        borderRadius: 12,
                        borderWidth: 1,
                        opacity: pressed ? 0.72 : 1,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                      })}
                    >
                      <Text fontWeight='800' style={{ color: colors.text }}>
                        {dialog.cancelLabel ?? 'Cancelar'}
                      </Text>
                    </Pressable>
                  ) : null}
                  <Pressable
                    accessibilityLabel={confirmLabel}
                    onPress={confirmDialog}
                    style={({ pressed }) => ({
                      alignItems: 'center',
                      backgroundColor: dialog.destructive ? colors.danger : colors.primary,
                      borderRadius: 12,
                      opacity: pressed ? 0.72 : 1,
                      paddingHorizontal: 18,
                      paddingVertical: 12,
                    })}
                  >
                    <Text fontWeight='800' style={{ color: palette.neutral0 }}>
                      {confirmLabel}
                    </Text>
                  </Pressable>
                </XStack>
              </Card>
            ) : null}
          </SafeAreaView>
        </YStack>
      </Modal>
    </AppDialogContext.Provider>
  );
}

/** Retorna as funções para abrir diálogos padronizados da aplicação. */
export function useAppDialog() {
  const context = useContext(AppDialogContext);
  if (!context) throw new Error('useAppDialog deve ser usado dentro de AppDialogProvider.');
  return context;
}
