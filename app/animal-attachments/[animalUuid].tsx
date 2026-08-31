import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Redirect, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Camera, File as FileIcon, Image as ImageIcon, Paperclip, PlusIcon, Trash, X } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Modal, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, XStack, YStack } from 'tamagui';

import { useAppColors } from '../../src/components/main-layout';
import { ScreenHeader } from '../../src/components/screen-header';
import { useAuth } from '../../src/contexts/auth-context';
import { routes } from '../../src/routes';
import {
  type Attachment,
  deleteAnimalAttachment,
  getAnimalAttachments,
  getAttachmentErrorMessage,
  uploadAnimalAttachment,
} from '../../src/services/attachments';
import { effectColors, palette } from '../../src/theme';
import {
  createAttachmentUpload,
  getAttachmentName,
  isImageAttachment,
  maxAttachmentFileSize,
  type PickedAttachmentFile,
  supportedAttachmentMimeTypes,
} from '../../src/utils/attachment';

function AttachmentTile({ attachment, onPress }: { attachment: Attachment; onPress: () => void }) {
  const colors = useAppColors();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, width: '48%' })}>
      <Card
        borderWidth={1}
        height={164}
        overflow='hidden'
        rounded='$4'
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
      >
        {isImageAttachment(attachment) ? (
          <Image resizeMode='cover' source={{ uri: attachment.url }} style={{ height: '100%', width: '100%' }} />
        ) : (
          <YStack flex={1} gap='$2' items='center' justify='center' p='$3'>
            <FileIcon color={colors.primary} size={38} weight='fill' />
            <Text fontSize={12} fontWeight='700' numberOfLines={2} style={{ color: colors.text, textAlign: 'center' }}>
              {getAttachmentName(attachment)}
            </Text>
            <Text fontSize={11} style={{ color: colors.muted }}>
              {attachment.type.toLocaleUpperCase('pt-BR')}
            </Text>
          </YStack>
        )}
      </Card>
    </Pressable>
  );
}

export default function AnimalAttachmentsScreen() {
  const { animalUuid } = useLocalSearchParams<{ animalUuid: string }>();
  const { status } = useAuth();
  const colors = useAppColors();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [deletingAttachmentUuid, setDeletingAttachmentUuid] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAttachments = useCallback(async () => {
    if (!animalUuid) return;

    setErrorMessage(null);
    try {
      const response = await getAnimalAttachments(animalUuid);
      setAttachments(response.data);
    } catch (error: unknown) {
      setErrorMessage(getAttachmentErrorMessage(error, 'Não foi possível carregar os anexos. Tente novamente.'));
    } finally {
      setIsLoading(false);
    }
  }, [animalUuid]);

  useFocusEffect(
    useCallback(() => {
      void loadAttachments();
    }, [loadAttachments]),
  );

  const uploadFile = async (file: PickedAttachmentFile) => {
    if (!animalUuid) return;

    const size = file.fileSize ?? file.size;
    if (size && size > maxAttachmentFileSize) {
      Alert.alert('Arquivo muito grande', 'Escolha um arquivo de até 10 MB.');
      return;
    }

    const upload = createAttachmentUpload(file);
    if (!upload) {
      Alert.alert('Formato não suportado', 'Escolha uma imagem JPG, PNG, AVIF, WEBP ou um arquivo PDF.');
      return;
    }

    setIsSourceModalOpen(false);
    setIsUploading(true);

    try {
      const attachment = await uploadAnimalAttachment(animalUuid, upload);
      setAttachments((currentAttachments) => [attachment, ...currentAttachments]);
    } catch (error: unknown) {
      Alert.alert('Não foi possível enviar o anexo', getAttachmentErrorMessage(error, 'Tente novamente.'));
    } finally {
      setIsUploading(false);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso à câmera para tirar uma foto.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled && result.assets[0]) await uploadFile(result.assets[0]);
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
    if (!result.canceled && result.assets[0]) await uploadFile(result.assets[0]);
  };

  const pickFromFiles = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: [...supportedAttachmentMimeTypes],
    });
    if (!result.canceled && result.assets[0]) await uploadFile(result.assets[0]);
  };

  const deleteAttachment = async (attachment: Attachment) => {
    setDeletingAttachmentUuid(attachment.uuid);

    try {
      await deleteAnimalAttachment(attachment.uuid);
      setAttachments((currentAttachments) => currentAttachments.filter((item) => item.uuid !== attachment.uuid));
      setSelectedAttachment(null);
    } catch (error: unknown) {
      Alert.alert('Não foi possível remover o anexo', getAttachmentErrorMessage(error, 'Tente novamente.'));
    } finally {
      setDeletingAttachmentUuid(null);
    }
  };

  const confirmDeleteAttachment = (attachment: Attachment) => {
    Alert.alert('Remover anexo?', `"${getAttachmentName(attachment)}" será removido permanentemente.`, [
      { style: 'cancel', text: 'Cancelar' },
      { onPress: () => void deleteAttachment(attachment), style: 'destructive', text: 'Remover' },
    ]);
  };

  const openAttachment = async (attachment: Attachment) => {
    try {
      const canOpen = await Linking.canOpenURL(attachment.url);
      if (!canOpen) throw new Error('URL indisponível');
      await Linking.openURL(attachment.url);
    } catch {
      Alert.alert('Não foi possível abrir o anexo', 'Tente novamente mais tarde.');
    }
  };

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href={routes.login} />;

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScreenHeader description='Fotos, documentos e arquivos do animal' title='Anexos do Animal' />

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        <YStack gap='$4'>
          <XStack items='center' justify='space-between'>
            <YStack flex={1} gap='$1' pr='$3'>
              <Text fontSize={18} fontWeight='800' style={{ color: colors.text }}>
                Anexos ({attachments.length})
              </Text>
              <Text fontSize={13} style={{ color: colors.muted }}>
                Imagens e arquivos ficam disponíveis para toda a equipe.
              </Text>
            </YStack>
            <Pressable
              accessibilityLabel='Adicionar novo anexo'
              disabled={isUploading}
              onPress={() => setIsSourceModalOpen(true)}
              style={({ pressed }) => ({
                alignItems: 'center',
                backgroundColor: colors.primary,
                borderRadius: 12,
                flexDirection: 'row',
                gap: 6,
                opacity: isUploading ? 0.55 : pressed ? 0.76 : 1,
                paddingHorizontal: 14,
                paddingVertical: 10,
              })}
            >
              {isUploading ? (
                <ActivityIndicator color={palette.neutral0} size='small' />
              ) : (
                <PlusIcon color={palette.neutral0} size={18} weight='bold' />
              )}
              <Text fontSize={14} fontWeight='700' style={{ color: palette.neutral0 }}>
                {isUploading ? 'Enviando' : 'Adicionar'}
              </Text>
            </Pressable>
          </XStack>

          {errorMessage ? (
            <Card
              borderWidth={1}
              p='$3'
              rounded='$3'
              style={{ backgroundColor: `${colors.danger}12`, borderColor: colors.danger }}
            >
              <YStack gap='$2'>
                <Text fontSize={14} fontWeight='700' style={{ color: colors.danger }}>
                  {errorMessage}
                </Text>
                <Pressable
                  onPress={() => void loadAttachments()}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Text fontSize={14} fontWeight='800' style={{ color: colors.primary }}>
                    Tentar novamente
                  </Text>
                </Pressable>
              </YStack>
            </Card>
          ) : null}

          {isLoading ? (
            <YStack flex={1} items='center' justify='center' py='$10'>
              <ActivityIndicator color={colors.primary} size='large' />
            </YStack>
          ) : attachments.length === 0 ? (
            <YStack flex={1} gap='$4' items='center' justify='center' py='$10'>
              <XStack
                height={80}
                items='center'
                justify='center'
                rounded='$10'
                style={{ backgroundColor: `${colors.primary}1A` }}
                width={80}
              >
                <Paperclip color={colors.primary} size={40} weight='fill' />
              </XStack>
              <YStack gap='$2' items='center'>
                <Text fontSize={18} fontWeight='800' style={{ color: colors.text, textAlign: 'center' }}>
                  Nenhum documento anexado
                </Text>
                <Text fontSize={14} style={{ color: colors.muted, textAlign: 'center' }}>
                  Adicione fotos, comprovantes ou documentos em PDF.
                </Text>
              </YStack>
              <Pressable
                disabled={isUploading}
                onPress={() => setIsSourceModalOpen(true)}
                style={({ pressed }) => ({
                  alignItems: 'center',
                  backgroundColor: colors.primary,
                  borderRadius: 14,
                  opacity: isUploading ? 0.55 : pressed ? 0.76 : 1,
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                })}
              >
                <XStack gap='$2' items='center'>
                  <PlusIcon color={palette.neutral0} size={20} weight='bold' />
                  <Text fontWeight='700' style={{ color: palette.neutral0 }}>
                    Adicionar Anexo
                  </Text>
                </XStack>
              </Pressable>
            </YStack>
          ) : (
            <XStack flexWrap='wrap' gap='$3'>
              {attachments.map((attachment) => (
                <AttachmentTile
                  attachment={attachment}
                  key={attachment.uuid}
                  onPress={() => setSelectedAttachment(attachment)}
                />
              ))}
            </XStack>
          )}
        </YStack>
      </ScrollView>

      <Modal
        animationType='slide'
        onRequestClose={() => setIsSourceModalOpen(false)}
        transparent
        visible={isSourceModalOpen}
      >
        <YStack flex={1} justify='flex-end' style={{ backgroundColor: effectColors.darkModalOverlay }}>
          <Card
            borderWidth={1}
            gap='$4'
            p='$5'
            rounded='$6'
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <XStack items='center' justify='space-between'>
              <Text fontSize={18} fontWeight='800' style={{ color: colors.text }}>
                Adicionar anexo
              </Text>
              <Pressable accessibilityLabel='Fechar opções de anexos' onPress={() => setIsSourceModalOpen(false)}>
                <X color={colors.muted} size={24} />
              </Pressable>
            </XStack>
            <Text fontSize={14} style={{ color: colors.muted }}>
              Escolha de onde deseja enviar o anexo.
            </Text>
            <YStack gap='$3'>
              <Pressable
                accessibilityLabel='Câmera'
                disabled={isUploading}
                onPress={() => void takePhoto()}
                style={({ pressed }) => ({
                  alignItems: 'center',
                  backgroundColor: colors.cardMuted,
                  borderColor: colors.border,
                  borderRadius: 14,
                  borderWidth: 1,
                  flexDirection: 'row',
                  gap: 12,
                  opacity: isUploading ? 0.55 : pressed ? 0.76 : 1,
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
                    Câmera
                  </Text>
                  <Text fontSize={12} style={{ color: colors.muted }}>
                    Usar a câmera do dispositivo
                  </Text>
                </YStack>
              </Pressable>
              <Pressable
                accessibilityLabel='Escolher uma imagem da galeria'
                disabled={isUploading}
                onPress={() => void pickFromGallery()}
                style={({ pressed }) => ({
                  alignItems: 'center',
                  backgroundColor: colors.cardMuted,
                  borderColor: colors.border,
                  borderRadius: 14,
                  borderWidth: 1,
                  flexDirection: 'row',
                  gap: 12,
                  opacity: isUploading ? 0.55 : pressed ? 0.76 : 1,
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
                    Galeria
                  </Text>
                  <Text fontSize={12} style={{ color: colors.muted }}>
                    Escolher uma imagem do dispositivo
                  </Text>
                </YStack>
              </Pressable>
              <Pressable
                accessibilityLabel='Escolher um arquivo'
                disabled={isUploading}
                onPress={() => void pickFromFiles()}
                style={({ pressed }) => ({
                  alignItems: 'center',
                  backgroundColor: colors.cardMuted,
                  borderColor: colors.border,
                  borderRadius: 14,
                  borderWidth: 1,
                  flexDirection: 'row',
                  gap: 12,
                  opacity: isUploading ? 0.55 : pressed ? 0.76 : 1,
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
                  <FileIcon color={colors.primary} size={24} weight='fill' />
                </XStack>
                <YStack flex={1}>
                  <Text fontSize={15} fontWeight='700' style={{ color: colors.text }}>
                    Arquivos
                  </Text>
                  <Text fontSize={12} style={{ color: colors.muted }}>
                    Enviar imagem ou PDF de até 10 MB
                  </Text>
                </YStack>
              </Pressable>
            </YStack>
          </Card>
        </YStack>
      </Modal>

      <Modal
        animationType='fade'
        onRequestClose={() => setSelectedAttachment(null)}
        transparent
        visible={Boolean(selectedAttachment)}
      >
        <YStack flex={1} justify='center' p='$4' style={{ backgroundColor: effectColors.previewOverlay }}>
          <XStack justify='flex-end' mb='$2'>
            <Pressable
              accessibilityLabel='Fechar prévia do anexo'
              onPress={() => setSelectedAttachment(null)}
              style={{ padding: 8 }}
            >
              <X color={palette.neutral0} size={28} />
            </Pressable>
          </XStack>
          {selectedAttachment ? (
            <YStack gap='$4' items='center' justify='center'>
              {isImageAttachment(selectedAttachment) ? (
                <Image
                  resizeMode='contain'
                  source={{ uri: selectedAttachment.url }}
                  style={{ height: 320, width: '100%' }}
                />
              ) : (
                <YStack gap='$3' items='center' p='$6'>
                  <FileIcon color={palette.neutral0} size={72} weight='fill' />
                  <Text fontSize={18} fontWeight='800' style={{ color: palette.neutral0, textAlign: 'center' }}>
                    {getAttachmentName(selectedAttachment)}
                  </Text>
                  <Text fontSize={14} style={{ color: palette.neutral300 }}>
                    {selectedAttachment.type.toLocaleUpperCase('pt-BR')}
                  </Text>
                </YStack>
              )}
              <YStack gap='$3' width='100%'>
                <Pressable
                  onPress={() => void openAttachment(selectedAttachment)}
                  style={({ pressed }) => ({
                    alignItems: 'center',
                    backgroundColor: colors.primary,
                    borderRadius: 14,
                    opacity: pressed ? 0.78 : 1,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  })}
                >
                  <Text fontWeight='800' style={{ color: palette.neutral0 }}>
                    Abrir anexo
                  </Text>
                </Pressable>
                <Pressable
                  disabled={deletingAttachmentUuid === selectedAttachment.uuid}
                  onPress={() => confirmDeleteAttachment(selectedAttachment)}
                  style={({ pressed }) => ({
                    alignItems: 'center',
                    backgroundColor: `${colors.danger}22`,
                    borderColor: colors.danger,
                    borderRadius: 14,
                    borderWidth: 1,
                    opacity: deletingAttachmentUuid === selectedAttachment.uuid ? 0.55 : pressed ? 0.78 : 1,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  })}
                >
                  <XStack gap='$2' items='center'>
                    {deletingAttachmentUuid === selectedAttachment.uuid ? (
                      <ActivityIndicator color={colors.danger} size='small' />
                    ) : (
                      <Trash color={colors.danger} size={20} weight='bold' />
                    )}
                    <Text fontWeight='800' style={{ color: colors.danger }}>
                      Remover anexo
                    </Text>
                  </XStack>
                </Pressable>
              </YStack>
            </YStack>
          ) : null}
        </YStack>
      </Modal>
    </SafeAreaView>
  );
}
