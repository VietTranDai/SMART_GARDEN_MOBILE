import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Platform,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import { GardenPhoto } from "@/types/gardens/garden.types";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import env from "@/config/environment";

interface GardenPhotoGalleryProps {
  photos: GardenPhoto[];
  gardenId: number | string;
  onUploadPhoto?: (
    gardenId: number | string,
    formData: FormData
  ) => Promise<any>;
  isLoading?: boolean;
}

const { width } = Dimensions.get("window");
const PHOTO_SIZE = (width - 48) / 2; // 2 columns with padding

const GardenPhotoGallery: React.FC<GardenPhotoGalleryProps> = ({
  photos,
  gardenId,
  onUploadPhoto,
  isLoading = false,
}) => {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const [selectedPhoto, setSelectedPhoto] = useState<GardenPhoto | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePhotoPress = (photo: GardenPhoto) => {
    setSelectedPhoto(photo);
  };

  const handleCloseModal = () => {
    setSelectedPhoto(null);
  };

  const handleUploadPhoto = async () => {
    if (!onUploadPhoto) return;

    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        console.log("Không có quyền truy cập thư viện ảnh");
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploading(true);

        // Create form data for upload
        const formData = new FormData();
        formData.append("photo", {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: "garden-photo.jpg",
        } as any);

        // Call upload function
        await onUploadPhoto(gardenId, formData);
      }
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên:", error);
    } finally {
      setUploading(false);
    }
  };

  // Format date display
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
      style={styles.photoItem}
      onPress={() => handlePhotoPress(item)}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: `${env.apiUrl}${item.photoUrl}` }}
        style={styles.photoThumbnail}
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hình ảnh vườn</Text>
        {onUploadPhoto && (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUploadPhoto}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <>
                <Ionicons name="camera" size={16} color={theme.primary} />
                <Text style={styles.uploadButtonText}>Tải lên</Text>
              </>
            )}
          </TouchableOpacity>
        )}
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
          {onUploadPhoto && (
            <TouchableOpacity
              style={styles.emptyUploadButton}
              onPress={handleUploadPhoto}
            >
              <Text style={styles.emptyUploadButtonText}>
                Tải ảnh đầu tiên lên
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhotoItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.photoGrid}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.photoList}
        />
      )}

      {/* Photo Detail Modal */}
      <Modal
        visible={!!selectedPhoto}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseModal}
          >
            <Ionicons name="close-circle" size={34} color="#fff" />
          </TouchableOpacity>

          {selectedPhoto && (
            <View style={styles.modalContent}>
              <Image
                source={{ uri: `${env.apiUrl}${selectedPhoto.photoUrl}` }}
                style={styles.modalImage}
                resizeMode="contain"
              />

              <View style={styles.photoInfo}>
                <Text style={styles.photoInfoDate}>
                  {formatDate(selectedPhoto.createdAt)}
                </Text>

                {selectedPhoto.plantGrowStage && (
                  <View style={styles.photoStage}>
                    <MaterialCommunityIcons
                      name="sprout"
                      size={16}
                      color={theme.success}
                    />
                    <Text style={styles.photoStageText}>
                      {selectedPhoto.plantGrowStage}
                    </Text>
                  </View>
                )}

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
                        Độ tin cậy: {Math.round(selectedPhoto.confidence * 100)}
                        %
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
          )}
        </View>
      </Modal>
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
    uploadButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.primaryLight,
      borderRadius: 16,
    },
    uploadButtonText: {
      marginLeft: 6,
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.primary,
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
    emptyUploadButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.primary,
      borderRadius: 16,
    },
    emptyUploadButtonText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: "#fff",
    },
    photoList: {
      paddingBottom: 16,
    },
    photoGrid: {
      justifyContent: "space-between",
      marginBottom: 8,
    },
    photoItem: {
      width: PHOTO_SIZE,
      height: PHOTO_SIZE,
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 16,
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
    closeButton: {
      position: "absolute",
      top: 40,
      right: 20,
      zIndex: 10,
    },
    modalContent: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    modalImage: {
      width: "100%",
      height: "60%",
    },
    photoInfo: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.card,
      padding: 16,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: "40%",
    },
    photoInfoDate: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
      marginBottom: 8,
    },
    photoStage: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    photoStageText: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginLeft: 6,
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
