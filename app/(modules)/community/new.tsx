import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons, AntDesign, Entypo, MaterialIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import * as ImagePicker from "expo-image-picker";
import { communityService, gardenService } from "@/service/api";
import { Garden, Tag, CreatePostDto } from "@/types";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface PostImage {
  uri: string;
  type: string;
  name: string;
  id?: string;
  width?: number;
  height?: number;
}

// Skeleton loader for form
const FormSkeleton = ({ theme }: { theme: any }) => (
  <View style={{ padding: 16 }}>
    <ContentLoader
      speed={2}
      width={SCREEN_WIDTH - 32}
      height={500}
      backgroundColor={theme.backgroundSecondary}
      foregroundColor={theme.cardAlt}
    >
      {/* Garden selector */}
      <Rect x={0} y={0} rx={8} ry={8} width={SCREEN_WIDTH - 32} height={50} />

      {/* Title input */}
      <Rect x={0} y={70} rx={4} ry={4} width={SCREEN_WIDTH - 32} height={60} />

      {/* Content input */}
      <Rect
        x={0}
        y={150}
        rx={4}
        ry={4}
        width={SCREEN_WIDTH - 32}
        height={120}
      />

      {/* Tags section */}
      <Rect x={0} y={290} rx={4} ry={4} width={100} height={24} />
      <Rect x={0} y={324} rx={20} ry={20} width={80} height={30} />
      <Rect x={90} y={324} rx={20} ry={20} width={100} height={30} />

      {/* Popular tags */}
      <Rect x={0} y={374} rx={4} ry={4} width={150} height={20} />
      <Rect x={0} y={404} rx={16} ry={16} width={70} height={32} />
      <Rect x={80} y={404} rx={16} ry={16} width={90} height={32} />
      <Rect x={180} y={404} rx={16} ry={16} width={60} height={32} />
    </ContentLoader>
  </View>
);

export default function NewPostScreen() {
  const theme = useAppTheme();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<PostImage[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [selectedGarden, setSelectedGarden] = useState<Garden | null>(null);
  const [showGardenSelector, setShowGardenSelector] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [popularTags, setPopularTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch gardens and tags
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const [gardensData, tagsData] = await Promise.all([
          gardenService.getGardens(),
          communityService.getTags(),
        ]);

        setGardens(gardensData);
        setPopularTags(tagsData);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter tags based on input
  useEffect(() => {
    if (!tagInput.trim()) {
      setFilteredTags([]);
      return;
    }

    const filtered = popularTags.filter(
      (tag) =>
        tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
        !selectedTags.some((selected) => selected.id === tag.id)
    );
    setFilteredTags(filtered.slice(0, 5)); // Limit to 5 suggestions
  }, [tagInput, popularTags, selectedTags]);

  // Add a tag to the post
  const handleAddTag = (tag: Tag) => {
    if (
      !selectedTags.some((t) => t.id === tag.id) &&
      selectedTags.length < 5 // Limit to 5 tags
    ) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagInput("");
  };

  // Add a new custom tag
  const handleAddCustomTag = () => {
    if (!tagInput.trim() || selectedTags.length >= 5) return;

    // Create a temporary tag (in a real app you might want to create this through API)
    const newTag: Tag = {
      id: Date.now(), // Use a number instead of string for id
      name: tagInput.trim(),
    };

    setSelectedTags([...selectedTags, newTag]);
    setTagInput("");
  };

  // Remove a tag from the post
  const handleRemoveTag = (tagId: string | number) => {
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId));
  };

  // Pick an image from the device gallery
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Cần quyền truy cập",
        "Vui lòng cho phép truy cập thư viện ảnh để thêm hình ảnh vào bài viết."
      );
      return;
    }

    try {
      setLoadingImage(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5 - images.length,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Format images for display and upload
        const newImages: PostImage[] = result.assets.map((asset) => ({
          uri: asset.uri,
          type: "image/jpeg",
          name: asset.uri.split("/").pop() || `image_${Date.now()}.jpg`,
          id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          width: asset.width,
          height: asset.height,
        }));

        // Show success toast
        Alert.alert(
          "Thành công",
          `Đã thêm ${newImages.length} hình ảnh.`,
          [{ text: "OK" }],
          { cancelable: true }
        );

        setImages([...images, ...newImages]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Lỗi", "Không thể tải hình ảnh. Vui lòng thử lại.");
    } finally {
      setLoadingImage(false);
    }
  };

  // Remove an image from the post
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Reorder images with drag and drop
  const handleDragEnd = ({ data }: { data: PostImage[] }) => {
    setImages(data);
  };

  // Form validation
  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert("Thiếu tiêu đề", "Vui lòng thêm tiêu đề cho bài viết");
      return false;
    }

    if (!content.trim()) {
      Alert.alert("Thiếu nội dung", "Vui lòng thêm nội dung cho bài viết");
      return false;
    }

    return true;
  };

  // Toggle preview mode
  const togglePreview = () => {
    if (showPreview) {
      setShowPreview(false);
    } else {
      if (validateForm()) {
        setShowPreview(true);
      }
    }
  };

  // Submit the post
  const handleSubmitPost = async () => {
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      // Using FormData for image uploads
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());

      // Add tag IDs as strings (to match the updated CreatePostDto)
      selectedTags.forEach((tag) => {
        formData.append("tagIds", tag.id.toString());
      });

      // Add garden ID if selected
      if (selectedGarden?.id) {
        formData.append("gardenId", selectedGarden.id.toString());
      }

      // Add plant information if available
      // You could add these fields to your form if needed
      // formData.append("plantName", plantName);
      // formData.append("plantGrowStage", plantGrowStage);

      // Add images
      images.forEach((image, index) => {
        formData.append(`images`, {
          uri: image.uri,
          type: image.type,
          name: image.name,
        } as any);
      });

      // Create the post
      const newPost = await communityService.createPost(formData);

      Alert.alert(
        "Thành công",
        "Bài viết của bạn đã được đăng thành công!",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err) {
      console.error("Failed to create post:", err);
      Alert.alert("Lỗi", "Không thể tạo bài viết. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Preview component
  const PreviewPost = () => (
    <ScrollView style={styles.previewContainer}>
      <View style={[styles.previewHeader, { backgroundColor: theme.card }]}>
        <Text style={[styles.previewTitle, { color: theme.text }]}>
          Xem trước
        </Text>
        <TouchableOpacity onPress={togglePreview}>
          <Ionicons name="close" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.postCard, { backgroundColor: theme.card }]}>
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=1" }}
              style={styles.avatar}
            />
            <View>
              <Text style={[styles.userName, { color: theme.text }]}>Bạn</Text>
              <Text style={[styles.postDate, { color: theme.textSecondary }]}>
                Bản nháp
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.postTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.postContent, { color: theme.text }]}>
          {content}
        </Text>

        {images.length > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image.uri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        {selectedTags.length > 0 && (
          <View style={styles.tagsContainer}>
            {selectedTags.map((tag) => (
              <View
                key={tag.id}
                style={[
                  styles.tagChip,
                  { backgroundColor: theme.primary + "20" },
                ]}
              >
                <Text style={[styles.tagChipText, { color: theme.primary }]}>
                  #{tag.name}
                </Text>
              </View>
            ))}
          </View>
        )}

        {selectedGarden && (
          <View
            style={[
              styles.gardenInfoContainer,
              { borderTopColor: theme.borderLight },
            ]}
          >
            <Ionicons name="leaf" size={16} color={theme.primary} />
            <Text
              style={[styles.gardenInfoText, { color: theme.textSecondary }]}
            >
              {selectedGarden.name}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.publishButton, { backgroundColor: theme.primary }]}
        onPress={handleSubmitPost}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.publishButtonText}>Đăng bài viết</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  // Main form component
  const PostForm = () => (
    <>
      <ScrollView style={styles.scrollView}>
        <View style={styles.editorContainer}>
          {/* Garden Selector */}
          <TouchableOpacity
            style={[styles.gardenSelector, { backgroundColor: theme.cardAlt }]}
            onPress={() => setShowGardenSelector(!showGardenSelector)}
          >
            <Ionicons
              name="leaf"
              size={18}
              color={theme.primary}
              style={styles.gardenIcon}
            />
            <Text style={[styles.gardenText, { color: theme.text }]}>
              {selectedGarden
                ? `Đăng trong: ${selectedGarden.name}`
                : "Chọn một khu vườn (tùy chọn)"}
            </Text>
            <Ionicons
              name={showGardenSelector ? "chevron-up" : "chevron-down"}
              size={18}
              color={theme.textSecondary}
            />
          </TouchableOpacity>

          {showGardenSelector && (
            <View
              style={[styles.gardenOptions, { backgroundColor: theme.cardAlt }]}
            >
              {gardens.map((garden) => (
                <TouchableOpacity
                  key={garden.id}
                  style={[
                    styles.gardenOption,
                    selectedGarden?.id === garden.id && {
                      backgroundColor: theme.primary + "20",
                    },
                  ]}
                  onPress={() => {
                    setSelectedGarden(garden);
                    setShowGardenSelector(false);
                  }}
                >
                  <Text
                    style={[
                      styles.gardenOptionText,
                      {
                        color:
                          selectedGarden?.id === garden.id
                            ? theme.primary
                            : theme.text,
                      },
                    ]}
                  >
                    {garden.name}
                  </Text>
                  {selectedGarden?.id === garden.id && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={theme.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
              {selectedGarden && (
                <TouchableOpacity
                  style={[
                    styles.gardenOption,
                    { borderTopWidth: 1, borderTopColor: theme.borderLight },
                  ]}
                  onPress={() => {
                    setSelectedGarden(null);
                    setShowGardenSelector(false);
                  }}
                >
                  <Text
                    style={[styles.gardenOptionText, { color: theme.error }]}
                  >
                    Bỏ chọn
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Post Title */}
          <TextInput
            style={[
              styles.titleInput,
              { color: theme.text, borderBottomColor: theme.borderLight },
            ]}
            placeholder="Tiêu đề bài viết"
            placeholderTextColor={theme.textTertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          {/* Post Content */}
          <TextInput
            style={[styles.contentInput, { color: theme.text }]}
            placeholder="Chia sẻ kinh nghiệm làm vườn của bạn hoặc đặt câu hỏi..."
            placeholderTextColor={theme.textTertiary}
            multiline
            value={content}
            onChangeText={setContent}
          />

          {/* Image Preview */}
          {images.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              <View style={styles.sectionTitleRow}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Hình ảnh ({images.length}/5)
                </Text>
                <Text
                  style={[
                    styles.sectionSubtitle,
                    { color: theme.textSecondary },
                  ]}
                >
                  Giữ & kéo để sắp xếp
                </Text>
              </View>

              <DraggableFlatList
                data={images}
                renderItem={({ item, drag, isActive }) => (
                  <TouchableOpacity
                    style={[
                      styles.imagePreview,
                      isActive && {
                        opacity: 0.7,
                        transform: [{ scale: 1.05 }],
                      },
                    ]}
                    onLongPress={drag}
                    disabled={isActive}
                  >
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.previewImage}
                    />
                    <TouchableOpacity
                      style={[
                        styles.removeImageButton,
                        { backgroundColor: theme.error },
                      ]}
                      onPress={() => {
                        // Find the index based on id or uri
                        const index = images.findIndex(
                          (img) =>
                            (item.id && img.id === item.id) ||
                            img.uri === item.uri
                        );
                        if (index !== -1) handleRemoveImage(index);
                      }}
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.dragHandle}>
                      <MaterialIcons
                        name="drag-handle"
                        size={18}
                        color={theme.textSecondary}
                      />
                    </View>

                    {/* Image dimensions badge */}
                    {item.width && item.height && (
                      <View style={styles.dimensionsBadge}>
                        <Text style={styles.dimensionsText}>
                          {item.width}×{item.height}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id || item.uri}
                horizontal
                onDragEnd={handleDragEnd}
                autoscrollSpeed={5}
                activationDistance={10}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imagePreviewListContainer}
              />
            </View>
          )}

          {/* Tags Input */}
          <View style={styles.tagsContainer}>
            <View style={styles.tagsHeader}>
              <Text style={[styles.tagsTitle, { color: theme.text }]}>
                Tags
              </Text>
              <Text style={[styles.tagsCount, { color: theme.textSecondary }]}>
                {selectedTags.length}/5
              </Text>
            </View>

            <View style={styles.selectedTagsContainer}>
              {selectedTags.map((tag) => (
                <View
                  key={tag.id}
                  style={[
                    styles.tagChip,
                    { backgroundColor: theme.primary + "20" },
                  ]}
                >
                  <Text style={[styles.tagChipText, { color: theme.primary }]}>
                    #{tag.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveTag(tag.id)}
                    style={styles.removeTagButton}
                  >
                    <Ionicons
                      name="close-circle"
                      size={16}
                      color={theme.primary}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {selectedTags.length < 5 && (
              <View>
                <View
                  style={[
                    styles.tagInputContainer,
                    { backgroundColor: theme.backgroundSecondary },
                  ]}
                >
                  <TextInput
                    style={[styles.tagInput, { color: theme.text }]}
                    placeholder="Thêm thẻ (ví dụ: Cà chua, Giúp đỡ)"
                    placeholderTextColor={theme.textTertiary}
                    value={tagInput}
                    onChangeText={setTagInput}
                    onSubmitEditing={handleAddCustomTag}
                  />
                  <TouchableOpacity
                    style={[
                      styles.addTagButton,
                      {
                        backgroundColor: tagInput.trim()
                          ? theme.primary
                          : theme.backgroundSecondary,
                      },
                    ]}
                    onPress={handleAddCustomTag}
                    disabled={!tagInput.trim()}
                  >
                    <Ionicons
                      name="add"
                      size={20}
                      color={tagInput.trim() ? "#fff" : theme.textTertiary}
                    />
                  </TouchableOpacity>
                </View>

                {filteredTags.length > 0 && (
                  <View
                    style={[
                      styles.tagSuggestions,
                      { backgroundColor: theme.card },
                    ]}
                  >
                    {filteredTags.map((tag) => (
                      <TouchableOpacity
                        key={tag.id}
                        style={styles.tagSuggestion}
                        onPress={() => handleAddTag(tag)}
                      >
                        <Text
                          style={[
                            styles.tagSuggestionText,
                            { color: theme.text },
                          ]}
                        >
                          #{tag.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Popular Tags */}
            <Text style={[styles.popularTagsTitle, { color: theme.text }]}>
              Thẻ phổ biến
            </Text>
            <View style={styles.popularTagsContainer}>
              {popularTags.slice(0, 10).map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.popularTag,
                    {
                      backgroundColor: selectedTags.some((t) => t.id === tag.id)
                        ? theme.primary + "20"
                        : theme.backgroundSecondary,
                    },
                  ]}
                  onPress={() => handleAddTag(tag)}
                  disabled={
                    selectedTags.some((t) => t.id === tag.id) ||
                    selectedTags.length >= 5
                  }
                >
                  <Text
                    style={[
                      styles.popularTagText,
                      {
                        color: selectedTags.some((t) => t.id === tag.id)
                          ? theme.primary
                          : theme.textSecondary,
                      },
                    ]}
                  >
                    #{tag.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Toolbar */}
      <View
        style={[
          styles.toolbar,
          {
            backgroundColor: theme.card,
            borderTopColor: theme.borderLight,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={handlePickImage}
          disabled={loadingImage || images.length >= 5}
        >
          {loadingImage ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Entypo
              name="image"
              size={22}
              color={images.length >= 5 ? theme.textTertiary : theme.primary}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={togglePreview}>
          <Ionicons name="eye-outline" size={22} color={theme.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.postButton,
            {
              backgroundColor:
                !title.trim() || !content.trim() || submitting
                  ? theme.primary + "50"
                  : theme.primary,
            },
          ]}
          onPress={handleSubmitPost}
          disabled={!title.trim() || !content.trim() || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={styles.postButtonText}>Đăng</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <FormSkeleton theme={theme} />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: theme.background }]}
      >
        <Ionicons name="alert-circle-outline" size={40} color={theme.error} />
        <Text style={[styles.errorText, { color: theme.text }]}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.headerButtonText, { color: theme.text }]}>
              Hủy
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Tạo bài viết
          </Text>
          <View style={styles.headerButton}>
            {/* Placeholder for balance */}
          </View>
        </View>

        {showPreview ? <PreviewPost /> : <PostForm />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  editorContainer: {
    padding: 16,
  },
  gardenSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  gardenIcon: {
    marginRight: 8,
  },
  gardenText: {
    flex: 1,
    fontSize: 14,
  },
  gardenOptions: {
    borderRadius: 8,
    marginTop: -8,
    marginBottom: 12,
    overflow: "hidden",
  },
  gardenOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  gardenOptionText: {
    fontSize: 14,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: "bold",
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: "top",
    minHeight: 120,
    paddingVertical: 8,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionSubtitle: {
    fontSize: 12,
    fontStyle: "italic",
  },
  imagePreviewContainer: {
    marginVertical: 16,
  },
  imagePreviewListContainer: {
    paddingRight: 16,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 8,
    position: "relative",
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  dragHandle: {
    position: "absolute",
    bottom: 4,
    right: 4,
    padding: 2,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 12,
  },
  tagsContainer: {
    marginTop: 24,
  },
  tagsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  tagsCount: {
    fontSize: 14,
  },
  selectedTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  removeTagButton: {
    marginLeft: 4,
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  addTagButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  tagSuggestions: {
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tagSuggestion: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEEEEE",
  },
  tagSuggestionText: {
    fontSize: 14,
  },
  popularTagsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  popularTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  popularTag: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  popularTagText: {
    fontSize: 14,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  toolbarButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  postButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: "auto",
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 16,
  },
  previewContainer: {
    flex: 1,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    margin: 16,
    marginBottom: 0,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  postCard: {
    borderRadius: 12,
    margin: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  postDate: {
    fontSize: 14,
    marginTop: 2,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  gardenInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  gardenInfoText: {
    marginLeft: 8,
    fontSize: 14,
  },
  publishButton: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  publishButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dimensionsBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  dimensionsText: {
    color: "white",
    fontSize: 10,
    fontWeight: "500",
  },
});
