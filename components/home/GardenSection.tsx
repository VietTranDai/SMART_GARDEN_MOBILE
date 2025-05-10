import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import useSectionAnimation from "@/hooks/useSectionAnimation";
import GardenDisplay from "@/components/common/GardenDisplay";
import { GardenDisplayDto } from "@/types/gardens/dtos";
import { SensorType } from "@/types/gardens/sensor.types";

interface GardenSectionProps {
  gardens: GardenDisplayDto[];
  selectedGardenId: number | null;
  onSelectGarden: (gardenId: number) => void;
  onShowAdvice: (gardenId: number) => void;
  onShowWeatherDetail: (gardenId: number) => void;
  onScrollToWeatherSection: (gardenId: number) => void;
  onShowAlertDetails: (gardenId: number) => void;
  sensorDataByGarden: Record<number, Record<string, any[]>>;
  weatherDataByGarden: Record<number, any>;
  adviceLoading: Record<number, boolean>;
  weatherDetailLoading: Record<number, boolean>;
  getSensorStatus?: (
    value: number,
    type: SensorType
  ) => "normal" | "warning" | "critical";
}

const GardenSection = memo(
  ({
    gardens,
    selectedGardenId,
    onSelectGarden,
    onShowAdvice,
    onShowWeatherDetail,
    onScrollToWeatherSection,
    onShowAlertDetails,
    sensorDataByGarden,
    weatherDataByGarden,
    adviceLoading,
    weatherDetailLoading,
    getSensorStatus,
  }: GardenSectionProps) => {
    const theme = useAppTheme();
    const { getAnimatedStyle } = useSectionAnimation("gardens");

    // Determine whether to show large cards based on garden count
    const showLargeCards = useMemo(() => gardens.length <= 2, [gardens.length]);

    // Styles
    const styles = useMemo(() => makeStyles(theme), [theme]);

    return (
      <Animated.View style={[styles.section, getAnimatedStyle()]}>
        <GardenDisplay
          gardens={gardens}
          onShowAdvice={onShowAdvice}
          onShowWeatherDetail={onShowWeatherDetail}
          onScrollToWeatherSection={onScrollToWeatherSection}
          onShowAlertDetails={onShowAlertDetails}
          sensorDataByGarden={sensorDataByGarden}
          weatherDataByGarden={weatherDataByGarden}
          getSensorStatus={getSensorStatus}
          adviceLoading={adviceLoading}
          weatherDetailLoading={weatherDetailLoading}
          showLargeCards={showLargeCards}
          onSelectGarden={onSelectGarden}
        />
      </Animated.View>
    );
  }
);

// Make styles function
const makeStyles = (theme: any) =>
  StyleSheet.create({
    section: {
      marginBottom: 16,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
    },
    sectionAction: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    sectionActionText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      marginRight: 4,
      color: theme.primary,
    },
  });

export default GardenSection;
