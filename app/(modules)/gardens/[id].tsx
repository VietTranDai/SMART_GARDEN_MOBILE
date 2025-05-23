import React, { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

// Import custom hooks
import { useAppTheme } from "@/hooks/useAppTheme";
import { useGardenDetail } from "@/hooks/garden/useGardenDetail";

// Import custom components
import EmptyStateView from "@/components/common/EmptyStateView";
import AdviceModal from "@/components/common/AdviceModal";
import WeatherModal from "@/components/garden/WeatherModal";
import GardenHeader from "@/components/garden/GardenHeader";
import GardenOverviewTab from "@/components/garden/GardenOverviewTab";
import GardenSensorsTab from "@/components/garden/GardenSensorsTab";
import GardenPlantTab from "@/components/garden/GardenPlantTab";
import GardenPhotosTab from "@/components/garden/GardenPhotosTab";

const Tab = createMaterialTopTabNavigator();

export default function GardenDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const [weatherModalVisible, setWeatherModalVisible] = useState(false);

  // Use the garden detail hook
  const {
    garden,
    currentWeather,
    hourlyForecast,
    dailyForecast,
    alerts,
    activities,
    sensors,
    isLoading,
    isRefreshing,
    isSensorDataLoading,
    lastSensorUpdate,
    adviceModalVisible,
    gardenAdvice,
    adviceLoading,
    adviceError,
    plantDetails,
    sensorHistory,
    gardenPhotos,
    refreshGarden,
    refreshSensorData,
    showAdviceModal,
    closeAdviceModal,
    resolveAlert,
    ignoreAlert,
    handleUploadPhoto,
  } = useGardenDetail({ gardenId: id || null });

  // Modal visibility functions
  const openWeatherModal = () => setWeatherModalVisible(true);
  const closeWeatherModalLocal = () => setWeatherModalVisible(false);

  // Safe plant details - convert null to undefined
  const safePlantDetails = plantDetails || undefined;

  // Tab components
  const OverviewTab = useCallback(
    () => (
      <GardenOverviewTab
        garden={garden}
        plantDetails={safePlantDetails}
        alerts={alerts}
        activities={activities}
        onShowAdvice={() => id && showAdviceModal(id)}
        onResolveAlert={(alertId: string) => resolveAlert(Number(alertId))}
        onIgnoreAlert={(alertId: string) => ignoreAlert(Number(alertId))}
        onShowWeather={openWeatherModal}
        currentWeather={currentWeather}
      />
    ),
    [
      garden,
      safePlantDetails,
      alerts,
      activities,
      id,
      currentWeather,
      showAdviceModal,
      resolveAlert,
      ignoreAlert,
      openWeatherModal,
    ]
  );

  const SensorsTab = useCallback(
    () => (
      <GardenSensorsTab
        sensors={sensors}
        sensorHistory={sensorHistory}
        lastSensorUpdate={lastSensorUpdate || undefined}
        isSensorDataLoading={isSensorDataLoading}
        isRefreshing={isRefreshing}
        currentGrowthStage={plantDetails?.currentGrowthStage}
        onRefresh={() => id && refreshSensorData(id)}
        onSelectSensor={(sensor) => router.push(`/sensors/${sensor.id}`)}
      />
    ),
    [
      sensors,
      sensorHistory,
      lastSensorUpdate,
      isSensorDataLoading,
      isRefreshing,
      plantDetails,
      id,
      refreshSensorData,
      router,
    ]
  );

  const PlantTab = useCallback(
    () => <GardenPlantTab plantDetails={safePlantDetails} />,
    [safePlantDetails]
  );

  const PhotosTab = useCallback(
    () => (
      <GardenPhotosTab
        photos={gardenPhotos}
        gardenId={garden?.id}
        initiatePhotoUpload={async () => {
          if (garden && garden.id) {
            await handleUploadPhoto(garden.id);
          }
        }}
        isLoading={isLoading}
      />
    ),
    [gardenPhotos, garden, handleUploadPhoto, isLoading]
  );

  // Loading state
  if (isLoading && !garden) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.background || "#F5F5F5" },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Đang tải chi tiết vườn...
        </Text>
      </View>
    );
  }

  // Error state
  if (!garden) {
    return (
      <EmptyStateView
        icon="leaf-off"
        title="Không tìm thấy vườn"
        message="Vườn này không tồn tại hoặc đã bị xóa"
        actionText="Quay lại danh sách vườn"
        onAction={() => router.back()}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen options={{ title: garden?.name, headerShown: false }} />

      <GardenHeader profilePicture={garden.profilePicture} />

      <View style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.textSecondary,
            tabBarIndicatorStyle: {
              backgroundColor: theme.primary,
            },
            tabBarStyle: {
              backgroundColor: theme.background,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: theme.borderLight,
            },
            tabBarLabelStyle: {
              fontSize: 13,
              fontFamily: "Inter-Medium",
              textTransform: "none",
            },
          }}
        >
          <Tab.Screen
            name="Overview"
            component={OverviewTab}
            options={{
              tabBarLabel: "Tổng quan",
              tabBarIcon: ({ color }: { color: string }) => (
                <Ionicons name="home-outline" size={20} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Sensors"
            component={SensorsTab}
            options={{
              tabBarLabel: "Cảm biến",
              tabBarIcon: ({ color }: { color: string }) => (
                <Ionicons
                  name="hardware-chip-outline"
                  size={20}
                  color={color}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Plant"
            component={PlantTab}
            options={{
              tabBarLabel: "Cây trồng",
              tabBarIcon: ({ color }: { color: string }) => (
                <Ionicons name="leaf-outline" size={20} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Photos"
            component={PhotosTab}
            options={{
              tabBarLabel: "Hình ảnh",
              tabBarIcon: ({ color }: { color: string }) => (
                <Ionicons name="images-outline" size={20} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </View>

      {/* Weather modal */}
      <WeatherModal
        visible={weatherModalVisible}
        onClose={closeWeatherModalLocal}
        currentWeather={currentWeather}
        hourlyForecast={hourlyForecast || []}
        dailyForecast={dailyForecast || []}
      />

      {/* Advice modal */}
      <AdviceModal
        isVisible={adviceModalVisible}
        onClose={closeAdviceModal}
        advice={gardenAdvice ? [gardenAdvice] : []}
        isLoading={adviceLoading}
        error={adviceError}
        gardenName={garden?.name || ""}
        theme={theme}
        adviceType="garden"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: "Inter-Regular",
  },
});
