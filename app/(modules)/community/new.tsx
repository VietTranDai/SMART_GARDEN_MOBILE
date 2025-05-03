import React, { useState, useEffect } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons, AntDesign, Entypo } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import * as ImagePicker from "expo-image-picker";
import { communityService, gardenService } from "@/service/api";
import { Garden, Tag, CreatePostDto } from "@/types";

export default function NewPostScreen() {
  const theme = useAppTheme();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedGarden, setSelectedGarden] = useState<Garden | null>(null);
  const [showGardenSelector, setShowGardenSelector] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [popularTags, setPopularTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Remove a tag from the post
  const handleRemoveTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId));
  };

  // Pick an image from the device gallery
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to add images to your post."
      );
      return;
    }

    try {
      setLoadingImage(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // In a real app, this would upload the image to a server and get back a URL
        // For now, we just use the local URI
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to load image. Please try again.");
    } finally {
      setLoadingImage(false);
    }
  };

  // Remove an image from the post
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Submit the post
  const handleSubmitPost = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please add a title for your post");
      return;
    }

    if (!content.trim()) {
      Alert.alert("Error", "Please add content for your post");
      return;
    }

    setSubmitting(true);

    try {
      // Using FormData instead of direct image paths
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());

      // Add tag IDs
      selectedTags.forEach((tag) => {
        formData.append("tagIds", tag.id.toString());
      });

      // Add garden ID if selected
      if (selectedGarden?.id) {
        formData.append("gardenId", selectedGarden.id.toString());
      }

      // Add images
      images.forEach((image, index) => {
        // Extract filename from path
        const filename = image.split("/").pop() || `image_${index}.jpg`;

        // Create file object from URI
        const file = {
          uri: image,
          type: "image/jpeg",
          name: filename,
        };

        // @ts-ignore - We need to ignore type checking here as the FormData types don't match React Native's file object
        formData.append("images", file);
      });

      // @ts-ignore - Ignore the type error since communityService.createPost expects CreatePostDto but we're sending FormData
      await communityService.createPost(formData);

      // Navigate back after successful post creation
      router.back();
    } catch (err) {
      console.error("Failed to create post:", err);
      Alert.alert("Error", "Failed to create your post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
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
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            New Post
          </Text>
          <TouchableOpacity
            style={[
              styles.headerButton,
              {
                opacity:
                  !title.trim() || !content.trim() || submitting ? 0.5 : 1,
              },
            ]}
            onPress={handleSubmitPost}
            disabled={!title.trim() || !content.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Text style={[styles.headerButtonText, { color: theme.primary }]}>
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.editorContainer}>
            {/* Garden Selector */}
            <TouchableOpacity
              style={[
                styles.gardenSelector,
                { backgroundColor: theme.cardAlt },
              ]}
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
                  ? `Posting in: ${selectedGarden.name}`
                  : "Select a garden (optional)"}
              </Text>
              <Ionicons
                name={showGardenSelector ? "chevron-up" : "chevron-down"}
                size={18}
                color={theme.textSecondary}
              />
            </TouchableOpacity>

            {showGardenSelector && (
              <View
                style={[
                  styles.gardenOptions,
                  { backgroundColor: theme.cardAlt },
                ]}
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
                      Clear selection
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
              placeholder="Title"
              placeholderTextColor={theme.textTertiary}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />

            {/* Post Content */}
            <TextInput
              style={[styles.contentInput, { color: theme.text }]}
              placeholder="Share your gardening experience or ask a question..."
              placeholderTextColor={theme.textTertiary}
              multiline
              value={content}
              onChangeText={setContent}
            />

            {/* Image Preview */}
            {images.length > 0 && (
              <View style={styles.imagePreviewContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {images.map((image, index) => (
                    <View key={index} style={styles.imagePreview}>
                      <Image
                        source={{ uri: image }}
                        style={styles.previewImage}
                      />
                      <TouchableOpacity
                        style={[
                          styles.removeImageButton,
                          { backgroundColor: theme.error },
                        ]}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Ionicons name="close" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Tags Input */}
            <View style={styles.tagsContainer}>
              <View style={styles.tagsHeader}>
                <Text style={[styles.tagsTitle, { color: theme.text }]}>
                  Tags
                </Text>
                <Text
                  style={[styles.tagsCount, { color: theme.textSecondary }]}
                >
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
                    <Text
                      style={[styles.tagChipText, { color: theme.primary }]}
                    >
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
                <View
                  style={[
                    styles.tagInputContainer,
                    { backgroundColor: theme.backgroundSecondary },
                  ]}
                >
                  <TextInput
                    style={[styles.tagInput, { color: theme.text }]}
                    placeholder="Add a tag (e.g., Tomatoes, Help)"
                    placeholderTextColor={theme.textTertiary}
                    value={tagInput}
                    onChangeText={setTagInput}
                    onSubmitEditing={() => handleAddTag(selectedTags[0])}
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
                    onPress={() => handleAddTag(selectedTags[0])}
                    disabled={!tagInput.trim()}
                  >
                    <Ionicons
                      name="add"
                      size={20}
                      color={tagInput.trim() ? "#fff" : theme.textTertiary}
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* Popular Tags */}
              <Text style={[styles.popularTagsTitle, { color: theme.text }]}>
                Popular Tags
              </Text>
              <View style={styles.popularTagsContainer}>
                {popularTags.map((tag) => (
                  <TouchableOpacity
                    key={tag.id}
                    style={[
                      styles.popularTag,
                      {
                        backgroundColor: selectedTags.some(
                          (t) => t.id === tag.id
                        )
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

          <TouchableOpacity style={styles.toolbarButton}>
            <AntDesign name="tagso" size={22} color={theme.primary} />
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
                <Text style={styles.postButtonText}>Post</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
  imagePreviewContainer: {
    marginVertical: 16,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 8,
    position: "relative",
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
    marginBottom: 16,
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
});
