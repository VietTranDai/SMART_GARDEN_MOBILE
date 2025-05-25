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
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { ActivityType } from "@/types"; // Import enum ActivityType
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function CreateActivityScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { gardenId } = useLocalSearchParams<{ gardenId: string }>(); // Get gardenId
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [selectedActivityType, setSelectedActivityType] =
    useState<ActivityType | null>(null);
  const [notes, setNotes] = useState("");
  const [timestamp, setTimestamp] = useState(new Date()); // Default to now

  // TODO: Implement a DateTimePicker for timestamp selection

  const getActivityTypeText = (actType: ActivityType): string => {
    switch (actType) {
      case ActivityType.WATERING:
        return "Tưới nước";
      case ActivityType.FERTILIZING:
        return "Bón phân";
      case ActivityType.PRUNING:
        return "Cắt tỉa";
      case ActivityType.HARVESTING:
        return "Thu hoạch";
      case ActivityType.PLANTING:
        return "Trồng cây";
      case ActivityType.PEST_CONTROL:
        return "Kiểm soát sâu bệnh";
      case ActivityType.WEEDING:
        return "Nhổ cỏ";
      case ActivityType.OTHER:
      default:
        return "Khác";
    }
  };

  const getActivityTypeIcon = (actType: ActivityType): string => {
    switch (actType) {
      case ActivityType.WATERING:
        return "water";
      case ActivityType.FERTILIZING:
        return "leaf";
      case ActivityType.PRUNING:
        return "content-cut";
      case ActivityType.HARVESTING:
        return "basket";
      case ActivityType.PLANTING:
        return "shovel";
      case ActivityType.PEST_CONTROL:
        return "bug";
      case ActivityType.WEEDING:
        return "grass";
      case ActivityType.OTHER:
      default:
        return "dots-horizontal";
    }
  };

  const handleSubmit = () => {
    if (!selectedActivityType) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn loại hoạt động.");
      return;
    }

    console.log("Creating activity for garden:", gardenId, {
      activityType: selectedActivityType,
      notes,
      timestamp: timestamp.toISOString(),
    });

    Alert.alert("Thành công", "Đã thêm hoạt động mới (giả lập).", [
      { text: "OK", onPress: () => router.back() },
    ]);

    // TODO: Implement API call to create activity
    // TODO: Navigate back or refresh the activity list on the previous screen
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ title: "Thêm Hoạt Động" }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Chi tiết hoạt động</Text>

        {/* Activity Type Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Loại hoạt động *</Text>
          <View style={styles.typeSelectorContainer}>
            {Object.values(ActivityType).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  selectedActivityType === type && styles.typeButtonSelected,
                ]}
                onPress={() => setSelectedActivityType(type)}
              >
                <MaterialCommunityIcons
                  name={getActivityTypeIcon(type) as any}
                  size={18}
                  color={
                    selectedActivityType === type
                      ? theme.primary
                      : theme.textSecondary
                  }
                  style={styles.typeButtonIcon}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    selectedActivityType === type &&
                      styles.typeButtonTextSelected,
                  ]}
                >
                  {getActivityTypeText(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ghi chú</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Thêm mô tả hoặc ghi chú về hoạt động này..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        {/* Timestamp Selection (Placeholder) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Thời gian thực hiện</Text>
          {/* TODO: Replace with DateTimePicker component */}
          <Text style={styles.timestampText}>
            {timestamp.toLocaleString("vi-VN")}
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Ionicons name="add-circle-outline" size={20} color={theme.card} />
          <Text style={styles.submitButtonText}>Lưu hoạt động</Text>
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
      height: 120,
      textAlignVertical: "top",
    },
    typeSelectorContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    typeButton: {
      flexDirection: "row",
      alignItems: "center",
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
    typeButtonIcon: {
      marginRight: 8,
    },
    typeButtonText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
    },
    typeButtonTextSelected: {
      color: theme.primary,
    },
    timestampText: {
      fontSize: 16,
      color: theme.text,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
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
      color: theme.card,
      fontSize: 18,
      fontFamily: "Inter-SemiBold",
    },
  });
