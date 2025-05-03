import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useAppTheme } from "@/hooks/useAppTheme";
import { gardenService } from "@/service/api";
import { Garden } from "@/types";
import * as ImagePicker from "expo-image-picker";

export default function EditGardenScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useAppTheme();

  const styles = useMemo(() => createStyles(theme), [theme]);

  const [garden, setGarden] = useState<Garden | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "vegetable",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [imageUpdated, setImageUpdated] = useState(false);

  useEffect(() => {
    const fetchGarden = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const gardenData = await gardenService.getGardenById(id.toString());
        setGarden(gardenData);

        setFormData({
          name: gardenData.name,
          type: gardenData.type || "vegetable",
          description: gardenData.description || "",
        });

        setImage(gardenData.profilePicture || null);
      } catch (err) {
        console.error("Failed to fetch garden:", err);
        setError("Không thể tải thông tin vườn. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchGarden();
  }, [id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library"
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        setImageUpdated(true);
      }
    } catch (err) {
      console.error("Error picking image:", err);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  const handleSave = async () => {
    // Validate form
    if (!formData.name.trim()) {
      Alert.alert("Error", "Garden name is required");
      return;
    }

    setSubmitting(true);

    try {
      if (!id) throw new Error("Garden ID is missing");

      const updateData = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
      };

      // If the image was updated, we need to create a form data
      if (imageUpdated && image) {
        const formData = new FormData();

        // Add all update data
        Object.entries(updateData).forEach(([key, value]) => {
          formData.append(key, value.toString());
        });

        // Add the image
        const filename = image.split("/").pop() || "garden_image.jpg";
        const file = {
          uri: image,
          type: "image/jpeg",
          name: filename,
        };

        // @ts-ignore - FormData type issues
        formData.append("image", file);

        // Call API with form data
        await gardenService.updateGarden(id.toString(), formData as any);
      } else {
        // Call API with JSON data
        await gardenService.updateGarden(id.toString(), updateData as any);
      }

      Alert.alert("Success", "Garden updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error("Failed to update garden:", err);
      Alert.alert("Error", "Failed to update garden. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this garden? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setSubmitting(true);
              if (!id) throw new Error("Garden ID is missing");

              await gardenService.deleteGarden(id.toString());

              Alert.alert("Success", "Garden deleted successfully!", [
                {
                  text: "OK",
                  onPress: () => router.replace("/(modules)/gardens"),
                },
              ]);
            } catch (err) {
              console.error("Failed to delete garden:", err);
              Alert.alert(
                "Error",
                "Failed to delete garden. Please try again."
              );
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centeredContainer]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading garden details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centeredContainer]}>
        <Ionicons name="alert-circle-outline" size={60} color={theme.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.replace(`/(modules)/gardens/edit/${id}`)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: garden?.name ? `Edit - ${garden.name}` : "Edit Garden",
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: image || "https://via.placeholder.com/150" }}
              style={styles.image}
            />
            <TouchableOpacity
              style={styles.editImageButton}
              onPress={handleImagePick}
            >
              <Ionicons name="camera" size={20} color="white" />
              <Text style={styles.editImageText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Garden Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => handleInputChange("name", text)}
              placeholder="Enter garden name"
              placeholderTextColor={theme.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Garden Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
                style={styles.picker}
              >
                <Picker.Item label="Vegetable" value="vegetable" />
                <Picker.Item label="Flower" value="flower" />
                <Picker.Item label="Herb" value="herb" />
                <Picker.Item label="Fruit" value="fruit" />
                <Picker.Item label="Indoor" value="indoor" />
                <Picker.Item label="Other" value="other" />
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => handleInputChange("description", text)}
              placeholder="Enter garden description"
              placeholderTextColor={theme.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="save" size={20} color="white" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={submitting}
            >
              <Ionicons name="trash" size={20} color="white" />
              <Text style={styles.deleteButtonText}>Delete Garden</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    centeredContainer: {
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
    },
    errorText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.text,
      fontFamily: "Inter-Medium",
      textAlign: "center",
      marginHorizontal: 24,
    },
    retryButton: {
      marginTop: 24,
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: theme.primary,
      borderRadius: 8,
    },
    retryButtonText: {
      color: theme.card,
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
    },
    formContainer: {
      padding: 16,
    },
    imageContainer: {
      alignItems: "center",
      marginBottom: 24,
      position: "relative",
    },
    image: {
      width: 150,
      height: 150,
      borderRadius: 75,
    },
    editImageButton: {
      position: "absolute",
      bottom: 0,
      right: "30%",
      backgroundColor: theme.primary,
      borderRadius: 20,
      padding: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    editImageText: {
      color: "white",
      marginLeft: 4,
      fontSize: 14,
      fontFamily: "Inter-Medium",
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
      color: theme.text,
      fontFamily: "Inter-Medium",
    },
    input: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.borderLight,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.text,
      fontFamily: "Inter-Regular",
    },
    textArea: {
      minHeight: 100,
    },
    pickerContainer: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.borderLight,
      borderRadius: 8,
      overflow: "hidden",
    },
    picker: {
      color: theme.text,
      height: 50,
    },
    buttonContainer: {
      marginTop: 24,
      marginBottom: 40,
    },
    saveButton: {
      backgroundColor: theme.success,
      padding: 16,
      borderRadius: 8,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    saveButtonText: {
      color: "white",
      fontSize: 16,
      marginLeft: 8,
      fontFamily: "Inter-SemiBold",
    },
    deleteButton: {
      backgroundColor: theme.error,
      padding: 16,
      borderRadius: 8,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    deleteButtonText: {
      color: "white",
      fontSize: 16,
      marginLeft: 8,
      fontFamily: "Inter-SemiBold",
    },
  });
