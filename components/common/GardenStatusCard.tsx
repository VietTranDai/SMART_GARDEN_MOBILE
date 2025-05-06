import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { GardenStatus, GardenType } from "@/types";

interface GardenStatusCardProps {
  garden: {
    id: number;
    name: string;
    status: GardenStatus;
    type: GardenType;
    plantName?: string;
    plantGrowStage?: string;
    plantStartDate?: string;
    plantDuration?: number;
    createdAt: string;
    updatedAt: string;
    street?: string;
    ward?: string;
    district?: string;
    city?: string;
  };
  onViewPlantDetails?: () => void;
}

export default function GardenStatusCard({
  garden,
  onViewPlantDetails,
}: GardenStatusCardProps) {
  const theme = useAppTheme();

  const getGardenStatusColor = (status: GardenStatus) => {
    switch (status) {
      case GardenStatus.ACTIVE:
        return theme.success;
      case GardenStatus.INACTIVE:
        return theme.error;
      default:
        return theme.warning;
    }
  };

  const getGardenTypeIcon = (type: GardenType) => {
    switch (type) {
      case GardenType.INDOOR:
        return "home";
      case GardenType.OUTDOOR:
        return "tree";
      case GardenType.BALCONY:
        return "building";
      case GardenType.ROOFTOP:
        return "umbrella-beach";
      case GardenType.WINDOW_SILL:
        return "window-maximize";
      default:
        return "seedling";
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
        return "Bệ cửa sổ";
      default:
        return String(type);
    }
  };

  const getGardenStatusText = (status: GardenStatus): string => {
    switch (status) {
      case GardenStatus.ACTIVE:
        return "Hoạt động";
      case GardenStatus.INACTIVE:
        return "Không hoạt động";
      default:
        return String(status);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Không có";

    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateGrowthProgress = () => {
    if (!garden.plantStartDate || !garden.plantDuration) return 0;

    const startDate = new Date(garden.plantStartDate).getTime();
    const endDate = startDate + garden.plantDuration * 24 * 60 * 60 * 1000;
    const currentDate = new Date().getTime();

    // Calculate progress percentage
    const totalDuration = endDate - startDate;
    const elapsed = currentDate - startDate;
    const progress = Math.min(
      Math.max((elapsed / totalDuration) * 100, 0),
      100
    );

    return Math.round(progress);
  };

  const getDaysRemaining = () => {
    if (!garden.plantStartDate || !garden.plantDuration) return null;

    const startDate = new Date(garden.plantStartDate).getTime();
    const endDate = startDate + garden.plantDuration * 24 * 60 * 60 * 1000;
    const currentDate = new Date().getTime();

    const daysRemaining = Math.ceil(
      (endDate - currentDate) / (24 * 60 * 60 * 1000)
    );
    return daysRemaining > 0 ? daysRemaining : 0;
  };

  const getProgressColor = (progress: number) => {
    if (progress < 25) return theme.info;
    if (progress < 50) return theme.primary;
    if (progress < 75) return theme.warning;
    return theme.success;
  };

  const growthProgress = calculateGrowthProgress();
  const daysRemaining = getDaysRemaining();
  const hasPlantInfo = !!garden.plantName;

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Trạng thái vườn
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getGardenStatusColor(garden.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {getGardenStatusText(garden.status)}
          </Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name={getGardenTypeIcon(garden.type)}
              size={16}
              color={theme.primary}
            />
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Loại vườn
            </Text>
          </View>
          <Text style={[styles.value, { color: theme.text }]}>
            {getGardenTypeText(garden.type)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="map-marker-alt"
              size={16}
              color={theme.primary}
            />
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Vị trí
            </Text>
          </View>
          <Text style={[styles.value, { color: theme.text }]}>
            {[garden.street, garden.ward, garden.district, garden.city]
              .filter(Boolean)
              .join(", ") || "Chưa xác định"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.labelContainer}>
            <FontAwesome5 name="calendar-alt" size={16} color={theme.primary} />
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Ngày tạo
            </Text>
          </View>
          <Text style={[styles.value, { color: theme.text }]}>
            {formatDate(garden.createdAt)}
          </Text>
        </View>
      </View>

      {hasPlantInfo ? (
        <View style={[styles.plantContainer, { borderColor: theme.border }]}>
          <View style={styles.plantHeader}>
            <Text style={[styles.plantTitle, { color: theme.text }]}>
              Thông tin cây trồng
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.detailsButton,
                {
                  backgroundColor: pressed
                    ? theme.backgroundSecondary
                    : "transparent",
                },
              ]}
              onPress={onViewPlantDetails}
            >
              <Text
                style={[styles.detailsButtonText, { color: theme.primary }]}
              >
                Chi tiết
              </Text>
              <FontAwesome5
                name="chevron-right"
                size={12}
                color={theme.primary}
              />
            </Pressable>
          </View>

          <View style={styles.plantInfoContainer}>
            <View style={styles.plantImageContainer}>
              <Image
                source={{
                  uri: `https://picsum.photos/seed/${garden.plantName}/100`,
                }}
                style={styles.plantImage}
              />
            </View>

            <View style={styles.plantDetails}>
              <View style={styles.plantRow}>
                <Text
                  style={[styles.plantLabel, { color: theme.textSecondary }]}
                >
                  Tên cây:
                </Text>
                <Text style={[styles.plantValue, { color: theme.text }]}>
                  {garden.plantName}
                </Text>
              </View>

              <View style={styles.plantRow}>
                <Text
                  style={[styles.plantLabel, { color: theme.textSecondary }]}
                >
                  Giai đoạn:
                </Text>
                <Text style={[styles.plantValue, { color: theme.text }]}>
                  {garden.plantGrowStage || "Không có"}
                </Text>
              </View>

              <View style={styles.plantRow}>
                <Text
                  style={[styles.plantLabel, { color: theme.textSecondary }]}
                >
                  Ngày gieo trồng:
                </Text>
                <Text style={[styles.plantValue, { color: theme.text }]}>
                  {formatDate(garden.plantStartDate)}
                </Text>
              </View>
            </View>
          </View>

          {garden.plantDuration && garden.plantStartDate && (
            <View style={styles.progressContainer}>
              <View style={styles.progressLabels}>
                <Text style={[styles.progressLabel, { color: theme.text }]}>
                  Tiến độ tăng trưởng
                </Text>
                <Text style={[styles.progressLabel, { color: theme.text }]}>
                  {growthProgress}%
                </Text>
              </View>
              <View
                style={[styles.progressBar, { backgroundColor: theme.border }]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${growthProgress}%`,
                      backgroundColor: getProgressColor(growthProgress),
                    },
                  ]}
                />
              </View>
              {daysRemaining !== null && (
                <Text
                  style={[styles.daysRemaining, { color: theme.textSecondary }]}
                >
                  {daysRemaining} ngày còn lại đến ngày thu hoạch dự kiến
                </Text>
              )}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.noPlantContainer}>
          <Text style={[styles.noPlantText, { color: theme.textSecondary }]}>
            Chưa có thông tin cây trồng cho vườn này
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  value: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    maxWidth: "60%",
    textAlign: "right",
  },
  plantContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  plantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  plantTitle: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 6,
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
  plantInfoContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  plantImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
  },
  plantImage: {
    width: "100%",
    height: "100%",
  },
  plantDetails: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  plantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  plantLabel: {
    fontSize: 13,
    fontFamily: "Inter-Medium",
  },
  plantValue: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    maxWidth: "60%",
    textAlign: "right",
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 13,
    fontFamily: "Inter-Medium",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  daysRemaining: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    marginTop: 6,
    textAlign: "center",
  },
  noPlantContainer: {
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#E5E5E5",
  },
  noPlantText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    textAlign: "center",
  },
});
