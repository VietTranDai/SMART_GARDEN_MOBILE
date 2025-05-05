import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Garden, GardenStatus, GardenType } from "@/types/gardens/garden.types";

interface EnhancedGardenCardProps {
  garden: Garden;
  isPinned: boolean;
  alertCount: number;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onPinPress: () => void;
  mainSensorValue?: {
    type: string;
    value: number;
    unit: string;
  };
  location?: string;
  statusColor?: string;
  lastActivity?: string;
}

export default function EnhancedGardenCard({
  garden,
  isPinned,
  alertCount,
  isSelected,
  onPress,
  onLongPress,
  onPinPress,
  mainSensorValue,
  location,
  statusColor,
  lastActivity,
}: EnhancedGardenCardProps) {
  const theme = useAppTheme();

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const cardRef = useRef(null);

  // When selected state changes, animate the card
  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: theme.animationTiming.fast / 2,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSelected, scaleAnim, theme.animationTiming.fast]);

  // Animation for appearing on mount
  useEffect(() => {
    opacityAnim.setValue(0);
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: theme.animationTiming.medium,
      useNativeDriver: true,
    }).start();
  }, [opacityAnim, theme.animationTiming.medium]);

  // Get garden type icon
  const getGardenTypeIcon = (type: GardenType) => {
    switch (type) {
      case GardenType.INDOOR:
        return (
          <MaterialCommunityIcons
            name="home"
            size={14}
            color={theme.textSecondary}
          />
        );
      case GardenType.OUTDOOR:
        return (
          <MaterialCommunityIcons
            name="tree"
            size={14}
            color={theme.textSecondary}
          />
        );
      case GardenType.BALCONY:
        return (
          <MaterialCommunityIcons
            name="balcony"
            size={14}
            color={theme.textSecondary}
          />
        );
      case GardenType.ROOFTOP:
        return (
          <MaterialCommunityIcons
            name="office-building"
            size={14}
            color={theme.textSecondary}
          />
        );
      case GardenType.WINDOW_SILL:
        return (
          <MaterialCommunityIcons
            name="window-closed-variant"
            size={14}
            color={theme.textSecondary}
          />
        );
      default:
        return (
          <MaterialCommunityIcons
            name="flower"
            size={14}
            color={theme.textSecondary}
          />
        );
    }
  };

  // Get garden type label
  const getGardenTypeLabel = (type: GardenType): string => {
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
        return "Bậu cửa sổ";
      default:
        return "Không xác định";
    }
  };

  // Format date for better display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const today = new Date();

    // If today, just show time
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Otherwise show date in compact format
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Placeholder image to use when garden.profilePicture is empty or invalid
  const placeholderImage =
    garden.type === GardenType.INDOOR
      ? "https://i.imgur.com/3ghLDnR.jpg" // Indoor garden placeholder
      : "https://i.imgur.com/DKZMXt1.jpg"; // Outdoor garden placeholder

  return (
    <Animated.View
      ref={cardRef}
      style={[
        styles.container,
        {
          borderColor: isSelected ? theme.primary : statusColor || theme.card,
          backgroundColor: theme.card,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          ...theme.elevation2,
        },
        isPinned && styles.pinnedContainer,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Vườn ${garden.name}, loại ${getGardenTypeLabel(
        garden.type
      )}`}
      accessibilityHint="Nhấn để xem chi tiết về vườn này"
    >
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.touchable}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        {/* Garden image with overlay */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: garden.profilePicture || placeholderImage }}
            style={styles.image}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
            placeholder={require("@/assets/images/garden-placeholder.png")}
            contentPosition="center"
          />

          <LinearGradient
            colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.7)"]}
            style={styles.imageOverlay}
          />

          {/* Pin button */}
          <TouchableOpacity
            style={styles.pinButton}
            onPress={onPinPress}
            accessibilityLabel={isPinned ? "Bỏ ghim vườn này" : "Ghim vườn này"}
            accessibilityRole="button"
          >
            <MaterialIcons
              name="push-pin"
              size={20}
              color={isPinned ? theme.accent : theme.textInverted}
              style={{ opacity: isPinned ? 1 : 0.6 }}
            />
          </TouchableOpacity>

          {/* Alert badge */}
          {alertCount > 0 && (
            <View style={[styles.alertBadge, { backgroundColor: theme.error }]}>
              <Text style={styles.alertBadgeText}>{alertCount}</Text>
            </View>
          )}

          {/* Garden name overlay */}
          <View style={styles.titleOverlay}>
            <Text
              style={[styles.titleText, { color: theme.textInverted }]}
              numberOfLines={1}
            >
              {garden.name}
            </Text>
          </View>
        </View>

        {/* Content container */}
        <View style={styles.contentContainer}>
          {/* Garden type */}
          <View style={styles.typeContainer}>
            {getGardenTypeIcon(garden.type)}
            <Text style={[styles.typeText, { color: theme.textSecondary }]}>
              {getGardenTypeLabel(garden.type)}
            </Text>
          </View>

          {/* Location if available */}
          {location && (
            <View style={styles.detailRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color={theme.textSecondary}
              />
              <Text
                style={[styles.locationText, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                {location}
              </Text>
            </View>
          )}

          {/* Main sensor value if available */}
          {mainSensorValue && (
            <View style={styles.sensorContainer}>
              <MaterialCommunityIcons
                name={
                  mainSensorValue.type === "temperature"
                    ? "thermometer"
                    : "water-percent"
                }
                size={18}
                color={theme.primary}
              />
              <Text style={[styles.sensorValue, { color: theme.primary }]}>
                {mainSensorValue.value?.toFixed(1)}
                {mainSensorValue.unit}
              </Text>
            </View>
          )}

          {/* Last activity timestamp */}
          {lastActivity && (
            <Text style={[styles.lastActivity, { color: theme.textTertiary }]}>
              {formatDate(lastActivity)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    height: 260,
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: "hidden",
    margin: 6,
  },
  pinnedContainer: {
    borderWidth: 2,
  },
  touchable: {
    width: "100%",
    height: "100%",
  },
  imageContainer: {
    width: "100%",
    height: 140,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E8F5E9",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
  },
  titleOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  titleText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  contentContainer: {
    padding: 12,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  typeText: {
    fontSize: 13,
    fontFamily: "Inter-Medium",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    flex: 1,
  },
  sensorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  sensorValue: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
  },
  lastActivity: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    marginTop: 6,
  },
  pinButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  alertBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  alertBadgeText: {
    color: "white",
    fontSize: 12,
    fontFamily: "Inter-Bold",
  },
});
