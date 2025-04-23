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
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useAppTheme } from "@/hooks/useAppTheme";  

// Mock garden data for selection
const GARDENS = [
  { id: "1", name: "Vegetable Garden", type: "vegetable" },
  { id: "2", name: "Flower Bed", type: "flower" },
  { id: "3", name: "Herb Garden", type: "herb" },
  { id: "4", name: "Fruit Trees", type: "fruit" },
];

const PLANT_TYPES = [
  { value: "vegetable", label: "Vegetable" },
  { value: "fruit", label: "Fruit" },
  { value: "herb", label: "Herb" },
  { value: "flower", label: "Flower" },
  { value: "tree", label: "Tree" },
  { value: "shrub", label: "Shrub" },
  { value: "succulent", label: "Succulent" },
];

const GROWTH_STAGES = [
  { value: "seedling", label: "Seedling" },
  { value: "vegetative", label: "Vegetative Growth" },
  { value: "flowering", label: "Flowering" },
  { value: "fruiting", label: "Fruiting" },
  { value: "mature", label: "Mature" },
];

export default function CreatePlantScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    scientificName: "",
    gardenId: "",
    type: "vegetable",
    description: "",
    growthStage: "seedling",
    plantedDate: new Date().toISOString().split("T")[0],
    image:
      "https://images.unsplash.com/photo-1592086326887-37c39ba91db9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
  });
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Auto-select the first garden by default
  useEffect(() => {
    if (GARDENS.length > 0 && !formData.gardenId) {
      setFormData((prev) => ({
        ...prev,
        gardenId: GARDENS[0].id,
      }));
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Plant name is required");
      return false;
    }
    if (!formData.gardenId) {
      Alert.alert("Error", "Please select a garden");
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert("Error", "Description is required");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    // In a real app, this would be an API call to create the plant
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert("Success", "Plant added successfully!", [
        {
          text: "OK",
          onPress: () => router.push("/plants"),
        },
      ]);
    }, 1000);
  };

  const getGardenNameById = (id: string) => {
    const garden = GARDENS.find((g) => g.id === id);
    return garden ? garden.name : "";
  };

  // Get sample plant image based on type
  const getPlantImageByType = (type: string) => {
    switch (type) {
      case "vegetable":
        return "https://images.unsplash.com/photo-1592086326887-37c39ba91db9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
      case "fruit":
        return "https://images.unsplash.com/photo-1569870499705-504209102861?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
      case "herb":
        return "https://images.unsplash.com/photo-1587684693075-097431e2a347?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
      case "flower":
        return "https://images.unsplash.com/photo-1589649571514-83ac26711179?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
      case "tree":
        return "https://images.unsplash.com/photo-1564860924912-40e6c813e95c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
      case "shrub":
        return "https://images.unsplash.com/photo-1598977123118-4e20cec12e77?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
      case "succulent":
        return "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
      default:
        return "https://images.unsplash.com/photo-1592086326887-37c39ba91db9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
    }
  };

  // Auto-update image when plant type changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      image: getPlantImageByType(prev.type),
    }));
  }, [formData.type]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Add New Plant",
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          {/* Plant Image Preview */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: formData.image }} style={styles.image} />
            <TouchableOpacity style={styles.editImageButton}>
              <Ionicons name="camera" size={20} color="white" />
              <Text style={styles.editImageText}>Choose Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Plant Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Plant Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter plant name"
              value={formData.name}
              onChangeText={(text) => handleInputChange("name", text)}
            />
          </View>

          {/* Scientific Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Scientific Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter scientific name (optional)"
              value={formData.scientificName}
              onChangeText={(text) => handleInputChange("scientificName", text)}
            />
          </View>

          {/* Garden Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Garden *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.gardenId}
                onValueChange={(value) => handleInputChange("gardenId", value)}
                style={styles.picker}
              >
                {GARDENS.map((garden) => (
                  <Picker.Item
                    key={garden.id}
                    label={garden.name}
                    value={garden.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Plant Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Plant Type *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
                style={styles.picker}
              >
                {PLANT_TYPES.map((type) => (
                  <Picker.Item
                    key={type.value}
                    label={type.label}
                    value={type.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Growth Stage */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Growth Stage *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.growthStage}
                onValueChange={(value) =>
                  handleInputChange("growthStage", value)
                }
                style={styles.picker}
              >
                {GROWTH_STAGES.map((stage) => (
                  <Picker.Item
                    key={stage.value}
                    label={stage.label}
                    value={stage.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Planting Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date Planted *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.plantedDate}
              onChangeText={(text) => handleInputChange("plantedDate", text)}
            />
            <Text style={styles.helperText}>
              Format: YYYY-MM-DD (In a real app, this would be a date picker)
            </Text>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter plant description"
              value={formData.description}
              onChangeText={(text) => handleInputChange("description", text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Image URL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image URL</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter image URL"
              value={formData.image}
              onChangeText={(text) => handleInputChange("image", text)}
            />
            <Text style={styles.helperText}>
              In a real app, you would have the option to upload an image
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Adding Plant...</Text>
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <Text style={styles.submitButtonText}>Add Plant</Text>
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
    padding: 16,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 16,
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#DFE4EA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
  },
  pickerContainer: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#DFE4EA",
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
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: theme.textTertiary,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
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
