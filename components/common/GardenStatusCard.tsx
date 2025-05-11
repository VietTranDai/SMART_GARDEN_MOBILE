import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  AccessibilityProps,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { GardenStatus, GardenType } from "@/types/gardens/garden.types";
import { gardenService } from "@/service/api";
// import MapView, { Marker } from "react-native-maps";

/**
 * Interface for Garden data display
 */
export interface Garden {
  id: number;
  name: string;
  status: GardenStatus;
  type: GardenType;
  profilePicture?: string;

  // Location information
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
  lat?: number;
  lng?: number;

  // Plant information
  plantName?: string;
  plantGrowStage?: string;
  plantStartDate?: string;
  plantDuration?: number;

  createdAt: string;
  updatedAt: string;
}

interface GardenStatusCardProps {
  garden: Garden;
  onViewPlantDetails?: () => void;
  onShowAdvice?: () => void;
  topRightComponent?: React.ReactNode;
}

export default function GardenStatusCard({
  garden,
  onViewPlantDetails,
  onShowAdvice,
  topRightComponent,
}: GardenStatusCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  /**
   * Get color for garden status
   */
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

  /**
   * Get icon for garden type
   */
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

  /**
   * Calculate growth progress percentage
   */
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

  /**
   * Get days remaining until harvest
   */
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

  /**
   * Get color for progress bar based on percentage
   */
  const getProgressColor = (progress: number) => {
    if (progress < 25) return theme.info;
    if (progress < 50) return theme.primary;
    if (progress < 75) return theme.warning;
    return theme.success;
  };

  /**
   * Get progress stage markers based on growth stages
   */
  const getProgressStages = (progress: number) => {
    // Example stages: germination (0%), seedling (25%), vegetation (50%), flowering (75%), harvest (100%)
    const stages = [
      { percent: 0, label: "Gieo hạt" },
      { percent: 25, label: "Nảy mầm" },
      { percent: 50, label: "Phát triển" },
      { percent: 75, label: "Ra hoa" },
      { percent: 100, label: "Thu hoạch" },
    ];

    return stages.map((stage) => ({
      ...stage,
      active: progress >= stage.percent,
    }));
  };

  const growthProgress = calculateGrowthProgress();
  const daysRemaining = getDaysRemaining();
  const hasPlantInfo = !!garden.plantName;
  const hasLocation = !!(garden.lat && garden.lng);
  const progressStages = getProgressStages(growthProgress);

  /**
   * Gets default plant image or uses placeholder
   */
  const getPlantImage = () => {
    // Use a default plant icon instead of random images
    return require("@/assets/images/plant-default.png");

    // Or implement real image logic once available:
    // if (garden.plantProfilePicture) {
    //   return { uri: garden.plantProfilePicture };
    // } else {
    //   return require("@/assets/images/plant-default.png");
    // }
  };

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
            {gardenService.getGardenStatusText(garden.status)}
          </Text>
        </View>
      </View>

      {topRightComponent}

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
            {gardenService.getGardenTypeText(garden.type)}
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
            {gardenService.formatDate(garden.createdAt)}
          </Text>
        </View>
      </View>

      {/* Display map if coordinates are available - Commented out until react-native-maps is installed */}
      {/* {hasLocation && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: garden.lat!,
              longitude: garden.lng!,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
            toolbarEnabled={false}
            pointerEvents="none"
          >
            <Marker
              coordinate={{
                latitude: garden.lat!,
                longitude: garden.lng!,
              }}
              title={garden.name}
            />
          </MapView>
        </View>
      )} */}

      {hasPlantInfo ? (
        <View style={[styles.plantContainer, { borderColor: theme.border }]}>
          <View style={styles.plantHeader}>
            <Text style={[styles.plantTitle, { color: theme.text }]}>
              Thông tin cây trồng
            </Text>
            <View style={styles.buttonsContainer}>
              {onShowAdvice && (
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    {
                      backgroundColor: pressed
                        ? theme.backgroundSecondary
                        : theme.primaryLight,
                    },
                  ]}
                  onPress={onShowAdvice}
                  accessible={true}
                  accessibilityLabel="Xem lời khuyên cho vườn"
                  accessibilityHint="Hiển thị các lời khuyên cho vườn này"
                  accessibilityRole="button"
                >
                  <FontAwesome5
                    name="lightbulb"
                    size={12}
                    color={theme.primary}
                  />
                  <Text
                    style={[styles.actionButtonText, { color: theme.primary }]}
                  >
                    Lời khuyên
                  </Text>
                </Pressable>
              )}
              {onViewPlantDetails && (
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
                  accessible={true}
                  accessibilityLabel="Xem chi tiết cây trồng"
                  accessibilityHint="Hiển thị thông tin chi tiết về cây trồng"
                  accessibilityRole="button"
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
              )}
            </View>
          </View>

          <View style={styles.plantInfoContainer}>
            <View style={styles.plantImageContainer}>
              <Image
                source={getPlantImage()}
                style={styles.plantImage}
                accessibilityLabel={`Hình ảnh của ${
                  garden.plantName || "cây trồng"
                }`}
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
                  {gardenService.formatDate(garden.plantStartDate)}
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

              {/* Enhanced progress bar with stage markers */}
              <View style={styles.progressTrackContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: theme.border },
                  ]}
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

                {/* Stage markers */}
                <View style={styles.stageMarkersContainer}>
                  {progressStages.map((stage, index) => (
                    <View
                      key={`stage-${index}`}
                      style={[
                        styles.stageMark,
                        {
                          left: `${stage.percent}%`,
                          backgroundColor: stage.active
                            ? getProgressColor(stage.percent)
                            : theme.background,
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>

              {/* Stage labels */}
              <View style={styles.stageLabelsContainer}>
                {progressStages.map((stage, index) => (
                  <Text
                    key={`label-${index}`}
                    style={[
                      styles.stageLabel,
                      {
                        color: stage.active ? theme.text : theme.textSecondary,
                        left: `${stage.percent}%`,
                        transform: [{ translateX: -12 }],
                      },
                    ]}
                  >
                    {index === 0 || index === progressStages.length - 1
                      ? stage.label
                      : ""}
                  </Text>
                ))}
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
        <View style={[styles.noPlantContainer, { borderColor: theme.border }]}>
          <Text style={[styles.noPlantText, { color: theme.textSecondary }]}>
            Chưa có thông tin cây trồng cho vườn này
          </Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
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
    mapContainer: {
      height: 120,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    map: {
      width: "100%",
      height: "100%",
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
    buttonsContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      padding: 6,
      borderRadius: 6,
    },
    actionButtonText: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
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
      backgroundColor: theme.background,
      justifyContent: "center",
      alignItems: "center",
    },
    plantImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
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
    progressTrackContainer: {
      position: "relative",
      marginTop: 10,
      marginBottom: 20,
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
    },
    stageMarkersContainer: {
      position: "absolute",
      top: -2,
      left: 0,
      right: 0,
      height: 12,
    },
    stageMark: {
      position: "absolute",
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.card,
      marginLeft: -6,
    },
    stageLabelsContainer: {
      position: "relative",
      height: 20,
    },
    stageLabel: {
      position: "absolute",
      fontSize: 10,
      fontFamily: "Inter-Medium",
      textAlign: "center",
    },
    daysRemaining: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      marginTop: 16,
      textAlign: "center",
    },
    noPlantContainer: {
      padding: 16,
      alignItems: "center",
      borderTopWidth: 1,
    },
    noPlantText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      textAlign: "center",
    },
  });
