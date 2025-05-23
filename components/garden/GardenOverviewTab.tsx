import React from "react";
import { StyleSheet, View } from "react-native";
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

  const handleViewPlantDetails = () => {
    console.log(
      "View Plant Details pressed for garden:",
      garden?.name,
      "Plant:",
      plantDetails?.name
    );
    // Placeholder: Implement navigation or modal display for plant details here
    // Example: router.push(`/gardens/${garden.id}/plant/${plantDetails?.plantId}`);
    // Or: showPlantDetailModal(plantDetails);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.cardContainer, { marginTop: 16 }]}>
        <GardenStatusCard
          garden={garden}
          onViewPlantDetails={handleViewPlantDetails}
          onShowAdvice={onShowAdvice}
          topRightComponent={
            <WeatherButton
              currentWeather={currentWeather}
              onPress={onShowWeather}
            />
          }
        />
      </View>

      {plantDetails && (
        <View style={styles.cardContainer}>
          <PlantDetailCard
            plantDetails={plantDetails}
            onViewFullDetails={() => {}}
          />
        </View>
      )}

      {activeAlerts.length > 0 && (
        <View style={styles.cardContainer}>
          <AlertsList
            alerts={activeAlerts}
            onResolveAlert={onResolveAlert}
            onIgnoreAlert={onIgnoreAlert}
          />
        </View>
      )}

      {activities.length > 0 && (
        <View style={styles.cardContainer}>
          <ActivityList activities={activities.slice(0, 5)} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  cardContainer: {
    marginBottom: 16,
  },
});

export default GardenOverviewTab;
