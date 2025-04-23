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
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useAppTheme } from "@/hooks/useAppTheme";

// Mock data for gardens (same as in index.tsx and [id].tsx)
const mockGardens = [
  {
    id: "1",
    name: "Vegetable Garden",
    type: "vegetable",
    status: "healthy",
    plantCount: 12,
    image:
      "https://images.unsplash.com/photo-1593498212053-2001a3631307?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    lastWatered: new Date(Date.now() - 86400000), // 1 day ago
    description:
      "A thriving vegetable garden with tomatoes, cucumbers, peppers, and leafy greens.",
    soilMoisture: 68,
    lightLevel: 85,
    temperature: 24,
  },
  {
    id: "2",
    name: "Flower Bed",
    type: "flower",
    status: "needs-attention",
    plantCount: 8,
    image:
      "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    lastWatered: new Date(Date.now() - 172800000), // 2 days ago
    description:
      "Beautiful floral display featuring roses, tulips, and daisies. Currently needs watering.",
    soilMoisture: 32,
    lightLevel: 90,
    temperature: 26,
  },
  {
    id: "3",
    name: "Herb Garden",
    type: "herb",
    status: "critical",
    plantCount: 6,
    image:
      "https://images.unsplash.com/photo-1599047850212-0d99725b5c96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    lastWatered: new Date(Date.now() - 345600000), // 4 days ago
    description:
      "Collection of culinary herbs including basil, rosemary, thyme, and mint. Urgently needs water.",
    soilMoisture: 15,
    lightLevel: 78,
    temperature: 27,
  },
  {
    id: "4",
    name: "Fruit Trees",
    type: "fruit",
    status: "healthy",
    plantCount: 4,
    image:
      "https://images.unsplash.com/photo-1592453106033-d8a035da886b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    lastWatered: new Date(Date.now() - 86400000), // 1 day ago
    description:
      "Small orchard with apple, pear, and cherry trees. All trees are healthy and bearing fruit.",
    soilMoisture: 72,
    lightLevel: 95,
    temperature: 23,
  },
];

export default function EditGardenScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useAppTheme();

  const styles = useMemo(() => createStyles(theme), [theme]);

  const [formData, setFormData] = useState({
    name: "",
    type: "vegetable",
    plantCount: "",
    description: "",
  });

  useEffect(() => {
    // In a real app, you would fetch the garden details from an API
    const garden = mockGardens.find((g) => g.id === id);
    if (garden) {
      setFormData({
        name: garden.name,
        type: garden.type,
        plantCount: garden.plantCount.toString(),
        description: garden.description,
      });
    }
  }, [id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // Validate form
    if (!formData.name.trim()) {
      Alert.alert("Error", "Garden name is required");
      return;
    }

    if (
      !formData.plantCount ||
      isNaN(Number(formData.plantCount)) ||
      Number(formData.plantCount) < 0
    ) {
      Alert.alert("Error", "Plant count must be a valid positive number");
      return;
    }

    // In a real app, you would send the updated data to an API
    Alert.alert("Success", "Garden updated successfully!", [
      { text: "OK", onPress: () => router.back() },
    ]);
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
          onPress: () => {
            // In a real app, you would send a delete request to an API
            Alert.alert("Success", "Garden deleted successfully!", [
              { text: "OK", onPress: () => router.push("/gardens") },
            ]);
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Edit Garden",
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: mockGardens.find((g) => g.id === id)?.image }}
              style={styles.image}
            />
            <TouchableOpacity style={styles.editImageButton}>
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
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Number of Plants</Text>
            <TextInput
              style={styles.input}
              value={formData.plantCount}
              onChangeText={(text) => handleInputChange("plantCount", text)}
              placeholder="Enter number of plants"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => handleInputChange("description", text)}
              placeholder="Enter garden description"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="white" />
            <Text style={styles.deleteButtonText}>Delete Garden</Text>
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
    saveButton: {
      backgroundColor: theme.primary,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 12,
    },
    saveButtonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
    deleteButton: {
      backgroundColor: "#f44336",
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 12,
    },
    deleteButtonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
      marginLeft: 8,
    },
  });
