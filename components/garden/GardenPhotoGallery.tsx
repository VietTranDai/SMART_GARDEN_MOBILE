import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  Dimensions,
  ActivityIndicator,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { GardenPhoto } from "@/types/gardens/garden.types";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import env from "@/config/environment";

interface GardenPhotoGalleryProps {
  photos: GardenPhoto[];
  gardenId: number | string;
  onUploadRequested: () => Promise<void>;
  isLoading?: boolean;
}

const { width } = Dimensions.get("window");
const PHOTO_SIZE = (width - 48) / 2; // 2 columns with padding

const GardenPhotoGallery: React.FC<GardenPhotoGalleryProps> = ({
  photos,
  gardenId,
  onUploadRequested,
  isLoading = false,
}) => {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { width: windowWidth } = useWindowDimensions();

  const [selectedPhoto, setSelectedPhoto] = useState<GardenPhoto | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Calculate photo thumbnail size
  const numColumns = 3;
  const gap = 8;
  const photoSize = (windowWidth - 32 - (numColumns - 1) * gap) / numColumns;

  const handlePhotoPress = (photo: GardenPhoto) => {
    setSelectedPhoto(photo);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setSelectedPhoto(null);
    setModalVisible(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderPhotoItem = ({ item }: { item: GardenPhoto }) => (
    <TouchableOpacity
      style={[styles.photoItem, { width: photoSize, height: photoSize }]}
      onPress={() => handlePhotoPress(item)}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: `${env.apiUrl}${item.photoUrl}` }}
        style={styles.photoThumbnail}
        contentFit="cover"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.photoGradient}
      >
        <Text style={styles.photoDate}>{formatDate(item.createdAt)}</Text>
      </LinearGradient>

      {item.aiFeedback && (
        <View style={styles.aiBadge}>
          <MaterialCommunityIcons name="robot" size={12} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderPhotoModal = () => {
    if (!selectedPhoto) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết ảnh</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseModal}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <Image
              source={{ uri: `${env.apiUrl}${selectedPhoto.photoUrl}` }}
              style={styles.modalImage}
              contentFit="contain"
            />

            <View style={styles.photoInfo}>
              <Text style={styles.photoInfoDate}>
                {formatDate(selectedPhoto.createdAt)}
              </Text>

              {selectedPhoto.aiFeedback && (
                <View style={styles.aiFeedbackContainer}>
                  <View style={styles.aiFeedbackHeader}>
                    <MaterialCommunityIcons
                      name="robot"
                      size={18}
                      color={theme.primary}
                    />
                    <Text style={styles.aiFeedbackTitle}>Nhận xét AI</Text>
                  </View>
                  <Text style={styles.aiFeedbackText}>
                    {selectedPhoto.aiFeedback}
                  </Text>
                  {selectedPhoto.confidence !== undefined && (
                    <Text style={styles.confidenceText}>
                      Độ tin cậy: {Math.round(selectedPhoto.confidence * 100)}%
                    </Text>
                  )}
                </View>
              )}

              {selectedPhoto.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesTitle}>Ghi chú:</Text>
                  <Text style={styles.notesText}>{selectedPhoto.notes}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hình ảnh vườn</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onUploadRequested}
          >
            <Ionicons name="camera" size={20} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onUploadRequested}
          >
            <Ionicons name="image" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Đang tải hình ảnh...</Text>
        </View>
      ) : photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="image-off"
            size={40}
            color={theme.textTertiary}
          />
          <Text style={styles.emptyText}>Chưa có hình ảnh nào</Text>
          <Text style={styles.emptySubtext}>
            Hãy chụp ảnh vườn của bạn để AI phân tích
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={onUploadRequested}
          >
            <Text style={styles.emptyButtonText}>Chụp ảnh ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhotoItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          columnWrapperStyle={{ gap }}
          contentContainerStyle={styles.photoList}
          showsVerticalScrollIndicator={false}
          initialNumToRender={9}
          maxToRenderPerBatch={9}
          windowSize={5}
        />
      )}

      {renderPhotoModal()}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      ...Platform.select({
        ios: {
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
    },
    actions: {
      flexDirection: "row",
    },
    actionButton: {
      padding: 8,
      marginLeft: 8,
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: 30,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: 30,
    },
    emptyText: {
      marginTop: 12,
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginBottom: 16,
    },
    emptySubtext: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginTop: 4,
      textAlign: "center",
    },
    emptyButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      marginTop: 16,
    },
    emptyButtonText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.white,
    },
    photoList: {
      paddingBottom: 16,
    },
    photoItem: {
      borderRadius: 8,
      overflow: "hidden",
      marginBottom: 8,
    },
    photoThumbnail: {
      width: "100%",
      height: "100%",
    },
    photoGradient: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
      justifyContent: "flex-end",
      padding: 8,
    },
    photoDate: {
      color: "#fff",
      fontSize: 12,
      fontFamily: "Inter-Medium",
    },
    aiBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: theme.primary,
      borderRadius: 12,
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.9)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: "90%",
      maxHeight: "90%",
      backgroundColor: theme.card,
      borderRadius: 16,
      overflow: "hidden",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
    },
    closeButton: {
      padding: 4,
    },
    modalImage: {
      width: "100%",
      height: 250,
    },
    photoInfo: {
      padding: 16,
    },
    photoInfoDate: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginBottom: 16,
    },
    aiFeedbackContainer: {
      backgroundColor: theme.backgroundSecondary,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    aiFeedbackHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    aiFeedbackTitle: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.primary,
      marginLeft: 6,
    },
    aiFeedbackText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.text,
      marginBottom: 6,
    },
    confidenceText: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    notesContainer: {
      marginTop: 12,
    },
    notesTitle: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 4,
    },
    notesText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
  });

export default GardenPhotoGallery;
