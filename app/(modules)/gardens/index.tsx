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
import { GardenStatus, GardenType } from "@/constants/database";

// --- Mock Data & Types (Aligned with Schema) ---
// Interface matching Prisma Garden model fields relevant for list display
interface GardenListItem {
  id: number; // or string if your API uses string IDs
  gardenKey: string;
  name: string;
  type: GardenType;
  status: GardenStatus;
  plantName?: string;
  plantGrowStage?: string;
  city?: string; // Example location field
  district?: string;
  thumbnail?: string; // Using thumbnail instead of 'image'
  // Add other fields if needed for display, e.g., alert count
  alertCount?: number;
}

// Updated Mock Generator
const generateMockGardens = (count: number): GardenListItem[] => {
  const gardens: GardenListItem[] = [];
  const gardenTypes = Object.values(GardenType);
  const gardenStatuses = Object.values(GardenStatus);
  const plantNames = [
    "Cà chua",
    "Rau thơm",
    "Rau hỗn hợp",
    "Hoa hồng",
    "Dâu tây",
  ];
  const cities = ["TP. HCM", "Hà Nội", "Đà Nẵng"];
  const districts = ["Quận 1", "Thủ Đức", "Bình Thạnh", "Hai Bà Trưng"];
  const images = [
    "https://via.placeholder.com/200x120/87CEEB/000000?text=Vườn+Rau",
    "https://via.placeholder.com/200x120/FFC0CB/000000?text=Vườn+Hoa",
    "https://via.placeholder.com/200x120/98FB98/000000?text=Vườn+Thảo+Mộc",
    "https://via.placeholder.com/200x120/E6E6FA/000000?text=Vườn+Chung",
    "https://via.placeholder.com/200x120/FFE4E1/000000?text=Vườn+Dâu",
  ];

  for (let i = 1; i <= count; i++) {
    const type = gardenTypes[i % gardenTypes.length];
    const status = gardenStatuses[i % gardenStatuses.length];
    const plant = plantNames[i % plantNames.length];

    gardens.push({
      id: i,
      gardenKey: `VUON_${String(i).padStart(4, "0")}`,
      name: `Vườn ${i} - ${plant}`,
      type: type,
      status: status,
      plantName: plant,
      plantGrowStage: ["Ra hoa", "Đang lớn", "Nảy mầm", "Thu hoạch"][i % 4],
      city: cities[i % cities.length],
      district: districts[i % districts.length],
      thumbnail: images[i % images.length],
      alertCount: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0, // ~30% chance of alerts
    });
  }
  return gardens;
};

export default function GardensScreen() {
  const theme = useAppTheme();
  const [gardens, setGardens] = useState<GardenListItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const fetchGardens = useCallback(async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setGardens(generateMockGardens(7)); // Generate 7 mock gardens
    setLoading(false);
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

  // --- Render Logic (Use fields from GardenListItem) ---

  const renderGardenItem = ({ item }: { item: GardenListItem }) => (
    <TouchableOpacity
      style={styles.gardenCard}
      onPress={() => router.push(`/(modules)/gardens/${item.id}`)}
    >
      <Image
        source={{ uri: item.thumbnail }}
        style={styles.gardenThumbnail}
        resizeMode="cover"
        defaultSource={require("@/assets/images/icon.png")}
      />
      {item.alertCount && item.alertCount > 0 && (
        <View style={styles.alertBadge}>
          <Text style={styles.alertBadgeText}>{item.alertCount}</Text>
        </View>
      )}
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
            <Text style={styles.gardenMetaText}>
              {item.district || item.city || "N/A"}
            </Text>
          </View>
        </View>
        {(item.plantName || item.plantGrowStage) && (
          <Text style={styles.gardenPlantInfo} numberOfLines={1}>
            {/* Explicitly render plantName or null */}
            {item.plantName ? item.plantName : null}
            {/* Conditionally render separator and stage */}
            {item.plantName && item.plantGrowStage ? " • " : null}
            {item.plantGrowStage ? item.plantGrowStage : null}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Quản lý Vườn" }} />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <FlatList
          data={gardens}
          renderItem={renderGardenItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.gardenList}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome5
                name="seedling"
                size={48}
                color={theme.textTertiary}
              />
              <Text style={styles.emptyText}>
                Chưa có khu vườn nào được tạo.
              </Text>
              <TouchableOpacity
                style={styles.createButtonEmpty}
                onPress={() => router.push("/(modules)/gardens/create")}
              >
                <Ionicons name="add" size={20} color={theme.card} />
                <Text style={styles.createButtonText}>
                  Tạo khu vườn đầu tiên
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      </SafeAreaView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(modules)/gardens/create")}
      >
        <Ionicons name="add" size={30} color={theme.card} />
      </TouchableOpacity>
    </>
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
  });
