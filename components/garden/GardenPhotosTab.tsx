import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
  ActivityIndicator,
  TextInput,
  FlatList,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import PhotoEvaluationService from "@/service/api/photo-evaluations.service";
import {
  PhotoEvaluationWithRelations,
  PhotoEvaluationStatsResponse,
  PhotoEvaluationFormData,
  PhotoUploadProgress,
  PlantGrowthStage,
} from "@/types/activities/photo-evaluations.type";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import env from "@/config/environment";

interface GardenPhotosTabProps {
  gardenId: string | number;
}

const GardenPhotosTab: React.FC<GardenPhotosTabProps> = ({ gardenId }) => {
  const theme = useAppTheme();
  const { width: windowWidth } = useWindowDimensions();

  // States
  const [photos, setPhotos] = useState<PhotoEvaluationWithRelations[]>([]);
  const [stats, setStats] = useState<PhotoEvaluationStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<PhotoUploadProgress | null>(null);
  
  // Modal states
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoEvaluationWithRelations | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  
  // Upload form states
  const [uploadForm, setUploadForm] = useState({
    taskId: 1, // Default task ID
    plantName: "",
    plantGrowStage: PlantGrowthStage.VEGETATIVE,
    notes: "",
  });
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerResult | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Calculate photo size
  const numColumns = 2;
  const gap = 12;
  const photoSize = (windowWidth - 32 - (numColumns - 1) * gap) / numColumns;

  // Load data functions
  const loadPhotos = useCallback(async (pageNum = 1, append = false) => {
    try {
      const response = await PhotoEvaluationService.getPhotoEvaluationsByGarden(
        gardenId,
        pageNum,
        10
      );
      
      if (append) {
        setPhotos(prev => [...prev, ...response.data]);
      } else {
        setPhotos(response.data);
      }
      
      setHasMore(response.data.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error("Error loading photos:", error);
    }
  }, [gardenId]);

  const loadStats = useCallback(async () => {
    try {
      const statsData = await PhotoEvaluationService.getPhotoEvaluationStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadPhotos(), loadStats()]);
    setLoading(false);
  }, [loadPhotos, loadStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Event handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await loadPhotos(page + 1, true);
    }
  }, [hasMore, loading, page, loadPhotos]);

  // Image picker functions
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Quyền truy cập", "Cần quyền truy cập thư viện ảnh để tải ảnh lên.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result);
      setUploadModalVisible(true);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Quyền truy cập", "Cần quyền truy cập camera để chụp ảnh.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result);
      setUploadModalVisible(true);
    }
  };

  // Upload functions
  const uploadPhoto = async () => {
    if (!selectedImage?.assets?.[0]) return;

    const asset = selectedImage.assets[0];
    const validation = PhotoEvaluationService.validateImageFile({
      size: asset.fileSize || 0,
      type: asset.type || "image/jpeg",
    } as File);

    if (!validation.isValid) {
      Alert.alert("Lỗi", validation.error);
      return;
    }

    setUploading(true);
    setUploadProgress(null);

    try {
      const formData: PhotoEvaluationFormData = {
        ...uploadForm,
        gardenId: Number(gardenId),
        image: {
          uri: asset.uri,
          type: asset.type || "image/jpeg",
          name: asset.fileName || `photo_${Date.now()}.jpg`,
        } as any,
      };

      const result = await PhotoEvaluationService.createPhotoEvaluation(
        formData,
        (progress) => setUploadProgress(progress)
      );

      if (result.success) {
        Alert.alert("Thành công", "Tải ảnh lên thành công!");
        setUploadModalVisible(false);
        setSelectedImage(null);
        setUploadForm({
          taskId: 1,
          plantName: "",
          plantGrowStage: PlantGrowthStage.VEGETATIVE,
          notes: "",
        });
        await loadData();
      } else {
        Alert.alert("Lỗi", result.error || "Có lỗi xảy ra khi tải ảnh lên");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tải ảnh lên");
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const deletePhoto = async (photoId: number) => {
    Alert.alert(
      "Xóa ảnh",
      "Bạn có chắc chắn muốn xóa ảnh này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            const success = await PhotoEvaluationService.deletePhotoEvaluation(photoId);
            if (success) {
              setPhotos(prev => prev.filter(p => p.id !== photoId));
              setModalVisible(false);
              Alert.alert("Thành công", "Đã xóa ảnh thành công");
            } else {
              Alert.alert("Lỗi", "Không thể xóa ảnh");
            }
          },
        },
      ]
    );
  };

  // Render components
  const renderStats = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={[styles.statsTitle, { color: theme.text }]}>Thống kê đánh giá ảnh</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Tổng ảnh</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.statNumber, { color: "#22c55e" }]}>{stats.healthy}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Khỏe mạnh</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.statNumber, { color: "#ef4444" }]}>{stats.unhealthy}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Có vấn đề</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.statNumber, { color: theme.accent }]}>
              {Math.round(stats.avgConfidence * 100)}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Độ tin cậy</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPhotoItem = ({ item }: { item: PhotoEvaluationWithRelations }) => (
    <TouchableOpacity
      style={[styles.photoItem, { width: photoSize, height: photoSize }]}
      onPress={() => {
        setSelectedPhoto(item);
        setModalVisible(true);
      }}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: `${env.apiUrl}${item.photoUrl}` }}
        style={styles.photoThumbnail}
        contentFit="cover"
      />
      
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.photoGradient}
      >
        <View style={styles.photoInfo}>
          {item.plantName && (
            <Text style={styles.plantName} numberOfLines={1}>
              {item.plantName}
            </Text>
          )}
          <Text style={styles.photoDate}>
            {PhotoEvaluationService.formatRelativeTime(item.createdAt)}
          </Text>
        </View>
      </LinearGradient>

      {item.aiFeedback && (
        <View style={[
          styles.aiBadge,
          { backgroundColor: PhotoEvaluationService.getConfidenceLevelColor(item.confidence) }
        ]}>
          <MaterialCommunityIcons name="robot" size={12} color="#fff" />
        </View>
      )}

      {item.aiFeedback && (
        <View style={[
          styles.healthBadge,
          {
            backgroundColor: item.aiFeedback.toLowerCase().includes("healthy") 
              ? "#22c55e" 
              : "#ef4444"
          }
        ]}>
          <Ionicons 
            name={item.aiFeedback.toLowerCase().includes("healthy") ? "checkmark" : "warning"} 
            size={10} 
            color="#fff" 
          />
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
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.borderLight }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Chi tiết ảnh</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => deletePhoto(selectedPhoto.id)}
                >
                  <Ionicons name="trash" size={20} color="#ef4444" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.modalBody}>
              <Image
                source={{ uri: `${env.apiUrl}${selectedPhoto.photoUrl}` }}
                style={styles.modalImage}
                contentFit="contain"
              />

              <View style={styles.infoSection}>
                <Text style={[styles.infoDate, { color: theme.textSecondary }]}>
                  {PhotoEvaluationService.formatDate(selectedPhoto.createdAt)}
                </Text>
                
                {selectedPhoto.plantName && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.text }]}>Tên cây:</Text>
                    <Text style={[styles.infoValue, { color: theme.textSecondary }]}>
                      {selectedPhoto.plantName}
                    </Text>
                  </View>
                )}

                {selectedPhoto.plantGrowStage && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.text }]}>Giai đoạn:</Text>
                    <Text style={[styles.infoValue, { color: theme.textSecondary }]}>
                      {PhotoEvaluationService.getPlantGrowthStageText(selectedPhoto.plantGrowStage)}
                    </Text>
                  </View>
                )}
              </View>

              {selectedPhoto.aiFeedback && (
                <View style={[styles.aiFeedbackContainer, { backgroundColor: theme.backgroundSecondary }]}>
                  <View style={styles.aiFeedbackHeader}>
                    <MaterialCommunityIcons
                      name="robot"
                      size={20}
                      color={theme.primary}
                    />
                    <Text style={[styles.aiFeedbackTitle, { color: theme.primary }]}>
                      Đánh giá AI
                    </Text>
                    {selectedPhoto.confidence && (
                      <View style={[
                        styles.confidenceBadge,
                        { backgroundColor: PhotoEvaluationService.getConfidenceLevelColor(selectedPhoto.confidence) }
                      ]}>
                        <Text style={styles.confidenceText}>
                          {Math.round(selectedPhoto.confidence * 100)}%
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={[styles.aiFeedbackText, { color: theme.text }]}>
                    {selectedPhoto.aiFeedback}
                  </Text>
                  
                  <Text style={[styles.healthStatus, { color: theme.textSecondary }]}>
                    Tình trạng: {PhotoEvaluationService.getHealthStatusText(
                      selectedPhoto.aiFeedback, 
                      selectedPhoto.confidence
                    )}
                  </Text>
                </View>
              )}

              {selectedPhoto.notes && (
                <View style={styles.notesContainer}>
                  <Text style={[styles.notesTitle, { color: theme.text }]}>Ghi chú:</Text>
                  <Text style={[styles.notesText, { color: theme.textSecondary }]}>
                    {selectedPhoto.notes}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderUploadModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={uploadModalVisible}
      onRequestClose={() => !uploading && setUploadModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.borderLight }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Tải ảnh lên</Text>
            {!uploading && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setUploadModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.modalBody}>
            {selectedImage?.assets?.[0] && (
              <Image
                source={{ uri: selectedImage.assets[0].uri }}
                style={styles.previewImage}
                contentFit="cover"
              />
            )}

            {uploading && uploadProgress && (
              <View style={styles.progressContainer}>
                <Text style={[styles.progressText, { color: theme.text }]}>
                  Đang tải lên... {uploadProgress.percentage}%
                </Text>
                <View style={[styles.progressBar, { backgroundColor: theme.borderLight }]}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        backgroundColor: theme.primary,
                        width: `${uploadProgress.percentage}%`
                      }
                    ]} 
                  />
                </View>
              </View>
            )}

            {!uploading && (
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Tên cây (tùy chọn)</Text>
                  <TextInput
                    style={[styles.textInput, { 
                      backgroundColor: theme.backgroundSecondary,
                      color: theme.text,
                      borderColor: theme.borderLight
                    }]}
                    value={uploadForm.plantName}
                    onChangeText={(text) => setUploadForm(prev => ({ ...prev, plantName: text }))}
                    placeholder="Nhập tên cây..."
                    placeholderTextColor={theme.textTertiary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Ghi chú (tùy chọn)</Text>
                  <TextInput
                    style={[styles.textArea, { 
                      backgroundColor: theme.backgroundSecondary,
                      color: theme.text,
                      borderColor: theme.borderLight
                    }]}
                    value={uploadForm.notes}
                    onChangeText={(text) => setUploadForm(prev => ({ ...prev, notes: text }))}
                    placeholder="Nhập ghi chú..."
                    placeholderTextColor={theme.textTertiary}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.uploadButton, { backgroundColor: theme.primary }]}
                  onPress={uploadPhoto}
                >
                  <Text style={styles.uploadButtonText}>Tải lên và đánh giá</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {renderStats()}

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={takePhoto}
          >
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Chụp ảnh</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.accent }]}
            onPress={pickImage}
          >
            <Ionicons name="images" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Chọn ảnh</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Đang tải ảnh...
            </Text>
          </View>
        ) : photos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="image-off"
              size={64}
              color={theme.textTertiary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Chưa có ảnh nào
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
              Hãy chụp ảnh vườn để AI phân tích tình trạng cây trồng
            </Text>
          </View>
        ) : (
          <FlatList
            data={photos}
            renderItem={renderPhotoItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={numColumns}
            columnWrapperStyle={styles.photoRow}
            contentContainerStyle={styles.photosList}
            scrollEnabled={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={
              hasMore ? (
                <View style={styles.loadMoreContainer}>
                  <ActivityIndicator size="small" color={theme.primary} />
                </View>
              ) : null
            }
          />
        )}
      </ScrollView>

      {renderPhotoModal()}
      {renderUploadModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statNumber: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    textAlign: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  photosList: {
    paddingBottom: 20,
  },
  photoRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  photoItem: {
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
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
  },
  photoInfo: {
    padding: 8,
  },
  plantName: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter-Medium",
    marginBottom: 2,
  },
  photoDate: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter-Regular",
    opacity: 0.8,
  },
  aiBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  healthBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "85%",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
  },
  modalActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    padding: 4,
  },
  modalBody: {
    maxHeight: 500,
  },
  modalImage: {
    width: "100%",
    height: 200,
  },
  infoSection: {
    padding: 16,
  },
  infoDate: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    flex: 1,
  },
  aiFeedbackContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  aiFeedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  aiFeedbackTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter-Bold",
  },
  aiFeedbackText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    lineHeight: 20,
    marginBottom: 8,
  },
  healthStatus: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
  notesContainer: {
    margin: 16,
  },
  notesTitle: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    lineHeight: 20,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  progressContainer: {
    padding: 16,
  },
  progressText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginBottom: 8,
    textAlign: "center",
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter-Regular",
    minHeight: 80,
    textAlignVertical: "top",
  },
  uploadButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
});

export default GardenPhotosTab;
