import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  GardenPlantDetails,
  GardenGrowthStage,
} from "@/types/gardens/garden.types";
import {
  FontAwesome5,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface PlantDetailCardProps {
  plantDetails: GardenPlantDetails;
  onViewFullDetails?: () => void;
}

const PlantDetailCard: React.FC<PlantDetailCardProps> = ({
  plantDetails,
  onViewFullDetails,
}) => {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  if (!plantDetails) {
    return null;
  }

  // Optimals from current growth stage
  const {
    optimalTemperatureMin,
    optimalTemperatureMax,
    optimalHumidityMin,
    optimalHumidityMax,
    optimalSoilMoistureMin,
    optimalSoilMoistureMax,
    optimalLightMin,
    optimalLightMax,
    lightRequirement,
    waterRequirement,
  } = plantDetails.currentGrowthStage;

  // Calculate progress percentage
  const progressPercentage = plantDetails.growthProgress;

  // Get appropriate color for progress
  const getProgressColor = (progress: number) => {
    if (progress < 25) return theme.info;
    if (progress < 50) return theme.primary;
    if (progress < 75) return theme.warning;
    return theme.success;
  };

  const progressColor = getProgressColor(progressPercentage);

  // Create growth stage markers
  const createGrowthStageMarkers = () => {
    if (!plantDetails.growthStages || plantDetails.growthStages.length === 0) {
      return [];
    }

    const totalDuration = plantDetails.growthDuration;
    let cumulativeDuration = 0;

    return plantDetails.growthStages.map((stage, index) => {
      const position = (cumulativeDuration / totalDuration) * 100;
      cumulativeDuration += stage.duration;

      const isActive = index <= plantDetails.currentGrowthStage.order;

      return {
        position,
        label: stage.stageName,
        isActive,
      };
    });
  };

  const growthStageMarkers = createGrowthStageMarkers();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Thông tin cây trồng</Text>
          <Text style={styles.plantName}>{plantDetails.name}</Text>
          {plantDetails.scientificName && (
            <Text style={styles.scientificName}>
              {plantDetails.scientificName}
            </Text>
          )}
        </View>
        {plantDetails.imageUrl && (
          <Image
            source={{ uri: plantDetails.imageUrl }}
            style={styles.plantImage}
          />
        )}
        {!plantDetails.imageUrl && (
          <View
            style={[
              styles.plantImagePlaceholder,
              { backgroundColor: `${theme.primaryLight}50` },
            ]}
          >
            <FontAwesome5 name="seedling" size={28} color={theme.primary} />
          </View>
        )}
      </View>

      <View style={styles.growthContainer}>
        <View style={styles.growthHeader}>
          <Text style={styles.sectionTitle}>Tiến độ phát triển</Text>
          <View style={styles.daysContainer}>
            <MaterialCommunityIcons
              name="calendar-clock"
              size={16}
              color={theme.primary}
            />
            <Text style={styles.daysText}>
              {plantDetails.daysUntilHarvest} ngày đến khi thu hoạch
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>

          {/* Stage markers */}
          {growthStageMarkers.map((marker, index) => (
            <View
              key={`marker-${index}`}
              style={[styles.stageMarker, { left: `${marker.position}%` }]}
            >
              <View
                style={[
                  styles.markerDot,
                  marker.isActive
                    ? { backgroundColor: progressColor }
                    : { backgroundColor: theme.borderLight },
                ]}
              />
              <Text
                style={[
                  styles.markerLabel,
                  marker.isActive
                    ? { color: theme.text }
                    : { color: theme.textTertiary },
                ]}
              >
                {marker.label}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.currentStageText}>
          Giai đoạn hiện tại:{" "}
          <Text style={{ fontFamily: "Inter-SemiBold" }}>
            {plantDetails.currentGrowthStage.stageName}
          </Text>{" "}
          ({plantDetails.growthProgress}%)
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.optimalConditionsScroll}
      >
        <View style={styles.optimalConditionsContainer}>
          <View style={styles.optimalItem}>
            <View style={styles.optimalIconContainer}>
              <MaterialCommunityIcons
                name="thermometer"
                size={22}
                color={theme.primary}
              />
            </View>
            <Text style={styles.optimalTitle}>Nhiệt độ tối ưu</Text>
            <Text style={styles.optimalValue}>
              {optimalTemperatureMin}°C - {optimalTemperatureMax}°C
            </Text>
          </View>

          <View style={styles.optimalItem}>
            <View style={styles.optimalIconContainer}>
              <MaterialCommunityIcons
                name="water-percent"
                size={22}
                color={theme.primary}
              />
            </View>
            <Text style={styles.optimalTitle}>Độ ẩm tối ưu</Text>
            <Text style={styles.optimalValue}>
              {optimalHumidityMin}% - {optimalHumidityMax}%
            </Text>
          </View>

          <View style={styles.optimalItem}>
            <View style={styles.optimalIconContainer}>
              <Ionicons name="water" size={22} color={theme.primary} />
            </View>
            <Text style={styles.optimalTitle}>Độ ẩm đất</Text>
            <Text style={styles.optimalValue}>
              {optimalSoilMoistureMin}% - {optimalSoilMoistureMax}%
            </Text>
          </View>

          <View style={styles.optimalItem}>
            <View style={styles.optimalIconContainer}>
              <Ionicons name="sunny" size={22} color={theme.primary} />
            </View>
            <Text style={styles.optimalTitle}>Ánh sáng</Text>
            <Text style={styles.optimalValue}>
              {lightRequirement || "Trung bình"}
            </Text>
          </View>

          <View style={styles.optimalItem}>
            <View style={styles.optimalIconContainer}>
              <MaterialCommunityIcons
                name="watering-can"
                size={22}
                color={theme.primary}
              />
            </View>
            <Text style={styles.optimalTitle}>Nước</Text>
            <Text style={styles.optimalValue}>
              {waterRequirement || "Trung bình"}
            </Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.viewDetailsButton}
        onPress={onViewFullDetails}
      >
        <Text style={styles.viewDetailsText}>Xem thông tin chi tiết</Text>
        <Ionicons name="chevron-forward" size={16} color={theme.primary} />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      ...Platform.select({
        ios: {
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 6,
    },
    plantName: {
      fontSize: 20,
      fontFamily: "Inter-Bold",
      color: theme.text,
      marginBottom: 2,
    },
    scientificName: {
      fontSize: 14,
      fontFamily: "Inter-Italic",
      color: theme.textSecondary,
      fontStyle: "italic",
    },
    plantImage: {
      width: 80,
      height: 80,
      borderRadius: 12,
      marginLeft: 12,
    },
    plantImagePlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 12,
      marginLeft: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.backgroundSecondary,
    },
    growthContainer: {
      marginBottom: 16,
    },
    growthHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 15,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
    },
    daysContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.backgroundSecondary,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    daysText: {
      fontSize: 13,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
      marginLeft: 6,
    },
    progressBarContainer: {
      marginVertical: 10,
      height: 40,
      position: "relative",
    },
    progressBar: {
      height: 6,
      backgroundColor: theme.borderLight,
      borderRadius: 3,
      marginTop: 20,
    },
    progressFill: {
      height: "100%",
      borderRadius: 3,
    },
    stageMarker: {
      position: "absolute",
      top: 0,
      alignItems: "center",
      transform: [{ translateX: -8 }],
    },
    markerDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.background,
    },
    markerLabel: {
      fontSize: 10,
      fontFamily: "Inter-Medium",
      marginTop: 4,
      maxWidth: 60,
      textAlign: "center",
    },
    currentStageText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginTop: 8,
    },
    optimalConditionsScroll: {
      marginBottom: 16,
    },
    optimalConditionsContainer: {
      flexDirection: "row",
      paddingVertical: 8,
    },
    optimalItem: {
      marginRight: 16,
      padding: 12,
      backgroundColor: theme.backgroundSecondary,
      borderRadius: 12,
      alignItems: "center",
      width: 120,
    },
    optimalIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.primaryLight,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    optimalTitle: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
      marginBottom: 4,
      textAlign: "center",
    },
    optimalValue: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      textAlign: "center",
    },
    viewDetailsButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      backgroundColor: theme.primaryLight,
      borderRadius: 12,
    },
    viewDetailsText: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.primary,
      marginRight: 4,
    },
  });

export default PlantDetailCard;
