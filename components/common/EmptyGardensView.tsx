import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { router } from "expo-router";

const EmptyGardensView: React.FC = () => {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.cardAlt }]}>
      <View
        style={[styles.imageContainer, { backgroundColor: theme.primaryLight }]}
      >
        <MaterialCommunityIcons name="sprout" size={80} color={theme.primary} />
      </View>

      <Text style={[styles.title, { color: theme.text }]}>
        Chưa có vườn nào
      </Text>

      <Text style={[styles.description, { color: theme.textSecondary }]}>
        Tạo vườn đầu tiên của bạn để bắt đầu hành trình làm vườn thông minh!
      </Text>

      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: theme.primary }]}
        onPress={() => router.push("/(modules)/gardens/create")}
        accessibilityLabel="Tạo vườn đầu tiên của bạn"
        accessibilityRole="button"
      >
        <MaterialCommunityIcons
          name="flower-tulip"
          size={20}
          color={theme.card}
        />
        <Text style={[styles.createText, { color: theme.card }]}>
          Tạo Vườn Mới
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    margin: 20,
    borderRadius: 16,
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter-Bold",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    textAlign: "center",
    marginBottom: 24,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  createText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    marginLeft: 8,
  },
});

export default EmptyGardensView;
