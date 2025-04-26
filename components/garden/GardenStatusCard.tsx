import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";

export enum GardenStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum GardenType {
  INDOOR = "INDOOR",
  OUTDOOR = "OUTDOOR",
  BALCONY = "BALCONY",
  ROOFTOP = "ROOFTOP",
  WINDOW_SILL = "WINDOW_SILL",
}

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

  const getGardenTypeLabel = (type: GardenType) => {
    return (
      type.charAt(0).toUpperCase() +
      type.slice(1).toLowerCase().replace("_", " ")
    );
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
    const endDate = startDate + garden.plantDuration * 24 * 60 * 60 * 1000; // convert days to milliseconds
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
    const endDate = startDate + garden.plantDuration * 24 * 60 * 60 * 1000; // convert days to milliseconds
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
                  Loại:
                </Text>
                <Text style={[styles.plantValue, { color: theme.text }]}>
                  {garden.plantName}
                </Text>
              </View>
              {garden.plantGrowStage && (
                <View style={styles.plantRow}>
                  <Text
                    style={[styles.plantLabel, { color: theme.textSecondary }]}
                  >
                    Giai đoạn:
                  </Text>
                  <Text style={[styles.plantValue, { color: theme.text }]}>
                    {garden.plantGrowStage}
                  </Text>
                </View>
              )}
              {garden.plantStartDate && garden.plantDuration && (
                <View style={styles.progressContainer}>
                  <Text
                    style={[
                      styles.progressLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Tiến độ phát triển
                  </Text>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${growthProgress}%`,
                          backgroundColor: getProgressColor(growthProgress),
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.progressTextContainer}>
                    <Text
                      style={[
                        styles.progressPercent,
                        { color: getProgressColor(growthProgress) },
                      ]}
                    >
                      {growthProgress}%
                    </Text>
                    {daysRemaining !== null && (
                      <Text
                        style={[
                          styles.progressDays,
                          { color: theme.textTertiary },
                        ]}
                      >
                        {daysRemaining} ngày còn lại
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.noPlantContainer}>
          <Text style={[styles.noPlantText, { color: theme.textSecondary }]}>
            Chưa có thông tin cây trồng cho vườn này.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    marginLeft: 8,
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
  },
  plantContainer: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 8,
  },
  plantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  plantTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailsButtonText: {
    fontSize: 12,
    marginRight: 4,
  },
  plantInfoContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  plantImageContainer: {
    marginRight: 12,
  },
  plantImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  plantDetails: {
    flex: 1,
    justifyContent: "center",
  },
  plantRow: {
    flexDirection: "row",
    marginVertical: 3,
  },
  plantLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  plantValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
  },
  progressTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressPercent: {
    fontSize: 12,
  },
  progressDays: {
    fontSize: 12,
  },
  noPlantContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  noPlantText: {
    marginTop: 8,
    textAlign: "center",
  },
});
