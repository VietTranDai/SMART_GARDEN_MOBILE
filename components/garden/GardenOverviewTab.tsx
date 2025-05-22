import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  Garden,
  GardenPlantDetails,
  Alert,
  ActivityDisplay,
  WeatherObservation,
} from "@/types";
import { AlertStatus } from "@/types";
import GardenStatusCard from "@/components/common/GardenStatusCard";
import PlantDetailCard from "@/components/garden/PlantDetailCard";
import AlertsList from "@/components/common/AlertsList";
import ActivityList from "@/components/garden/ActivityList";
import WeatherButton from "./WeatherButton";

interface GardenOverviewTabProps {
  garden: Garden;
  plantDetails?: GardenPlantDetails;
  alerts: Alert[];
  activities: ActivityDisplay[];
  onShowAdvice: () => void;
  onResolveAlert: (alertId: string) => void;
  onIgnoreAlert: (alertId: string) => void;
  onShowWeather: () => void;
  currentWeather?: WeatherObservation;
}

const GardenOverviewTab: React.FC<GardenOverviewTabProps> = ({
  garden,
  plantDetails,
  alerts,
  activities,
  onShowAdvice,
  onResolveAlert,
  onIgnoreAlert,
  onShowWeather,
  currentWeather,
}) => {
  const theme = useAppTheme();
  const activeAlerts = alerts.filter(
    (a) => a.status !== AlertStatus.RESOLVED && a.status !== AlertStatus.IGNORED
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      <GardenStatusCard
        garden={garden}
        onViewPlantDetails={() => {}}
        onShowAdvice={onShowAdvice}
        topRightComponent={
          <WeatherButton
            currentWeather={currentWeather}
            onPress={onShowWeather}
          />
        }
      />

      {plantDetails && (
        <PlantDetailCard
          plantDetails={plantDetails}
          onViewFullDetails={() => {}}
        />
      )}

      {activeAlerts.length > 0 && (
        <AlertsList
          alerts={activeAlerts}
          onResolveAlert={onResolveAlert}
          onIgnoreAlert={onIgnoreAlert}
        />
      )}

      {activities.length > 0 && (
        <ActivityList activities={activities.slice(0, 5)} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default GardenOverviewTab;
