import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { router, Stack } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
  FontAwesome5,
} from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { GardenStatus, GardenType } from "@/types";
import { gardenService } from "@/service/api";
import { Garden } from "@/types/gardens/garden.types";

export default function GardensScreen() {
  const theme = useAppTheme();
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const fetchGardens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const gardenData = await gardenService.getGardens();
      setGardens(gardenData);
    } catch (err) {
      console.error("Failed to load gardens:", err);
      setError("Không thể tải danh sách vườn. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGardens();
  }, [fetchGardens]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGardens();
    setRefreshing(false);
  }, [fetchGardens]);

  // --- Helper Functions (Use new interface/enums) ---
  const getStatusColor = (status: GardenStatus) => {
    switch (status) {
      case GardenStatus.ACTIVE:
        return theme.success;
      case GardenStatus.INACTIVE:
        return theme.textTertiary;
      // Add cases for other statuses if needed
      default:
        return theme.warning; // Default for PENDING etc.
    }
  };

  const getGardenTypeIcon = (type: GardenType) => {
    switch (type) {
      case GardenType.INDOOR:
        return "home-outline";
      case GardenType.OUTDOOR:
        return "leaf-outline";
      case GardenType.BALCONY:
        return "grid-outline";
      case GardenType.ROOFTOP:
        return "business-outline";
      case GardenType.WINDOW_SILL:
        return "browsers-outline";
      default:
        return "help-circle-outline";
    }
  };

  const getStatusText = (status: GardenStatus): string => {
    switch (status) {
      case GardenStatus.ACTIVE:
        return "Hoạt động";
      case GardenStatus.INACTIVE:
        return "Ngừng";
      // Add other statuses like PENDING if used
      default:
        return status;
    }
  };

  const getGardenTypeText = (type: GardenType): string => {
    switch (type) {
      case GardenType.INDOOR:
        return "Trong nhà";
      case GardenType.OUTDOOR:
        return "Ngoài trời";
      case GardenType.BALCONY:
        return "Ban công";
      case GardenType.ROOFTOP:
        return "Sân thượng";
      case GardenType.WINDOW_SILL:
        return "Cửa sổ";
      default:
        return type;
    }
  };

  // Get garden location display text
  const getLocationText = (garden: Garden): string => {
    const parts = [];
    if (garden.district) parts.push(garden.district);
    if (garden.city) parts.push(garden.city);
    return parts.length > 0 ? parts.join(", ") : "Chưa có địa chỉ";
  };

  // --- Render Logic (Use fields from Garden) ---
  const renderGardenItem = ({ item }: { item: Garden }) => (
    <TouchableOpacity
      style={styles.gardenCard}
      onPress={() => router.push(`/(modules)/gardens/${item.id}`)}
    >
      <Image
        source={{ uri: `/gardens/${item.id}/thumbnail` }}
        style={styles.gardenThumbnail}
        resizeMode="cover"
        defaultSource={require("@/assets/images/icon.png")}
      />
      {/* Show alert badge if available from backend in the future */}
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) },
        ]}
      >
        <Text style={styles.statusBadgeText}>{getStatusText(item.status)}</Text>
      </View>
      <View style={styles.gardenContent}>
        <Text style={styles.gardenTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.gardenMetaRow}>
          <View style={styles.gardenMetaItem}>
            <Ionicons
              name={getGardenTypeIcon(item.type) as any}
              size={14}
              color={theme.textSecondary}
            />
            <Text style={styles.gardenMetaText}>
              {getGardenTypeText(item.type)}
            </Text>
          </View>
          <View style={styles.gardenMetaItem}>
            <Ionicons
              name="location-outline"
              size={14}
              color={theme.textSecondary}
            />
            <Text style={styles.gardenMetaText} numberOfLines={1}>
              {getLocationText(item)}
            </Text>
          </View>
        </View>
        <View style={styles.gardenMetaRow}>
          {item.plantName && (
            <View style={styles.gardenMetaItem}>
              <Feather name="target" size={14} color={theme.textSecondary} />
              <Text style={styles.gardenMetaText}>{item.plantName}</Text>
            </View>
          )}
          {item.plantGrowStage && (
            <View style={styles.gardenMetaItem}>
              <FontAwesome5
                name="seedling"
                size={13}
                color={theme.textSecondary}
              />
              <Text style={styles.gardenMetaText}>{item.plantGrowStage}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          title: "Khu vườn của tôi",
          headerRight: () => (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push("/(modules)/gardens/create")}
            >
              <Ionicons name="add-outline" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Đang tải khu vườn...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchGardens}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : gardens.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="sprout"
            size={64}
            color={theme.textTertiary}
          />
          <Text style={styles.emptyTitle}>Chưa có khu vườn nào</Text>
          <Text style={styles.emptyText}>
            Bạn chưa có khu vườn nào. Hãy tạo khu vườn đầu tiên của bạn ngay!
          </Text>
          <TouchableOpacity
            style={styles.createGardenButton}
            onPress={() => router.push("/(modules)/gardens/create")}
          >
            <Text style={styles.createGardenButtonText}>Tạo khu vườn</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={gardens}
          renderItem={renderGardenItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    gardenList: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 80,
    },
    gardenCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 16,
      elevation: 3,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      position: "relative",
    },
    gardenThumbnail: {
      width: "100%",
      height: 150,
      backgroundColor: theme.border,
    },
    statusBadge: {
      position: "absolute",
      top: 10,
      left: 10,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      opacity: 0.9,
      zIndex: 1,
    },
    alertBadge: {
      position: "absolute",
      top: 10,
      right: 10,
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.error,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 5,
      zIndex: 1,
    },
    alertBadgeText: {
      color: theme.card,
      fontSize: 12,
      fontFamily: "Inter-Bold",
    },
    statusBadgeText: {
      color: theme.card,
      fontSize: 11,
      fontFamily: "Inter-SemiBold",
      textTransform: "uppercase",
    },
    gardenContent: {
      padding: 14,
    },
    gardenTitle: {
      fontSize: 17,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 8,
    },
    gardenMetaRow: {
      flexDirection: "row",
      marginBottom: 6,
      flexWrap: "wrap",
      gap: 16,
    },
    gardenMetaItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    gardenMetaText: {
      fontSize: 13,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginLeft: 5,
    },
    gardenPlantInfo: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textTertiary,
      marginTop: 6,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
      marginTop: 40,
      minHeight: 300,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      textAlign: "center",
      marginTop: 16,
      marginBottom: 24,
    },
    createButtonEmpty: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 25,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primary,
      elevation: 2,
    },
    createButtonText: {
      color: theme.card,
      fontSize: 16,
      fontFamily: "Inter-Medium",
      marginLeft: 8,
    },
    fab: {
      position: "absolute",
      bottom: 30,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      elevation: 5,
    },
    loadingText: {
      color: theme.text,
      fontSize: 16,
      fontFamily: "Inter-Regular",
      marginTop: 16,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
      marginTop: 40,
      minHeight: 300,
    },
    errorText: {
      color: theme.error,
      fontSize: 16,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      marginTop: 16,
      marginBottom: 24,
    },
    retryButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 25,
      backgroundColor: theme.primary,
      elevation: 2,
    },
    retryButtonText: {
      color: theme.card,
      fontSize: 16,
      fontFamily: "Inter-Medium",
    },
    createGardenButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 25,
      backgroundColor: theme.primary,
      elevation: 2,
    },
    createGardenButtonText: {
      color: theme.card,
      fontSize: 16,
      fontFamily: "Inter-Medium",
    },
    emptyTitle: {
      fontSize: 20,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 16,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 80,
    },
    createButton: {
      padding: 12,
    },
  });
