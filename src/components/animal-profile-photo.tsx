import * as ImagePicker from 'expo-image-picker';
import { CameraIcon, ImageIcon } from 'phosphor-react-native';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Modal, PanResponder, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, XStack, YStack } from 'tamagui';
import { useAppDialog } from '../contexts/app-dialog-context';
import type { AnimalPhotoUpload } from '../services/animals';
import { effectColors, palette } from '../theme';
import { createAnimalPhotoUpload, maxAnimalPhotoFileSize } from '../utils/animal-photo';
import { useAppColors } from './main-layout';

type AnimalProfilePhotoProps = {
  isLoading?: boolean;
  onPhotoSelected?: (photo: AnimalPhotoUpload) => void | Promise<void>;
  photoUrl?: string | null;
  speciesName?: string;
};

type PhotoSource = 'camera' | 'gallery';

const profilePhotoPickerOptions = {
  allowsEditing: true,
  aspect: [1, 1] as [number, number],
  mediaTypes: ['images'] as ImagePicker.MediaType[],
  quality: 0.8,
};

/** Exibe e permite escolher a foto principal do animal, sem interferir nos anexos. */
export function AnimalProfilePhoto({
  isLoading = false,
  onPhotoSelected,
  photoUrl,
  speciesName,
}: AnimalProfilePhotoProps) {
  const colors = useAppColors();
  const { showWarning } = useAppDialog();
  const isFeline = speciesName?.trim().toLocaleLowerCase('pt-BR') === 'gato';
  const placeholder = isFeline ? require('../../assets/profiles-cat.png') : require('../../assets/profiles-dog.png');
  const isEditable = Boolean(onPhotoSelected);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const processSelectedPhoto = async (asset: ImagePicker.ImagePickerAsset) => {
    if (asset.fileSize && asset.fileSize > maxAnimalPhotoFileSize) {
      showWarning({ description: 'Escolha uma imagem de até 10 MB.', title: 'Imagem muito grande' });
      return;
    }

    const photo = createAnimalPhotoUpload(asset);
    if (!photo) {
      showWarning({ description: 'Escolha uma imagem JPG, PNG, AVIF ou WEBP.', title: 'Formato não suportado' });
      return;
    }

    await onPhotoSelected?.(photo);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showWarning({ description: 'Permita o acesso à câmera para tirar uma foto.', title: 'Permissão necessária' });
      return;
    }

    const result = await ImagePicker.launchCameraAsync(profilePhotoPickerOptions);
    if (!result.canceled && result.assets[0]) await processSelectedPhoto(result.assets[0]);
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showWarning({
        description: 'Permita o acesso à galeria para escolher uma imagem.',
        title: 'Permissão necessária',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync(profilePhotoPickerOptions);
    if (!result.canceled && result.assets[0]) await processSelectedPhoto(result.assets[0]);
  };

  const selectSource = (source: PhotoSource) => {
    setIsSheetOpen(false);
    requestAnimationFrame(() => {
      if (source === 'camera') void takePhoto();
      else void pickFromGallery();
    });
  };

  return (
    <YStack gap='$2' items='center'>
      <YStack>
        <Card
          borderWidth={3}
          elevation={6}
          height={120}
          overflow='hidden'
          rounded='$6'
          style={{
            backgroundColor: colors.card,
            borderColor: colors.background,
            shadowColor: palette.black,
            shadowOffset: { height: 4, width: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
          }}
          width={120}
        >
          <Image
            accessibilityLabel={photoUrl ? 'Foto principal do animal' : 'Avatar padrão do animal'}
            resizeMode={photoUrl ? 'cover' : 'contain'}
            source={photoUrl ? { uri: photoUrl } : placeholder}
            style={{ height: '100%', width: '100%' }}
          />
        </Card>

        {isEditable ? (
          <Pressable
            accessibilityLabel='Alterar foto principal do animal'
            disabled={isLoading}
            onPress={() => setIsSheetOpen(true)}
            style={({ pressed }) => ({
              alignItems: 'center',
              backgroundColor: colors.primary,
              borderColor: colors.background,
              borderRadius: 18,
              borderWidth: 2,
              bottom: -4,
              height: 36,
              justifyContent: 'center',
              opacity: isLoading ? 0.6 : pressed ? 0.78 : 1,
              position: 'absolute',
              right: -4,
              width: 36,
            })}
          >
            {isLoading ? (
              <ActivityIndicator color={palette.neutral0} size='small' />
            ) : (
              <CameraIcon color={palette.neutral0} size={19} weight='bold' />
            )}
          </Pressable>
        ) : null}
      </YStack>

      <PhotoSourceBottomSheet onClose={() => setIsSheetOpen(false)} onSelectSource={selectSource} open={isSheetOpen} />
    </YStack>
  );
}

type PhotoSourceBottomSheetProps = {
  onClose: () => void;
  onSelectSource: (source: PhotoSource) => void;
  open: boolean;
};

/** Folha inferior com ações de câmera e galeria, composta com os elementos do tema. */
function PhotoSourceBottomSheet({ onClose, onSelectSource, open }: PhotoSourceBottomSheetProps) {
  const colors = useAppColors();
  const translateY = useRef(new Animated.Value(0)).current;
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 6,
        onPanResponderMove: (_, gesture) => translateY.setValue(Math.max(0, gesture.dy)),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > 80 || gesture.vy > 0.75) {
            onClose();
            translateY.setValue(0);
            return;
          }

          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        },
        onPanResponderTerminate: () => Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start(),
      }),
    [onClose, translateY],
  );

  return (
    <Modal animationType='fade' onRequestClose={onClose} transparent visible={open}>
      <YStack flex={1} justify='flex-end' style={{ backgroundColor: effectColors.modalOverlay }}>
        <Pressable
          accessibilityLabel='Fechar opções de foto'
          onPress={onClose}
          style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
        />
        <Animated.View style={{ transform: [{ translateY }] }}>
          <YStack
            borderTopLeftRadius='$5'
            borderTopRightRadius='$5'
            overflow='hidden'
            style={{ backgroundColor: colors.background }}
            {...panResponder.panHandlers}
          >
            <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.background }}>
              <YStack gap='$4' pb='$3' pt='$3' px='$5'>
                <XStack height={4} items='center' justify='center'>
                  <XStack height={4} rounded='$2' style={{ backgroundColor: colors.border }} width={44} />
                </XStack>

                <YStack gap='$1'>
                  <Text fontSize={20} fontWeight='800' style={{ color: colors.text }}>
                    Foto principal
                  </Text>
                  <Text fontSize={14} lineHeight={20} style={{ color: colors.muted }}>
                    Escolha como deseja adicionar ou substituir a foto do animal.
                  </Text>
                </YStack>

                <YStack gap='$2'>
                  <PhotoSourceOption
                    Icon={CameraIcon}
                    label='Tirar foto'
                    onPress={() => onSelectSource('camera')}
                    subtitle='Use a câmera do dispositivo'
                  />
                  <PhotoSourceOption
                    Icon={ImageIcon}
                    label='Escolher da galeria'
                    onPress={() => onSelectSource('gallery')}
                    subtitle='Selecione uma imagem já salva'
                  />
                </YStack>

                <Pressable
                  accessibilityLabel='Cancelar alteração da foto'
                  onPress={onClose}
                  style={({ pressed }) => ({
                    backgroundColor: colors.cardMuted,
                    borderColor: colors.border,
                    borderRadius: 12,
                    borderWidth: 1,
                    opacity: pressed ? 0.72 : 1,
                    paddingVertical: 14,
                  })}
                >
                  <XStack items='center' justify='center'>
                    <Text fontSize={15} fontWeight='700' style={{ color: colors.text }}>
                      Cancelar
                    </Text>
                  </XStack>
                </Pressable>
              </YStack>
            </SafeAreaView>
          </YStack>
        </Animated.View>
      </YStack>
    </Modal>
  );
}

type PhotoSourceOptionProps = {
  Icon: typeof CameraIcon;
  label: string;
  onPress: () => void;
  subtitle: string;
};

function PhotoSourceOption({ Icon, label, onPress, subtitle }: PhotoSourceOptionProps) {
  const colors = useAppColors();

  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderRadius: 16,
        borderWidth: 1,
        opacity: pressed ? 0.76 : 1,
        padding: 16,
      })}
    >
      <XStack gap='$3' items='center'>
        <XStack
          height={44}
          items='center'
          justify='center'
          rounded='$4'
          style={{ backgroundColor: `${colors.primary}22` }}
          width={44}
        >
          <Icon color={colors.primary} size={22} weight='fill' />
        </XStack>
        <YStack flex={1} gap='$1'>
          <Text fontSize={16} fontWeight='800' style={{ color: colors.text }}>
            {label}
          </Text>
          <Text fontSize={13} style={{ color: colors.muted }}>
            {subtitle}
          </Text>
        </YStack>
      </XStack>
    </Pressable>
  );
}
