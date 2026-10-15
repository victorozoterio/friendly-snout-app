import * as ImagePicker from 'expo-image-picker';
import { CameraIcon } from 'phosphor-react-native';
import { ActivityIndicator, Alert, Image, Pressable } from 'react-native';
import { Card, YStack } from 'tamagui';

import type { AnimalPhotoUpload } from '../services/animals';
import { palette } from '../theme';
import { createAnimalPhotoUpload, maxAnimalPhotoFileSize } from '../utils/animal-photo';
import { useAppColors } from './main-layout';

type AnimalProfilePhotoProps = {
  isLoading?: boolean;
  onPhotoSelected?: (photo: AnimalPhotoUpload) => void | Promise<void>;
  photoUrl?: string | null;
  speciesName?: string;
};

/**
 * Exibe e permite escolher a foto principal do animal, sem interferir nos anexos.
 */
export function AnimalProfilePhoto({
  isLoading = false,
  onPhotoSelected,
  photoUrl,
  speciesName,
}: AnimalProfilePhotoProps) {
  const colors = useAppColors();
  const isFeline = speciesName?.trim().toLocaleLowerCase('pt-BR') === 'gato';
  const placeholder = isFeline ? require('../../assets/profiles-cat.png') : require('../../assets/profiles-dog.png');
  const isEditable = Boolean(onPhotoSelected);

  const processSelectedPhoto = async (asset: ImagePicker.ImagePickerAsset) => {
    if (asset.fileSize && asset.fileSize > maxAnimalPhotoFileSize) {
      Alert.alert('Imagem muito grande', 'Escolha uma imagem de até 10 MB.');
      return;
    }

    const photo = createAnimalPhotoUpload(asset);
    if (!photo) {
      Alert.alert('Formato não suportado', 'Escolha uma imagem JPG, PNG, AVIF ou WEBP.');
      return;
    }

    await onPhotoSelected?.(photo);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso à câmera para tirar uma foto.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled && result.assets[0]) await processSelectedPhoto(result.assets[0]);
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para escolher uma imagem.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) await processSelectedPhoto(result.assets[0]);
  };

  const openPhotoOptions = () => {
    if (!isEditable || isLoading) return;

    Alert.alert('Foto principal', 'Escolha de onde deseja adicionar a foto do animal.', [
      { onPress: () => void takePhoto(), text: 'Tirar foto' },
      { onPress: () => void pickFromGallery(), text: 'Escolher da galeria' },
      { style: 'cancel', text: 'Cancelar' },
    ]);
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
            onPress={openPhotoOptions}
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
    </YStack>
  );
}
