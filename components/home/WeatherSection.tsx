import React, { memo, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import useSectionAnimation from "@/hooks/ui/useSectionAnimation";
import WeatherDisplay from "@/components/common/WeatherDisplay";
import useWeatherDataDisplay from "@/hooks/weather/useWeatherDataDisplay";
import { GardenDisplayDto } from "@/types/gardens/dtos";
import {
  GardenWeatherData,
  WeatherObservation,
} from "@/types/weather/weather.types";

interface WeatherSectionProps {
  gardenId: number | null;
  selectedGarden?: GardenDisplayDto;
  gardenWeatherData: Record<number, GardenWeatherData>;
  weatherData: WeatherObservation | null;
  onShowDetail: (gardenId: number) => void;
}

const WeatherSection = memo(
  ({
    gardenId,
    selectedGarden,
    gardenWeatherData,
    weatherData,
    onShowDetail,
  }: WeatherSectionProps) => {
    const theme = useAppTheme();
    const { getAnimatedStyle } = useSectionAnimation("weather", 50);

    const { current, hourly, daily, getWeatherTip } =
      useWeatherDataDisplay(
        gardenId,
        gardenWeatherData,
        weatherData,
        selectedGarden
      );

    // Check if we have full details to show
    const showFullDetails = !!gardenId;

    // Garden name for display
    const gardenName = selectedGarden?.name || "";

    // Styles
    const styles = useMemo(() => makeStyles(theme), [theme]);

    // Bảo vệ gọi onShowDetail khi gardenId có thể là null
    const handleShowDetail = () => {
      if (gardenId !== null && gardenId !== undefined && !isNaN(gardenId)) {
        onShowDetail(gardenId);
      }
    };

    return (
      <Animated.View style={[styles.section, getAnimatedStyle()]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {gardenId ? `Thời tiết - ${gardenName}` : "Thời tiết"}
          </Text>
          {showFullDetails && (
            <TouchableOpacity
              style={styles.sectionAction}
              onPress={handleShowDetail}
            >
              <Text
                style={[styles.sectionActionText, { color: theme.primary }]}
              >
                Chi tiết
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.primary}
              />
            </TouchableOpacity>
          )}
        </View>
        <WeatherDisplay
          currentWeather={current}
          selectedGarden={selectedGarden}
          hourlyForecast={hourly}
          dailyForecast={daily}
          getWeatherTip={getWeatherTip}
          showFullDetails={showFullDetails}
          onShowDetail={handleShowDetail}
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

export default WeatherSection;
