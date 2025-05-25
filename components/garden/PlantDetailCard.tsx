import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import Colors from "@/constants/Colors";
import { GardenPlantDetails } from "@/types/gardens/garden.types";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
// @ts-ignore: Module not found or type declarations missing
import * as Progress from "react-native-progress";

// Define a more specific type for the theme object
type AppThemeType = typeof Colors.light;

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

  // Use growthProgress directly from plantDetails if available
  const growthProgress = plantDetails.growthProgress ?? 0;

  const renderGrowthStages = () => {
    if (!plantDetails.growthStages || plantDetails.growthStages.length === 0) {
      return null;
    }

    // Sort stages by order
    const sortedStages = [...plantDetails.growthStages].sort(
      (a, b) => a.order - b.order
    );

    return (
      <View style={styles.timelineContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timelineScroll}
        >
          {sortedStages.map((stage, index) => {
            const isCurrentStage =
              stage.stageName === plantDetails.currentGrowthStage?.stageName;
            // Assuming currentGrowthStage.order is available for comparison
            const isPastStage =
              stage.order <= (plantDetails.currentGrowthStage?.order || 0);

            return (
              <View key={`stage-${index}`} style={styles.timelineStage}>
                <View
                  style={[
                    styles.stageCircle,
                    isPastStage
                      ? styles.completedStageCircle
                      : styles.pendingStageCircle,
                    isCurrentStage && styles.currentStageCircle,
                  ]}
                >
                  {isCurrentStage && (
                    <View style={styles.currentStageIndicator} />
                  )}
                </View>

                <View style={styles.stageLine} />

                <Text
                  style={[
                    styles.stageName,
                    isCurrentStage && styles.currentStageName,
                  ]}
                  numberOfLines={2}
                >
                  {stage.stageName}
                </Text>
                {/* Display stage order instead of dayNumber if dayNumber is not on type */}
                <Text style={styles.stageDays}>Giai đoạn {stage.order}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  // Generate optimal condition panel
  const renderOptimalConditions = () => {
    if (!plantDetails.currentGrowthStage) return null;

    const {
      optimalTemperatureMin,
      optimalTemperatureMax,
      optimalHumidityMin,
      optimalHumidityMax,
      optimalSoilMoistureMin,
      optimalSoilMoistureMax,
      optimalLightMin,
      optimalLightMax,
    } = plantDetails.currentGrowthStage;
    // These properties are on GardenGrowthStage type, so this is fine.

    return (
      <View style={styles.optimalConditionsContainer}>
        <Text style={styles.optimalConditionsTitle}>
          Điều kiện tối ưu cho giai đoạn hiện tại
        </Text>

        <View style={styles.conditionsGrid}>
          <View style={styles.conditionItem}>
            <MaterialCommunityIcons
              name="thermometer"
              size={20}
              color={theme.primary}
            />
            <Text style={styles.conditionLabel}>Nhiệt độ</Text>
            <Text style={styles.conditionValue}>
              {optimalTemperatureMin} - {optimalTemperatureMax}°C
            </Text>
          </View>

          <View style={styles.conditionItem}>
            <MaterialCommunityIcons
              name="water-percent"
              size={20}
              color={theme.info}
            />
            <Text style={styles.conditionLabel}>Độ ẩm</Text>
            <Text style={styles.conditionValue}>
              {optimalHumidityMin} - {optimalHumidityMax}%
            </Text>
          </View>

          <View style={styles.conditionItem}>
            <MaterialCommunityIcons
              name="water-outline"
              size={20}
              color={theme.accent}
            />
            <Text style={styles.conditionLabel}>Độ ẩm đất</Text>
            <Text style={styles.conditionValue}>
              {optimalSoilMoistureMin} - {optimalSoilMoistureMax}%
            </Text>
          </View>

          <View style={styles.conditionItem}>
            <MaterialCommunityIcons
              name="white-balance-sunny"
              size={20}
              color={theme.warning}
            />
            <Text style={styles.conditionLabel}>Ánh sáng</Text>
            <Text style={styles.conditionValue}>
              {optimalLightMin} - {optimalLightMax} lux
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (!plantDetails) {
    return null;
  }

  // Assuming plantDetails.plantedAt and plantDetails.expectedHarvestDate might be added to the type later
  // For now, provide fallback or use daysSincePlanting/daysUntilHarvest if more appropriate display is desired
  const plantedAtDate = plantDetails.plantedAt
    ? new Date(plantDetails.plantedAt).toLocaleDateString("vi-VN")
    : "Chưa có";
  const harvestDate = plantDetails.expectedHarvestDate
    ? new Date(plantDetails.expectedHarvestDate).toLocaleDateString("vi-VN")
    : "Chưa có";

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Thông tin cây trồng</Text>
          {plantDetails.imageUrl && (
            <Image
              source={{ uri: plantDetails.imageUrl }}
              style={styles.plantIcon}
              // @ts-ignore: contentFit is a valid prop for expo-image but may have type issues
              contentFit="cover"
            />
          )}
        </View>

        {onViewFullDetails && (
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={onViewFullDetails}
          >
            <Text style={styles.viewDetailsText}>Xem chi tiết</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.infoContainer}>
          <View style={styles.plantNameContainer}>
            <Text style={styles.plantName}>{plantDetails.name}</Text>
            <Text style={styles.plantVariety}>
              {plantDetails.plantVariety || ""}
            </Text>
          </View>

          <View style={styles.growthInfoContainer}>
            <View style={styles.growthInfoItem}>
              <Text style={styles.infoLabel}>Ngày trồng</Text>
              <Text style={styles.infoValue}>{plantedAtDate}</Text>
            </View>

            <View style={styles.growthInfoItem}>
              <Text style={styles.infoLabel}>Dự kiến thu hoạch</Text>
              <Text style={styles.infoValue}>{harvestDate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Tiến độ phát triển</Text>
            <Text style={styles.currentStageText}>
              {plantDetails.currentGrowthStage?.stageName || "Đang phát triển"}
            </Text>
          </View>

          <Progress.Bar
            progress={growthProgress}
            width={null}
            height={10}
            color={theme.success}
            unfilledColor={theme.backgroundSecondary}
            borderWidth={0}
            style={styles.progressBar}
          />

          <View style={styles.progressLabels}>
            <Text style={styles.progressStart}>Mới trồng</Text>
            <Text style={styles.progressEnd}>Thu hoạch</Text>
          </View>
        </View>

        {renderGrowthStages()}
        {renderOptimalConditions()}
      </View>
    </View>
  );
};

const createStyles = (theme: AppThemeType) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.card,
      borderRadius: 16,
      marginVertical: 8,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    title: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
    },
    plantIcon: {
      width: 24,
      height: 24,
      marginLeft: 8,
      borderRadius: 12,
    },
    viewDetailsButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 8,
    },
    viewDetailsText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.primary,
      marginRight: 4,
    },
    contentContainer: {
      padding: 16,
    },
    infoContainer: {
      marginBottom: 20,
    },
    plantNameContainer: {
      marginBottom: 12,
    },
    plantName: {
      fontSize: 20,
      fontFamily: "Inter-Bold",
      color: theme.text,
      marginBottom: 4,
    },
    plantVariety: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    growthInfoContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    growthInfoItem: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginBottom: 2,
    },
    infoValue: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
    },
    progressContainer: {
      marginBottom: 20,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    progressTitle: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.text,
    },
    currentStageText: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.success,
    },
    progressBar: {
      width: "100%",
      borderRadius: 5,
    },
    progressLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 4,
    },
    progressStart: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    progressEnd: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    timelineContainer: {
      marginBottom: 20,
    },
    timelineScroll: {
      paddingRight: 16,
      paddingVertical: 8,
    },
    timelineStage: {
      width: 80,
      alignItems: "center",
      marginRight: 16,
    },
    stageCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    completedStageCircle: {
      backgroundColor: theme.success,
    },
    pendingStageCircle: {
      backgroundColor: theme.backgroundSecondary,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    currentStageCircle: {
      backgroundColor: theme.success,
      width: 24,
      height: 24,
      borderRadius: 12,
    },
    currentStageIndicator: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.card,
    },
    stageLine: {
      height: 20,
      width: 1,
      backgroundColor: theme.borderLight,
      marginVertical: 4,
    },
    stageName: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
      textAlign: "center",
      marginBottom: 2,
      height: 32,
    },
    currentStageName: {
      color: theme.text,
      fontFamily: "Inter-SemiBold",
    },
    stageDays: {
      fontSize: 10,
      fontFamily: "Inter-Regular",
      color: theme.textTertiary,
    },
    optimalConditionsContainer: {
      backgroundColor: theme.backgroundSecondary,
      borderRadius: 12,
      padding: 16,
    },
    optimalConditionsTitle: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 12,
    },
    conditionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    conditionItem: {
      width: "48%",
      backgroundColor: theme.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    conditionLabel: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginTop: 4,
      marginBottom: 2,
    },
    conditionValue: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
    },
  });

export default PlantDetailCard;
