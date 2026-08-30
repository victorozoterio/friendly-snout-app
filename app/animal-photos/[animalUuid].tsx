import * as ImagePicker from 'expo-image-picker';
import { Redirect, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Camera, Image as ImageIcon, Plus, Star, Trash, X } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, XStack, YStack } from 'tamagui';

import { useAppColors } from '../../src/components/main-layout';
import { ScreenHeader } from '../../src/components/screen-header';
import { useAuth } from '../../src/contexts/auth-context';
import {
  getAnimalPhotos,
  getAnimalProfilePhoto,
  removeAnimalPhoto,
  saveAnimalPhoto,
  setAnimalProfilePhoto,
} from '../../src/services/animals';

export default function AnimalPhotosScreen() {
  const { animalUuid } = useLocalSearchParams<{ animalUuid: string }>();
  const { status } = useAuth();
  const colors = useAppColors();

  const [photos, setPhotos] = useState<string[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!animalUuid) return;
    const [storedPhotos, storedProfile] = await Promise.all([
      getAnimalPhotos(animalUuid),
      getAnimalProfilePhoto(animalUuid),
    ]);
    setPhotos(storedPhotos);
    setProfilePhoto(storedProfile);
  }, [animalUuid]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href='/login' />;

  const handleSavePhoto = async (uri: string) => {
    if (!animalUuid) return;
    const updated = await saveAnimalPhoto(animalUuid, uri);
    setPhotos(updated);
  };

  const pickImageFromGallery = async () => {
    setIsModalOpen(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'É preciso permitir o acesso às fotos para escolher uma imagem.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      await handleSavePhoto(result.assets[0].uri);
    }
  };

  const takePhotoWithCamera = async () => {
    setIsModalOpen(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'É preciso permitir o acesso à câmera para tirar fotos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      await handleSavePhoto(result.assets[0].uri);
    }
  };

  const handleSetProfilePhoto = async (photoUri: string) => {
    if (!animalUuid) return;
    await setAnimalProfilePhoto(animalUuid, photoUri);
    setProfilePhoto(photoUri);
    setSelectedPhoto(null);
    Alert.alert('Foto de Perfil', 'Foto de perfil do animal atualizada com sucesso!');
  };

  const handleRemovePhoto = async (photoUri: string) => {
    if (!animalUuid) return;
    const updated = await removeAnimalPhoto(animalUuid, photoUri);
    setPhotos(updated);
    if (profilePhoto === photoUri) setProfilePhoto(null);
    if (selectedPhoto === photoUri) setSelectedPhoto(null);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScreenHeader description='Galeria e fotos do animal' title='Fotos do Animal' />

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        <YStack gap='$4'>
          {/* Header Action Row */}
          <XStack items='center' justify='space-between'>
            <YStack>
              <Text fontSize={18} fontWeight='800' style={{ color: colors.text }}>
                Galeria ({photos.length})
              </Text>
              <Text fontSize={12} style={{ color: colors.muted }}>
                Segure uma foto para definir como perfil
              </Text>
            </YStack>
            <Pressable
              accessibilityLabel='Adicionar nova foto'
              onPress={() => setIsModalOpen(true)}
              style={({ pressed }) => ({
                alignItems: 'center',
                backgroundColor: colors.primary,
                borderRadius: 12,
                flexDirection: 'row',
                gap: 6,
                opacity: pressed ? 0.76 : 1,
                paddingHorizontal: 14,
                paddingVertical: 10,
              })}
            >
              <Plus color='#FFFFFF' size={18} weight='bold' />
              <Text fontSize={14} fontWeight='700' style={{ color: '#FFFFFF' }}>
                Nova Foto
              </Text>
            </Pressable>
          </XStack>

          {/* Photos Grid or Empty State */}
          {photos.length === 0 ? (
            <YStack flex={1} gap='$4' items='center' justify='center' py='$10'>
              <XStack
                height={80}
                items='center'
                justify='center'
                rounded='$10'
                style={{ backgroundColor: `${colors.primary}1A` }}
                width={80}
              >
                <Camera color={colors.primary} size={40} weight='fill' />
              </XStack>
              <YStack gap='$2' items='center'>
                <Text fontSize={18} fontWeight='800' style={{ color: colors.text, textAlign: 'center' }}>
                  Nenhuma foto adicionada ainda
                </Text>
                <Text fontSize={14} style={{ color: colors.muted, textAlign: 'center' }}>
                  Adicione fotos utilizando a câmera ou selecionando da galeria do seu dispositivo.
                </Text>
              </YStack>

              <Pressable
                onPress={() => setIsModalOpen(true)}
                style={({ pressed }) => ({
                  alignItems: 'center',
                  backgroundColor: colors.primary,
                  borderRadius: 14,
                  opacity: pressed ? 0.76 : 1,
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                })}
              >
                <XStack gap='$2' items='center'>
                  <Camera color='#FFFFFF' size={20} weight='bold' />
                  <Text fontWeight='700' style={{ color: '#FFFFFF' }}>
                    Adicionar Primeira Foto
                  </Text>
                </XStack>
              </Pressable>
            </YStack>
          ) : (
            <XStack flexWrap='wrap' gap='$3'>
              {photos.map((uri) => {
                const isProfile = profilePhoto === uri;

                return (
                  <Pressable
                    key={uri}
                    onLongPress={() => setSelectedPhoto(uri)}
                    onPress={() => setSelectedPhoto(uri)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, width: '48%' })}
                  >
                    <Card
                      borderWidth={isProfile ? 3 : 1}
                      height={160}
                      overflow='hidden'
                      rounded='$4'
                      style={{
                        backgroundColor: colors.card,
                        borderColor: isProfile ? colors.primary : colors.border,
                        position: 'relative',
                      }}
                    >
                      <Image resizeMode='cover' source={{ uri }} style={{ height: '100%', width: '100%' }} />

                      {isProfile ? (
                        <Card
                          px='$2'
                          py='$1'
                          rounded='$2'
                          style={{
                            backgroundColor: colors.primary,
                            position: 'absolute',
                            right: 6,
                            top: 6,
                          }}
                        >
                          <XStack gap='$1' items='center'>
                            <Star color='#FFFFFF' size={12} weight='fill' />
                            <Text fontSize={10} fontWeight='800' style={{ color: '#FFFFFF' }}>
                              Perfil
                            </Text>
                          </XStack>
                        </Card>
                      ) : null}
                    </Card>
                  </Pressable>
                );
              })}
            </XStack>
          )}
        </YStack>
      </ScrollView>

      {/* Modal Source Selection (Camera vs Gallery) */}
      <Modal animationType='slide' onRequestClose={() => setIsModalOpen(false)} transparent visible={isModalOpen}>
        <YStack flex={1} justify='flex-end' style={{ backgroundColor: 'rgba(2, 12, 22, 0.65)' }}>
          <Card
            borderWidth={1}
            gap='$4'
            p='$5'
            rounded='$6'
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <XStack items='center' justify='space-between'>
              <Text fontSize={18} fontWeight='800' style={{ color: colors.text }}>
                Adicionar Foto
              </Text>
              <Pressable onPress={() => setIsModalOpen(false)}>
                <X color={colors.muted} size={24} />
              </Pressable>
            </XStack>

            <Text fontSize={14} style={{ color: colors.muted }}>
              Escolha a origem da foto para o animal:
            </Text>

            <YStack gap='$3'>
              {/* Option 1: Camera */}
              <Pressable
                accessibilityLabel='Tirar foto com a Câmera'
                onPress={() => void takePhotoWithCamera()}
                style={({ pressed }) => ({
                  alignItems: 'center',
                  backgroundColor: colors.cardMuted,
                  borderColor: colors.border,
                  borderRadius: 14,
                  borderWidth: 1,
                  flexDirection: 'row',
                  gap: 12,
                  opacity: pressed ? 0.76 : 1,
                  padding: 16,
                })}
              >
                <XStack
                  height={44}
                  items='center'
                  justify='center'
                  rounded='$3'
                  style={{ backgroundColor: `${colors.primary}20` }}
                  width={44}
                >
                  <Camera color={colors.primary} size={24} weight='fill' />
                </XStack>
                <YStack flex={1}>
                  <Text fontSize={15} fontWeight='700' style={{ color: colors.text }}>
                    Tirar foto com a Câmera
                  </Text>
                  <Text fontSize={12} style={{ color: colors.muted }}>
                    Usar a câmera do dispositivo agora
                  </Text>
                </YStack>
              </Pressable>

              {/* Option 2: Gallery */}
              <Pressable
                accessibilityLabel='Escolher do Armazenamento Interno'
                onPress={() => void pickImageFromGallery()}
                style={({ pressed }) => ({
                  alignItems: 'center',
                  backgroundColor: colors.cardMuted,
                  borderColor: colors.border,
                  borderRadius: 14,
                  borderWidth: 1,
                  flexDirection: 'row',
                  gap: 12,
                  opacity: pressed ? 0.76 : 1,
                  padding: 16,
                })}
              >
                <XStack
                  height={44}
                  items='center'
                  justify='center'
                  rounded='$3'
                  style={{ backgroundColor: `${colors.primary}20` }}
                  width={44}
                >
                  <ImageIcon color={colors.primary} size={24} weight='fill' />
                </XStack>
                <YStack flex={1}>
                  <Text fontSize={15} fontWeight='700' style={{ color: colors.text }}>
                    Escolher da Galeria
                  </Text>
                  <Text fontSize={12} style={{ color: colors.muted }}>
                    Selecionar foto do armazenamento interno
                  </Text>
                </YStack>
              </Pressable>
            </YStack>

            <Pressable
              onPress={() => setIsModalOpen(false)}
              style={({ pressed }) => ({
                alignItems: 'center',
                borderRadius: 12,
                marginTop: 4,
                opacity: pressed ? 0.7 : 1,
                paddingVertical: 12,
              })}
            >
              <Text fontWeight='700' style={{ color: colors.muted }}>
                Cancelar
              </Text>
            </Pressable>
          </Card>
        </YStack>
      </Modal>

      {/* Modal Options & Preview Photo */}
      <Modal
        animationType='fade'
        onRequestClose={() => setSelectedPhoto(null)}
        transparent
        visible={Boolean(selectedPhoto)}
      >
        <YStack flex={1} justify='center' p='$4' style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
          <XStack justify='flex-end' mb='$2'>
            <Pressable onPress={() => setSelectedPhoto(null)} style={{ padding: 8 }}>
              <X color='#FFFFFF' size={28} />
            </Pressable>
          </XStack>
          {selectedPhoto ? (
            <YStack gap='$4' items='center' justify='center'>
              <Image resizeMode='contain' source={{ uri: selectedPhoto }} style={{ height: 320, width: '100%' }} />

              <YStack gap='$3' width='100%'>
                {/* Button: Define as Profile Photo */}
                <Pressable
                  accessibilityLabel='Usar como foto de perfil'
                  onPress={() => void handleSetProfilePhoto(selectedPhoto)}
                  style={({ pressed }) => ({
                    alignItems: 'center',
                    backgroundColor: colors.primary,
                    borderRadius: 14,
                    flexDirection: 'row',
                    gap: 10,
                    justifyContent: 'center',
                    opacity: pressed ? 0.78 : 1,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  })}
                >
                  <Star color='#FFFFFF' size={20} weight='fill' />
                  <Text fontWeight='800' style={{ color: '#FFFFFF' }}>
                    {profilePhoto === selectedPhoto ? 'Foto de Perfil Atual' : 'Usar como foto de perfil'}
                  </Text>
                </Pressable>

                {/* Button: Remove Photo */}
                <Pressable
                  accessibilityLabel='Remover Foto'
                  onPress={() => void handleRemovePhoto(selectedPhoto)}
                  style={({ pressed }) => ({
                    alignItems: 'center',
                    backgroundColor: `${colors.danger}22`,
                    borderColor: colors.danger,
                    borderRadius: 14,
                    borderWidth: 1,
                    flexDirection: 'row',
                    gap: 10,
                    justifyContent: 'center',
                    opacity: pressed ? 0.78 : 1,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  })}
                >
                  <Trash color={colors.danger} size={20} weight='bold' />
                  <Text fontWeight='800' style={{ color: colors.danger }}>
                    Remover Foto
                  </Text>
                </Pressable>
              </YStack>
            </YStack>
          ) : null}
        </YStack>
      </Modal>
    </SafeAreaView>
  );
}
