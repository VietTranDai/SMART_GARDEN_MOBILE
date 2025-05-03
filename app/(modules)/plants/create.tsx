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
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useAppTheme } from "@/hooks/useAppTheme";
import { plantService, gardenService } from "@/service/api";
import { Garden } from "@/types/gardens";
import { PlantType } from "@/types/plants";

export default function CreatePlantScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [plantTypes, setPlantTypes] = useState<PlantType[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    scientificName: "",
    gardenId: "",
    plantTypeId: "",
    description: "",
    family: "",
    growthDuration: "",
  });

  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Fetch gardens and plant types on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch gardens and plant types in parallel
        const [gardensData, plantTypesData] = await Promise.all([
          gardenService.getGardens(),
          plantService.getPlantTypes(),
        ]);

        setGardens(gardensData);
        setPlantTypes(plantTypesData);

        // Auto-select the first garden and plant type by default
        if (gardensData.length > 0) {
          setFormData((prev) => ({
            ...prev,
            gardenId: gardensData[0].id.toString(),
          }));
        }

        if (plantTypesData.length > 0) {
          setFormData((prev) => ({
            ...prev,
            plantTypeId: plantTypesData[0].id.toString(),
          }));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load required data. Please try again later.");
        Alert.alert(
          "Error",
          "Failed to load required data. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    if (!formData.plantTypeId) {
      Alert.alert("Error", "Please select a plant type");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Create plant data object for API
      const plantData = {
        name: formData.name,
        scientificName: formData.scientificName,
        gardenId: parseInt(formData.gardenId),
        plantTypeId: parseInt(formData.plantTypeId),
        description: formData.description,
        family: formData.family,
        growthDuration: formData.growthDuration
          ? parseInt(formData.growthDuration)
          : undefined,
      };

      // Make API call to create plant
      const newPlant = await plantService.createPlant(plantData);

      setIsSubmitting(false);
      Alert.alert("Success", "Plant added successfully!", [
        {
          text: "OK",
          onPress: () => router.push("/(modules)/plants"),
        },
      ]);
    } catch (err) {
      console.error("Failed to create plant:", err);
      setIsSubmitting(false);
      Alert.alert("Error", "Failed to create plant. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle" size={48} color={theme.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.push("/(modules)/plants")}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Add New Plant",
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
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
                {gardens.map((garden) => (
                  <Picker.Item
                    key={garden.id}
                    label={garden.name}
                    value={garden.id.toString()}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Plant Type Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Plant Type *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.plantTypeId}
                onValueChange={(value) =>
                  handleInputChange("plantTypeId", value)
                }
                style={styles.picker}
              >
                {plantTypes.map((type) => (
                  <Picker.Item
                    key={type.id}
                    label={type.name}
                    value={type.id.toString()}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Family */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Family</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter plant family (optional)"
              value={formData.family}
              onChangeText={(text) => handleInputChange("family", text)}
            />
          </View>

          {/* Growth Duration */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Growth Duration (days)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter growth duration in days (optional)"
              value={formData.growthDuration}
              onChangeText={(text) => handleInputChange("growthDuration", text)}
              keyboardType="numeric"
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter plant description (optional)"
              value={formData.description}
              onChangeText={(text) => handleInputChange("description", text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
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
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Add Plant</Text>
            )}
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
    centerContent: {
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      fontWeight: "600",
      color: "#333",
    },
    errorText: {
      marginTop: 16,
      fontSize: 16,
      fontWeight: "600",
      color: theme.error,
    },
    retryButton: {
      paddingVertical: 14,
      marginTop: 12,
      alignItems: "center",
    },
    retryButtonText: {
      color: theme.primary,
      fontSize: 16,
      fontWeight: "600",
    },
  });
