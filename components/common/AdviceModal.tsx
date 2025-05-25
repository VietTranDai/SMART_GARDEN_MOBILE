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
import { LinearGradient } from "expo-linear-gradient";

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
    const hasSuggestedTime = "suggestedTime" in item;

    const isValid = hasCategory && hasAction && hasReason && hasSuggestedTime;

    return isValid || adviceType === "garden"; // If adviceType is explicitly set to garden, accept it anyway
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
      // Xử lý đơn giản hóa, lấy dữ liệu trực tiếp
      const anyItem = item as any;

      // Chọn phân loại dựa trên dữ liệu có sẵn
      const category = anyItem.category?.toUpperCase() || "DEFAULT";
      const categoryInfo = CATEGORY_ICON_MAP[category] || {
        icon: "leaf-outline",
        color: theme.primary,
        label: "Chăm sóc",
      };

      // Hiển thị theo định dạng đơn giản nhất
      return (
        <View
          style={[
            styles.adviceItem,
            {
              backgroundColor: theme.card,
              borderLeftColor: categoryInfo.color,
              marginBottom: index === advice.length - 1 ? 0 : 16,
            },
          ]}
        >
          <View style={styles.adviceHeader}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: categoryInfo.color },
              ]}
            >
              <Ionicons name={categoryInfo.icon} size={22} color="#fff" />
            </View>
            <View style={styles.adviceTitle}>
              <Text
                style={[styles.categoryLabel, { color: categoryInfo.color }]}
              >
                {categoryInfo.label}
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
            <View style={styles.reasonContainer}>
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

          {anyItem.suggestedTime && (
            <View style={styles.timeContainer}>
              <View
                style={[
                  styles.timeIconContainer,
                  { backgroundColor: categoryInfo.color + "50" },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={categoryInfo.color}
                />
              </View>
              <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                Đề xuất thực hiện: {formatTimeOrDate(anyItem.suggestedTime)}
              </Text>
            </View>
          )}
        </View>
      );
    },
    [theme, formatTimeOrDate, renderPriorityIndicator]
  );

  // Component for empty advice state
  const EmptyAdviceComponent = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=300",
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
        style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}
      >
        <View
          style={[styles.modalContainer, { backgroundColor: theme.background }]}
        >
          {/* Header with gradient */}
          <LinearGradient
            colors={[theme.primary, `${theme.primary}90`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.modalHeader}
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
          </LinearGradient>

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
                    uri: "https://images.unsplash.com/photo-1555861496-0666c8981751?q=80&w=300",
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
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 500,
    maxHeight: "85%",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    color: "#fff",
  },
  gardenName: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: "0%",
  },
  adviceList: {
    padding: 16,
    paddingTop: 20,
  },
  adviceItem: {
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  adviceHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  adviceTitle: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  actionText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    lineHeight: 20,
    marginBottom: 12,
  },
  reasonContainer: {
    marginBottom: 12,
    backgroundColor: "rgba(0,0,0,0.03)",
    padding: 12,
    borderRadius: 8,
  },
  reasonLabel: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    lineHeight: 18,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
  priorityContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 11,
    fontFamily: "Inter-SemiBold",
    textTransform: "uppercase",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    marginTop: 12,
  },
  errorImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default AdviceModal;
