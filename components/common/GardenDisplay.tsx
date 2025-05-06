import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";
import useSectionAnimation from "@/hooks/useSectionAnimation";
import { GardenDisplay as GardenDisplayType } from "@/hooks/useHomeData";
import { GardenType } from "@/types/gardens/garden.types";

// Mở rộng interface GardenDisplay để thêm các thuộc tính thiếu
interface ExtendedGardenDisplay extends GardenDisplayType {
  imageUrl?: string;
  plantCount?: number;
  sensorCount?: number;
  area?: number;
  createdAt?: string;
}

interface GardenDisplayProps {
  gardens: ExtendedGardenDisplay[];
  selectedGardenId?: number | null;
  onSelectGarden: (gardenId: number) => void;
  onTogglePinGarden: (gardenId: number) => void;
  showFullDetails?: boolean;
}

export default function GardenDisplay({
  gardens,
  selectedGardenId,
  onSelectGarden,
  onTogglePinGarden,
  showFullDetails = false,
}: GardenDisplayProps) {
  const theme = useAppTheme();
  const { getAnimatedStyle } = useSectionAnimation("gardens");
  const scrollViewRef = useRef<ScrollView>(null);

  const getGardenIcon = (type: GardenType) => {
    switch (type) {
      case "INDOOR":
        return "home-outline";
      case "OUTDOOR":
        return "leaf-outline";
      case "GREENHOUSE" as GardenType:
        return "umbrella-outline";
      case "BALCONY" as GardenType:
        return "grid-outline";
      case "ROOFTOP" as GardenType:
        return "business-outline";
      case "WINDOW_SILL" as GardenType:
        return "apps-outline";
      default:
        return "leaf-outline";
    }
  };

  const getGardenTypeText = (type: GardenType) => {
    switch (type) {
      case "INDOOR":
        return "Vườn trong nhà";
      case "OUTDOOR":
        return "Vườn ngoài trời";
      case "GREENHOUSE" as GardenType:
        return "Nhà kính";
      case "BALCONY" as GardenType:
        return "Vườn ban công";
      case "ROOFTOP" as GardenType:
        return "Vườn sân thượng";
      case "WINDOW_SILL" as GardenType:
        return "Vườn cửa sổ";
      default:
        return "Vườn";
    }
  };

  const getGardenEmojiIcon = (type: GardenType) => {
    switch (type) {
      case "INDOOR":
        return "🏡";
      case "OUTDOOR":
        return "🌿";
      case "GREENHOUSE" as GardenType:
        return "🏕️";
      case "BALCONY" as GardenType:
        return "🌻";
      case "ROOFTOP" as GardenType:
        return "🏢";
      case "WINDOW_SILL" as GardenType:
        return "🪟";
      default:
        return "🌱";
    }
  };

  const getGardenBackgroundColor = (type: GardenType, isSelected: boolean) => {
    if (isSelected) {
      return `${theme.primary}10`;
    }

    switch (type) {
      case "INDOOR":
        return "#F5F3FF"; // Light purple
      case "OUTDOOR":
        return "#ECFDF5"; // Light green
      case "GREENHOUSE" as GardenType:
        return "#F0FFF4"; // Lighter green
      case "BALCONY" as GardenType:
        return "#FEF3C7"; // Light yellow
      case "ROOFTOP" as GardenType:
        return "#FEF2F2"; // Light red
      case "WINDOW_SILL" as GardenType:
        return "#EFF6FF"; // Light blue
      default:
        return "#F9FAFB"; // Light gray
    }
  };

  const renderGardenCard = (garden: ExtendedGardenDisplay, index: number) => {
    const isSelected = garden.id === selectedGardenId;
    const iconName = getGardenIcon(garden.type);
    const emojiIcon = getGardenEmojiIcon(garden.type);
    const bgColor = getGardenBackgroundColor(garden.type, isSelected);

    // Card scale animation for selection
    const scaleValue = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Scroll to this item if it's selected
      if (scrollViewRef.current && gardens.length > 2) {
        scrollViewRef.current.scrollTo({
          x: index * 180,
          animated: true,
        });
      }

      onSelectGarden(garden.id);
    };

    return (
      <Animated.View
        key={garden.id}
        style={{
          transform: [{ scale: scaleValue }],
        }}
      >
        <TouchableOpacity
          style={[
            styles.gardenCard,
            {
              backgroundColor: bgColor,
              borderColor: isSelected ? theme.primary : "transparent",
              borderWidth: isSelected ? 2 : 0,
              ...Platform.select({
                ios: {
                  shadowColor: isSelected ? theme.primary : "rgba(0,0,0,0.1)",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                },
                android: {
                  elevation: isSelected ? 4 : 2,
                },
              }),
            },
          ]}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <View style={styles.gardenHeader}>
            <View
              style={[
                styles.emojiContainer,
                { backgroundColor: `${theme.primary}15` },
              ]}
            >
              <Text style={styles.gardenEmoji}>{emojiIcon}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.pinButton,
                {
                  backgroundColor: garden.isPinned
                    ? `${theme.primary}20`
                    : "rgba(0,0,0,0.05)",
                },
              ]}
              onPress={() => onTogglePinGarden(garden.id)}
            >
              <Ionicons
                name={garden.isPinned ? "pin" : "pin-outline"}
                size={16}
                color={garden.isPinned ? theme.primary : theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <Text
            style={[styles.gardenName, { color: theme.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {garden.name}
          </Text>

          <Text style={[styles.gardenType, { color: theme.textSecondary }]}>
            {getGardenTypeText(garden.type)}
          </Text>

          <View style={styles.gardenStats}>
            <View style={styles.statItem}>
              <Ionicons name="leaf-outline" size={14} color={theme.primary} />
              <Text style={[styles.statValue, { color: theme.text }]}>
                {garden.plantCount || 0}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name="hardware-chip-outline"
                size={14}
                color={theme.primary}
              />
              <Text style={[styles.statValue, { color: theme.text }]}>
                {garden.sensorCount || 0}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name="alert-circle-outline"
                size={14}
                color={garden.alertCount > 0 ? theme.warning : theme.primary}
              />
              <Text
                style={[
                  styles.statValue,
                  {
                    color: garden.alertCount > 0 ? theme.warning : theme.text,
                  },
                ]}
              >
                {garden.alertCount}
              </Text>
            </View>
          </View>

          {garden.location && (
            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={12}
                color={theme.textSecondary}
              />
              <Text
                style={[styles.locationText, { color: theme.textSecondary }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {garden.location}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCreateGardenCard = () => {
    return (
      <TouchableOpacity
        style={[
          styles.gardenCard,
          styles.createGardenCard,
          { backgroundColor: theme.background, borderColor: theme.border },
        ]}
        onPress={() => router.push("/garden/create")}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.createIconContainer,
            { backgroundColor: theme.primary + "20" },
          ]}
        >
          <Ionicons name="add" size={28} color={theme.primary} />
        </View>
        <Text style={[styles.createCardText, { color: theme.text }]}>
          Thêm vườn mới
        </Text>
      </TouchableOpacity>
    );
  };

  if (gardens.length === 0) {
    return (
      <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
        <Ionicons name="leaf-outline" size={48} color={theme.textSecondary} />
        <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
          Bạn chưa có vườn nào. Hãy tạo vườn mới để bắt đầu!
        </Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: theme.primary }]}
          onPress={() => router.push("/garden/create")}
        >
          <Text style={[styles.createButtonText, { color: "#FFFFFF" }]}>
            Tạo vườn mới
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, getAnimatedStyle()]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Vườn của bạn
        </Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push("/gardens")}
        >
          <Text style={[styles.viewAllText, { color: theme.primary }]}>
            Xem tất cả
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        snapToInterval={180}
        decelerationRate="fast"
      >
        {gardens.map(renderGardenCard)}
        {renderCreateGardenCard()}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginRight: 2,
  },
  scrollView: {
    paddingLeft: 20,
  },
  scrollViewContent: {
    paddingRight: 20,
    gap: 16,
  },
  gardenCard: {
    width: 160,
    height: 180,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  gardenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  emojiContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  gardenEmoji: {
    fontSize: 20,
  },
  pinButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  gardenName: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    marginBottom: 4,
  },
  gardenType: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    marginBottom: 12,
  },
  gardenStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    fontFamily: "Inter-Regular",
    flex: 1,
  },
  createGardenCard: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    height: 180,
  },
  createIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  createCardText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
    padding: 40,
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
  },
});
