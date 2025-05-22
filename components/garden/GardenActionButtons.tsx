import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";

interface GardenActionButtonsProps {
  gardenId: string | number;
  onUploadPhoto: (gardenId: string | number) => Promise<void>;
}

const GardenActionButtons: React.FC<GardenActionButtonsProps> = ({
  gardenId,
  onUploadPhoto,
}) => {
  const router = useRouter();
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { borderTopColor: theme.borderLight }]}>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.primaryLight }]}
        onPress={() =>
          router.push(`/(modules)/activities/create?gardenId=${gardenId}`)
        }
        accessible={true}
        accessibilityLabel="Thêm hoạt động"
        accessibilityRole="button"
      >
        <FontAwesome5 name="plus" size={16} color={theme.primary} />
        <Text style={[styles.actionButtonText, { color: theme.primary }]}>
          Thêm hoạt động
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.primaryLight }]}
        onPress={() => onUploadPhoto(gardenId)}
        accessible={true}
        accessibilityLabel="Tải ảnh lên"
        accessibilityRole="button"
      >
        <FontAwesome5 name="camera" size={16} color={theme.primary} />
        <Text style={[styles.actionButtonText, { color: theme.primary }]}>
          Tải ảnh lên
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    paddingBottom: 14,
    borderTopWidth: 1,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
});

export default GardenActionButtons;
