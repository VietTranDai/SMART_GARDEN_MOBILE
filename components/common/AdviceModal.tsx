import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { WeatherAdvice } from "@/types/weather/weather.types";
import { GardenAdvice } from "@/types/gardens/garden.types";

const { width } = Dimensions.get("window");

// Union type to handle both types of advice
type AdviceItem = GardenAdvice | WeatherAdvice;

interface AdviceModalProps {
  isVisible: boolean;
  onClose: () => void;
  advice: AdviceItem[];
  adviceType?: "garden" | "weather"; // Added type property to distinguish advice types
  isLoading: boolean;
  error: string | null;
  gardenName: string;
  theme: any;
}

// Định nghĩa các kiểu icon Ionicons được chấp nhận
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

// Map category của advice sang icon và label
const CATEGORY_ICON_MAP: Record<
  string,
  { icon: IoniconName; color: string; label: string }
> = {
  WATERING: { icon: "water-outline", color: "#3498db", label: "Tưới nước" },
  FERTILIZING: { icon: "leaf", color: "#27ae60", label: "Bón phân" },
  PRUNING: { icon: "cut-outline", color: "#e67e22", label: "Tỉa cây" },
  PEST_CONTROL: {
    icon: "bug-outline",
    color: "#e74c3c",
    label: "Diệt côn trùng",
  },
  WEATHER_FORECAST: {
    icon: "cloudy-outline",
    color: "#3498db",
    label: "Dự báo",
  },
  TEMPERATURE: {
    icon: "thermometer-outline",
    color: "#e67e22",
    label: "Nhiệt độ",
  },
  LIGHT: { icon: "sunny-outline", color: "#f1c40f", label: "Ánh sáng" },
  HUMIDITY: { icon: "water-outline", color: "#3498db", label: "Độ ẩm" },
  SOIL_MOISTURE: { icon: "leaf-outline", color: "#2ecc71", label: "Ẩm đất" },
  NUTRIENT: { icon: "flask-outline", color: "#9b59b6", label: "Dinh dưỡng" },
  WEEDING: { icon: "trash-outline", color: "#e74c3c", label: "Làm cỏ" },
};

const AdviceModal = ({
  isVisible,
  onClose,
  advice,
  adviceType = "garden", // Default to garden advice
  isLoading,
  error,
  gardenName,
  theme,
}: AdviceModalProps) => {
  // Helper function to check if item is GardenAdvice or WeatherAdvice
  const isGardenAdvice = (item: AdviceItem): item is GardenAdvice => {
    // Debug why items aren't being recognized
    const hasCategory = "category" in item;
    const hasAction = "action" in item;
    const hasReason = "reason" in item;

    return hasCategory && hasAction && hasReason; // If adviceType is explicitly set to garden, accept it anyway
  };

  const isWeatherAdvice = (item: AdviceItem): item is WeatherAdvice => {
    return (
      "weatherCondition" in item && "title" in item && "description" in item
    );
  };

  // Convert string priority to number if needed
  const getPriorityValue = useCallback((priority: string | number): number => {
    if (typeof priority === "number") return priority;

    switch (priority.toUpperCase()) {
      case "CRITICAL":
        return 5;
      case "HIGH":
        return 4;
      case "MEDIUM":
        return 3;
      case "LOW":
        return 2;
      default:
        return 1;
    }
  }, []);

  // Helper function to get icon based on category or advice type
  const getIconForAdvice = useCallback(
    (item: AdviceItem) => {
      if (isGardenAdvice(item) || adviceType === "garden") {
        // Cast to access category property safely
        const gardenItem = item as any;
        // Use the category map if available, otherwise use defaults
        const category = gardenItem.category?.toUpperCase() || "DEFAULT";

        const categoryInfo = CATEGORY_ICON_MAP[category] || {
          icon: "leaf-outline",
          color: theme.primary,
          label: "Chăm sóc",
        };

        return {
          icon: <Ionicons name={categoryInfo.icon} size={22} color="#fff" />,
          backgroundColor: categoryInfo.color,
          label: categoryInfo.label,
        };
      } else if (isWeatherAdvice(item)) {
        // Handle WeatherAdvice
        // Default weather icons based on condition
        switch (item.weatherCondition) {
          case "CLEAR":
            return {
              icon: <Ionicons name="sunny-outline" size={22} color="#fff" />,
              backgroundColor: "#f39c12",
              label: "Nắng",
            };
          case "RAIN":
          case "DRIZZLE":
            return {
              icon: <Ionicons name="rainy-outline" size={22} color="#fff" />,
              backgroundColor: "#3498db",
              label: "Mưa",
            };
          case "CLOUDS":
            return {
              icon: <Ionicons name="cloud-outline" size={22} color="#fff" />,
              backgroundColor: "#7f8c8d",
              label: "Mây",
            };
          case "THUNDERSTORM":
            return {
              icon: (
                <Ionicons name="thunderstorm-outline" size={22} color="#fff" />
              ),
              backgroundColor: "#8e44ad",
              label: "Bão",
            };
          default:
            return {
              icon: (
                <Ionicons name="thermometer-outline" size={22} color="#fff" />
              ),
              backgroundColor: theme.primary,
              label: "Thời tiết",
            };
        }
      } else {
        // Fallback
        return {
          icon: <Ionicons name="leaf-outline" size={22} color="#fff" />,
          backgroundColor: theme.primary,
          label: "Chăm sóc",
        };
      }
    },
    [theme, adviceType]
  );

  // Helper function to format date & time or time of day
  const formatTimeOrDate = useCallback((timeValue: string) => {
    // Check if it's likely a date string
    if (
      timeValue?.includes("-") ||
      timeValue?.includes(":") ||
      /^\d{4}/.test(timeValue)
    ) {
      try {
        const date = new Date(timeValue);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            day: "2-digit",
            month: "2-digit",
          });
        }
      } catch {
        // Not a valid date
      }
    }

    // Handle time of day
    switch (timeValue?.toLowerCase()) {
      case "morning":
        return "Buổi sáng";
      case "noon":
        return "Buổi trưa";
      case "afternoon":
        return "Buổi chiều";
      case "evening":
        return "Buổi tối";
      case "night":
        return "Ban đêm";
      default:
        return timeValue || "Không xác định";
    }
  }, []);

  // Helper function to render priority indicator
  const renderPriorityIndicator = useCallback(
    (priority: string | number) => {
      const priorityValue = getPriorityValue(priority);

      const getPriorityLabel = (p: number) => {
        if (p >= 4) return "Quan trọng";
        if (p >= 3) return "Cần thiết";
        return "Tùy chọn";
      };

      const priorityColor =
        priorityValue >= 4
          ? theme.error
          : priorityValue >= 3
            ? theme.warning
            : theme.success;

      return (
        <View style={styles.priorityContainer}>
          <View
            style={[
              styles.priorityBadge,
              {
                backgroundColor: `${priorityColor}20`,
                borderColor: `${priorityColor}50`,
              },
            ]}
          >
            <Text style={[styles.priorityText, { color: priorityColor }]}>
              {getPriorityLabel(priorityValue)}
            </Text>
          </View>
        </View>
      );
    },
    [theme, getPriorityValue]
  );

  // Render advice item - handling both types
  const renderAdviceItem = useCallback(
    ({ item, index }: { item: AdviceItem; index: number }) => {
      const anyItem = item as any; // Keep for accessing other properties like priority, description etc.

      // Call getIconForAdvice to get consistent icon, color, and label
      const iconInfo = getIconForAdvice(item);

      return (
        <View
          style={[
            styles.adviceItem,
            {
              backgroundColor: theme.card,
              borderLeftColor: iconInfo.backgroundColor, // Use color from iconInfo
              borderColor: theme.border,
              marginBottom: index === advice.length - 1 ? 0 : 16,
            },
          ]}
        >
          <View style={styles.adviceHeader}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: iconInfo.backgroundColor }, // Use color from iconInfo
              ]}
            >
              {iconInfo.icon}
            </View>
            <View style={styles.adviceTitle}>
              <Text
                style={[styles.categoryLabel, { color: theme.textSecondary }]}
              >
                {iconInfo.label}
              </Text>
              <Text style={[styles.actionText, { color: theme.text }]}>
                {anyItem.action || anyItem.title || "Lời khuyên chăm sóc"}
              </Text>
            </View>
            {anyItem.priority && renderPriorityIndicator(anyItem.priority)}
          </View>

          {anyItem.description && (
            <Text style={[styles.descriptionText, { color: theme.text }]}>
              {anyItem.description}
            </Text>
          )}

          {anyItem.reason && (
            <View
              style={[
                styles.reasonContainer,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Text
                style={[styles.reasonLabel, { color: theme.textSecondary }]}
              >
                Lý do:
              </Text>
              <Text style={[styles.reasonText, { color: theme.textSecondary }]}>
                {anyItem.reason}
              </Text>
            </View>
          )}
        </View>
      );
    },
    [theme, formatTimeOrDate, renderPriorityIndicator, getIconForAdvice] // Added getIconForAdvice to dependencies
  );

  // Component for empty advice state
  const EmptyAdviceComponent = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={{
          uri: "https://via.placeholder.com/120/E8F5E9/2E7D32?text=No+Advice", // Placeholder
        }}
        style={styles.emptyImage}
      />
      <Text style={[styles.emptyTitle, { color: theme.primary }]}>
        Mọi thứ đang tốt!
      </Text>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        Vườn của bạn đang phát triển tốt. Hiện không có lời khuyên nào cần thực
        hiện.
      </Text>
    </View>
  );

  // Xắp xếp lời khuyên theo mức độ ưu tiên
  const sortedAdvice = React.useMemo(() => {
    if (!advice || !advice.length) {
      return [];
    }

    // Không sort để giữ nguyên thứ tự từ API
    return [...advice];
  }, [advice]);

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.6)" }]}
      >
        <View
          style={[styles.modalContainer, { backgroundColor: theme.background }]}
        >
          {/* Header with solid color */}
          <View
            style={[styles.modalHeader, { backgroundColor: theme.primary }]}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerIconContainer}>
                <FontAwesome5 name="lightbulb" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Lời khuyên chăm sóc</Text>
                <Text style={styles.gardenName}>{gardenName}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.modalContent}>
            {isLoading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text
                  style={[styles.loadingText, { color: theme.textSecondary }]}
                >
                  Đang tải lời khuyên...
                </Text>
              </View>
            ) : error ? (
              <View style={styles.centerContainer}>
                <Image
                  source={{
                    uri: "https://via.placeholder.com/100/FFEBEE/D32F2F?text=Error", // Placeholder
                  }}
                  style={styles.errorImage}
                />
                <Text style={[styles.errorText, { color: theme.error }]}>
                  {error}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.retryButton,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <Text style={[styles.retryText, { color: "#fff" }]}>
                    Thử lại
                  </Text>
                </TouchableOpacity>
              </View>
            ) : sortedAdvice.length === 0 ? (
              <EmptyAdviceComponent />
            ) : (
              <FlatList
                data={sortedAdvice}
                renderItem={renderAdviceItem}
                keyExtractor={(item, index) =>
                  `advice-${index}-${(item as any).id || index}`
                }
                contentContainerStyle={styles.adviceList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 500,
    maxHeight: "90%",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Inter-Bold",
    color: "#fff",
  },
  gardenName: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    flex: 1,
    paddingBottom: 8,
  },
  adviceList: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  adviceItem: {
    borderRadius: 16,
    borderLeftWidth: 4,
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
  },
  adviceHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  adviceTitle: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 13,
    fontFamily: "Inter-SemiBold",
    marginBottom: 4,
    textTransform: "uppercase",
    opacity: 0.9,
  },
  actionText: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    lineHeight: 22,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    lineHeight: 21,
    marginBottom: 14,
    // color is set inline using theme.text
  },
  reasonContainer: {
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    // backgroundColor is set inline using theme.backgroundSecondary
  },
  reasonLabel: {
    fontSize: 13,
    fontFamily: "Inter-SemiBold",
    marginBottom: 5,
  },
  reasonText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    lineHeight: 20,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  timeIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  timeText: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
  },
  priorityContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 8,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    // backgroundColor and borderColor are set inline based on priority and theme
  },
  priorityText: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    textTransform: "uppercase",
    // color is set inline based on priority and theme
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: "Inter-Regular",
    marginTop: 16,
    // color is set inline using theme.textSecondary
  },
  errorImage: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 20,
    opacity: 0.7,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
    // color is set inline using theme.error
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 8,
    // backgroundColor is set inline using theme.primary
  },
  retryText: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    // color is set inline as "#fff"
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  emptyImage: {
    width: 120,
    height: 120,
    borderRadius: 24,
    marginBottom: 24,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    marginBottom: 10,
    // color is set inline using theme.primary
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter-Regular",
    textAlign: "center",
    lineHeight: 22,
    // color is set inline using theme.textSecondary
  },
});

export default AdviceModal;
