import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useAppTheme } from "@/hooks/useAppTheme";

const GARDEN_TYPES = [
  { label: "Vegetable Garden", value: "vegetable" },
  { label: "Flower Bed", value: "flower" },
  { label: "Herb Garden", value: "herb" },
  { label: "Fruit Garden", value: "fruit" },
  { label: "Indoor Garden", value: "indoor" },
  { label: "Succulent Garden", value: "succulent" },
];

export default function CreateGardenScreen() {
  const router = useRouter();
  const theme = useAppTheme();

  const styles = useMemo(() => createStyles(theme), [theme]);

  const [gardenData, setGardenData] = useState({
    name: "",
    type: "vegetable",
    description: "",
    image:
      "https://images.unsplash.com/photo-1593498212053-2001a3631307?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setGardenData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!gardenData.name.trim()) {
      Alert.alert("Error", "Garden name is required");
      return false;
    }
    if (!gardenData.description.trim()) {
      Alert.alert("Error", "Garden description is required");
      return false;
    }
    return true;
  };

  const handleCreateGarden = () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    // In a real app, this would be an API call to create the garden
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert("Success", "Garden created successfully!", [
        {
          text: "OK",
          onPress: () => router.push("/gardens"),
        },
      ]);
    }, 1000);
  };

  // Sample image based on garden type
  const getImagePlaceholder = (type: string) => {
    switch (type) {
      case "vegetable":
        return "https://images.unsplash.com/photo-1593498212053-2001a3631307?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
      case "flower":
        return "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
      case "herb":
        return "https://images.unsplash.com/photo-1599047850212-0d99725b5c96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
      case "fruit":
        return "https://images.unsplash.com/photo-1592453106033-d8a035da886b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
      default:
        return "https://images.unsplash.com/photo-1593498212053-2001a3631307?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Create New Garden",
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: getImagePlaceholder(gardenData.type) }}
              style={styles.image}
            />
            <TouchableOpacity style={styles.editImageButton}>
              <Ionicons name="camera" size={20} color="white" />
              <Text style={styles.editImageText}>Choose Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Garden Name</Text>
            <TextInput
              style={styles.input}
              value={gardenData.name}
              onChangeText={(text) => handleInputChange("name", text)}
              placeholder="Enter garden name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Garden Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={gardenData.type}
                onValueChange={(value) => {
                  handleInputChange("type", value);
                  handleInputChange("image", getImagePlaceholder(value));
                }}
                style={styles.picker}
              >
                {GARDEN_TYPES.map((type) => (
                  <Picker.Item
                    key={type.value}
                    label={type.label}
                    value={type.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={gardenData.description}
              onChangeText={(text) => handleInputChange("description", text)}
              placeholder="Enter garden description"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Image URL</Text>
            <TextInput
              style={styles.input}
              value={gardenData.image}
              onChangeText={(text) => handleInputChange("image", text)}
              placeholder="Enter image URL"
            />
            <Text style={styles.helperText}>
              In a real app, you would have the option to upload an image
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleCreateGarden}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Creating Garden...</Text>
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <Text style={styles.submitButtonText}>Create Garden</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F5F7FA",
    },
    formContainer: {
      padding: 20,
    },
    imageContainer: {
      position: "relative",
      marginBottom: 20,
      borderRadius: 12,
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: 200,
      resizeMode: "cover",
    },
    editImageButton: {
      position: "absolute",
      bottom: 10,
      right: 10,
      backgroundColor: "rgba(0,0,0,0.6)",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
    },
    editImageText: {
      color: "white",
      marginLeft: 6,
      fontSize: 14,
    },
    formGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
      color: "#333",
    },
    input: {
      backgroundColor: "white",
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
    },
    textArea: {
      minHeight: 100,
    },
    pickerContainer: {
      backgroundColor: "white",
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 8,
      overflow: "hidden",
    },
    picker: {
      height: 50,
    },
    helperText: {
      fontSize: 12,
      color: "#666",
      marginTop: 4,
    },
    submitButton: {
      backgroundColor: theme.primary,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 20,
      marginTop: 10,
    },
    submitButtonDisabled: {
      backgroundColor: theme.textTertiary,
    },
    submitButtonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
    cancelButton: {
      paddingVertical: 14,
      marginTop: 12,
      alignItems: "center",
    },
    cancelButtonText: {
      color: theme.primary,
      fontSize: 16,
      fontWeight: "600",
    },
  });
