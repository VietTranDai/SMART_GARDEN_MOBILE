import React from "react";
import { StyleSheet, View } from "react-native";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import {
  Garden,
  GardenPlantDetails,
  Alert,
  WeatherObservation,
} from "@/types";
import { AlertStatus } from "@/types";
import GardenStatusCard from "@/components/common/GardenStatusCard";
import PlantDetailCard from "@/components/garden/PlantDetailCard";
import AlertsList from "@/components/common/AlertsList";
import WeatherButton from "./WeatherButton";
import { useNavigation } from "@react-navigation/native";

interface GardenOverviewTabProps {
  garden: Garden;
  plantDetails?: GardenPlantDetails;
  alerts: Alert[];
  onResolveAlert: (alertId: string) => void;
  onIgnoreAlert: (alertId: string) => void;
  onShowWeather: () => void;
  currentWeather?: WeatherObservation;
}

const GardenOverviewTab: React.FC<GardenOverviewTabProps> = ({
  garden,
  plantDetails,
  alerts,
  onResolveAlert,
  onIgnoreAlert,
  onShowWeather,
  currentWeather,
}) => {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const activeAlerts = alerts.filter(
    (a) => a.status !== AlertStatus.RESOLVED && a.status !== AlertStatus.IGNORED
  );

  const handleViewPlantDetails = () => {
    // @ts-expect-error navigation type
    navigation.navigate("Plant");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.cardContainer, { marginTop: 16 }]}>
        <GardenStatusCard
          garden={garden}
          onViewPlantDetails={handleViewPlantDetails}
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
