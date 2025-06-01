import React, { memo, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import GardenSection from "./GardenSection";
import CalendarSection from "./CalendarSection";
import { GardenDisplayDto } from "@/types/gardens/dtos";
import {
  GardenWeatherData,
  WeatherObservation,
} from "@/types/weather/weather.types";
import { Alert } from "@/types/alerts/alert.types";
import { SensorData, SensorType } from "@/types/gardens/sensor.types";

// Define Section Types - Replace WEATHER with CALENDAR
export enum SectionType {
  GARDENS = "GARDENS",
  CALENDAR = "CALENDAR",
  ALERTS = "ALERTS",
}

// Structure for section data
export interface SectionConfig {
  type: SectionType;
  visible: boolean;
}

interface HomeSectionsProps {
  // Garden data
  gardens: GardenDisplayDto[];
  selectedGardenId: number | null;
  onSelectGarden: (gardenId: number) => void;

  // Section visibility control
  sections: SectionConfig[];

  // Sensor data
  sensorDataByGarden: Record<number, Record<string, SensorData[]>>;

  // Weather data (keeping for compatibility, though not used in calendar)
  weatherData: WeatherObservation | null;
  gardenWeatherData: Record<number, GardenWeatherData>;

  // Alert data
  gardenAlerts: Record<number, Alert[]>;

  // Actions and handlers
  onShowAdvice: (gardenId: number) => void;
  onShowWeatherDetail: (gardenId: number) => void;
  onScrollToWeatherSection: (gardenId: number) => void;
  onShowAlertDetails: (gardenId: number) => void;

  // Loading states
  adviceLoading: Record<number, boolean>;
  weatherDetailLoading: Record<number, boolean>;

  // Sensor status function
  getSensorStatus?: (
    value: number,
    type: SensorType
  ) => "normal" | "warning" | "critical";
}

const HomeSections = memo(
  ({
    gardens,
    selectedGardenId,
    onSelectGarden,
    sections,
    sensorDataByGarden,
    weatherData,
    gardenWeatherData,
    gardenAlerts,
    onShowAdvice,
    onShowWeatherDetail,
    onScrollToWeatherSection,
    onShowAlertDetails,
    adviceLoading,
    weatherDetailLoading,
    getSensorStatus,
  }: HomeSectionsProps) => {
    // Find selected garden object
    const selectedGarden = useMemo(() => {
      if (!selectedGardenId) return undefined;
      return gardens.find((garden) => garden.id === selectedGardenId);
    }, [gardens, selectedGardenId]);

    // Check which sections are visible
    const isSectionVisible = (type: SectionType): boolean => {
      const section = sections.find((s) => s.type === type);
      return section ? section.visible : false;
    };

    return (
      <View style={styles.container}>
        {/* Garden Section - Always visible */}
        <GardenSection
          gardens={gardens}
          selectedGardenId={selectedGardenId}
          onSelectGarden={onSelectGarden}
          onShowAdvice={onShowAdvice}
          onShowWeatherDetail={onShowWeatherDetail}
          onScrollToWeatherSection={onScrollToWeatherSection}
          onShowAlertDetails={onShowAlertDetails}
          sensorDataByGarden={sensorDataByGarden}
          weatherDataByGarden={gardenWeatherData}
          adviceLoading={adviceLoading}
          weatherDetailLoading={weatherDetailLoading}
          getSensorStatus={getSensorStatus}
        />

        {/* Calendar Section - Replace WeatherSection */}
        {isSectionVisible(SectionType.CALENDAR) && (
          <CalendarSection
            gardenId={selectedGardenId}
            selectedGarden={selectedGarden}
            onShowDetail={onShowWeatherDetail}
          />
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeSections;
