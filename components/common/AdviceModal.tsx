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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { GardenAdvice, WeatherAdvice } from "@/types/weather/weather.types";
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
    return (
      "category" in item &&
      "action" in item &&
      "reason" in item &&
      "suggestedTime" in item
    );
  };

  const isWeatherAdvice = (item: AdviceItem): item is WeatherAdvice => {
    return (
      "weatherCondition" in item && "title" in item && "description" in item
    );
  };

  // Helper function to get icon based on category or advice type
  const getIconForAdvice = useCallback(
    (item: AdviceItem) => {
      if (isGardenAdvice(item)) {
        // Handle GardenAdvice
        switch (item.category) {
          case "WATERING":
            return {
              icon: <Ionicons name="water-outline" size={22} color="#fff" />,
              backgroundColor: "#3498db",
              label: "Tưới nước",
            };
          case "FERTILIZING":
            return {
              icon: (
                <MaterialCommunityIcons
                  name="leaf-circle"
                  size={22}
                  color="#fff"
                />
              ),
              backgroundColor: "#27ae60",
              label: "Bón phân",
            };
          case "PRUNING":
            return {
              icon: (
                <MaterialCommunityIcons
                  name="scissors-cutting"
                  size={22}
                  color="#fff"
                />
              ),
              backgroundColor: "#e67e22",
              label: "Tỉa cây",
            };
          case "PEST_CONTROL":
            return {
              icon: (
                <MaterialCommunityIcons
                  name="bug-outline"
                  size={22}
                  color="#fff"
                />
              ),
              backgroundColor: "#e74c3c",
              label: "Diệt côn trùng",
            };
          default:
            return {
              icon: <Ionicons name="leaf-outline" size={22} color="#fff" />,
              backgroundColor: theme.primary,
              label: "Chăm sóc",
            };
        }
      } else if (isWeatherAdvice(item)) {
        // Handle WeatherAdvice
        if (item.icon) {
          return {
            icon: <Ionicons name={item.icon} size={22} color="#fff" />,
            backgroundColor: "#3498db",
            label: "Thời tiết",
          };
        }

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
    [theme]
  );

  // Helper function to format date
  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        day: "2-digit",
        month: "2-digit",
      });
    } catch (err) {
      return "Không xác định";
    }
  }, []);

  // Helper function to render priority indicator
  const renderPriorityIndicator = useCallback(
    (priority: number) => {
      const getPriorityLabel = (p: number) => {
        if (p >= 4) return "Quan trọng";
        if (p >= 3) return "Cần thiết";
        return "Tùy chọn";
      };

      const priorityColor =
        priority >= 4
          ? theme.error
          : priority >= 3
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
              {getPriorityLabel(priority)}
            </Text>
          </View>
        </View>
      );
    },
    [theme]
  );

  // Render advice item - handling both types
  const renderAdviceItem = useCallback(
    ({ item }: { item: AdviceItem }) => {
      if (isGardenAdvice(item)) {
        // Render Garden Advice
        const categoryInfo = getIconForAdvice(item);
        return (
          <View
            style={[
              styles.adviceItem,
              {
                backgroundColor: theme.card,
                borderLeftColor: categoryInfo.backgroundColor,
              },
            ]}
          >
            <View style={styles.adviceHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: categoryInfo.backgroundColor },
                ]}
              >
                {categoryInfo.icon}
              </View>
              <View style={styles.adviceTitle}>
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: categoryInfo.backgroundColor },
                  ]}
                >
                  {categoryInfo.label}
                </Text>
                <Text style={[styles.actionText, { color: theme.text }]}>
                  {item.action}
                </Text>
              </View>
              {renderPriorityIndicator(item.priority)}
            </View>

            <Text style={[styles.descriptionText, { color: theme.text }]}>
              {item.description}
            </Text>

            <View style={styles.reasonContainer}>
              <Text
                style={[styles.reasonLabel, { color: theme.textSecondary }]}
              >
                Lý do:
              </Text>
              <Text style={[styles.reasonText, { color: theme.textSecondary }]}>
                {item.reason}
              </Text>
            </View>

            <View style={styles.timeContainer}>
              <View style={styles.timeIconContainer}>
                <Ionicons name="time-outline" size={14} color="#fff" />
              </View>
              <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                Đề xuất thực hiện: {formatDate(item.suggestedTime)}
              </Text>
            </View>
          </View>
        );
      } else if (isWeatherAdvice(item)) {
        // Render Weather Advice
        const iconInfo = getIconForAdvice(item);
        return (
          <View
            style={[
              styles.adviceItem,
              {
                backgroundColor: theme.card,
                borderLeftColor: iconInfo.backgroundColor,
              },
            ]}
          >
            <View style={styles.adviceHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: iconInfo.backgroundColor },
                ]}
              >
                {iconInfo.icon}
              </View>
              <View style={styles.adviceTitle}>
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: iconInfo.backgroundColor },
                  ]}
                >
                  {iconInfo.label}
                </Text>
                <Text style={[styles.actionText, { color: theme.text }]}>
                  {item.title}
                </Text>
              </View>
              {renderPriorityIndicator(item.priority)}
            </View>

            <Text style={[styles.descriptionText, { color: theme.text }]}>
              {item.description}
            </Text>

            {item.bestTimeOfDay && (
              <View style={styles.timeContainer}>
                <View style={styles.timeIconContainer}>
                  <Ionicons name="time-outline" size={14} color="#fff" />
                </View>
                <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                  Thời gian tốt nhất: {item.bestTimeOfDay}
                </Text>
              </View>
            )}
          </View>
        );
      } else {
        // Fallback for unknown advice type
        return null;
      }
    },
    [theme, getIconForAdvice, formatDate, renderPriorityIndicator]
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
            <View>
              <Text style={styles.modalTitle}>Lời khuyên chăm sóc</Text>
              <Text style={styles.gardenName}>{gardenName}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
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
            ) : advice.length === 0 ? (
              <EmptyAdviceComponent />
            ) : (
              <FlatList
                data={advice}
                renderItem={renderAdviceItem}
                keyExtractor={(item) => `${item.id}`}
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
    padding: 4,
  },
  modalContent: {
    flex: 1,
  },
  adviceList: {
    padding: 16,
  },
  adviceItem: {
    marginBottom: 16,
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
    width: 38,
    height: 38,
    borderRadius: 19,
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
    backgroundColor: "rgba(0,0,0,0.02)",
    padding: 10,
    borderRadius: 8,
  },
  reasonLabel: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
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
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.2)",
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 11,
    fontFamily: "Inter-Medium",
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
