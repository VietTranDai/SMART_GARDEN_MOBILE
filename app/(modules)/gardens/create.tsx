import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { Ionicons } from "@expo/vector-icons";

// TODO: Define GardenType enum or import from constants
enum GardenType {
  INDOOR = "INDOOR",
  OUTDOOR = "OUTDOOR",
  BALCONY = "BALCONY",
  ROOFTOP = "ROOFTOP",
}

export default function CreateGardenScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [gardenName, setGardenName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(""); // Simple location for now
  const [plantName, setPlantName] = useState("");
  const [gardenType, setGardenType] = useState<GardenType | null>(null);

  const handleSubmit = () => {
    // Basic validation
    if (!gardenName || !plantName || !gardenType) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập tên vườn, loại cây trồng và chọn loại vườn."
      );
      return;
    }

    Alert.alert("Thành công", "Đã tạo vườn mới (giả lập).", [
      { text: "OK", onPress: () => router.back() },
    ]);

    // TODO: Implement API call to create garden
    // TODO: Navigate back or to the new garden's detail screen
    // router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ title: "Tạo Vườn Mới" }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Thông tin vườn</Text>

        {/* Garden Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tên vườn *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Vườn rau sân thượng"
            value={gardenName}
            onChangeText={setGardenName}
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mô tả</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả ngắn về khu vườn của bạn"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        {/* Location Input (Simplified) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Vị trí</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Tầng 5, Chung cư ABC"
            value={location}
            onChangeText={setLocation}
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        {/* Plant Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Loại cây trồng chính *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Cà chua, Húng quế"
            value={plantName}
            onChangeText={setPlantName}
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        {/* Garden Type Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Loại hình vườn *</Text>
          <View style={styles.typeSelectorContainer}>
            {Object.values(GardenType).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  gardenType === type && styles.typeButtonSelected,
                ]}
                onPress={() => setGardenType(type)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    gardenType === type && styles.typeButtonTextSelected,
                  ]}
                >
                  {/* Convert enum to readable text */}
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Ionicons name="leaf-outline" size={20} color={theme.card} />
          <Text style={styles.submitButtonText}>Tạo vườn</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      padding: 20,
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: "Inter-Bold",
      color: theme.text,
      marginBottom: 24,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.card,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
    },
    textArea: {
      height: 100,
      textAlignVertical: "top", // Align text to top for multiline
    },
    typeSelectorContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    typeButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    typeButtonSelected: {
      backgroundColor: theme.primaryLight,
      borderColor: theme.primary,
    },
    typeButtonText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
    },
    typeButtonTextSelected: {
      color: theme.primary,
    },
    submitButton: {
      backgroundColor: theme.primary,
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 24,
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    submitButtonText: {
      color: theme.card, // White text on primary button
      fontSize: 18,
      fontFamily: "Inter-SemiBold",
    },
  });
