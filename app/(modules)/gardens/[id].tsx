import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

// Import custom hooks
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { useGardenDetail } from "@/hooks/garden/useGardenDetail";

// Import custom components
import EmptyStateView from "@/components/common/EmptyStateView";
import WeatherModal from "@/components/garden/WeatherModal";
import GardenHeader from "@/components/garden/GardenHeader";
import GardenOverviewTab from "@/components/garden/GardenOverviewTab";
import GardenSensorsTab from "@/components/garden/GardenSensorsTab";
import GardenPlantTab from "@/components/garden/GardenPlantTab";
import GardenPhotosTab from "@/components/garden/GardenPhotosTab";
import GardenWateringTab from "@/components/garden/GardenWateringTab";

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
    sensors,
    isLoading,
    isRefreshing,
    lastSensorUpdate,
    plantDetails,
    sensorHistory,
    gardenPhotos,
    resolveAlert,
    ignoreAlert,
    handleUploadPhoto,
    plantStats,
    plantStatsLoading,
    plantDetailedAdvice,
    plantDetailedAdviceLoading,
  } = useGardenDetail({ gardenId: id || null });

  // Modal visibility functions
  const openWeatherModal = () => setWeatherModalVisible(true);
  const closeWeatherModalLocal = () => setWeatherModalVisible(false);

  // Tab components
  const OverviewTab = useCallback(
    () => (
      <GardenOverviewTab
        garden={garden}
        plantDetails={plantDetails || undefined}
        alerts={alerts}
        onResolveAlert={(alertId: string) => resolveAlert(Number(alertId))}
        onIgnoreAlert={(alertId: string) => ignoreAlert(Number(alertId))}
        onShowWeather={openWeatherModal}
        currentWeather={currentWeather}
      />
    ),
    [
      garden,
      plantDetails,
      alerts,
      id,
      currentWeather,
      resolveAlert,
      ignoreAlert,
      openWeatherModal,
    ]
  );

  const WateringTab = useCallback(
    () => (
      <GardenWateringTab
        gardenId={id}
      />
    ),
    [id]
  );

  const SensorsTab = useCallback(
    () => (
      <GardenSensorsTab
        gardenId={id}
        sensorHistory={sensorHistory}
        lastSensorUpdate={lastSensorUpdate || undefined}
        currentGrowthStage={plantDetails?.currentGrowthStage}
        onSelectSensor={(sensor) => router.push(`/sensors/${sensor.id}`)}
      />
    ),
    [id, sensorHistory, lastSensorUpdate, plantDetails, router]
  );

  const PlantTab = useCallback(
    () => (
      <GardenPlantTab
        plantStats={plantStats}
        plantDetailedAdvice={plantDetailedAdvice}
        plantStatsLoading={plantStatsLoading}
        plantDetailedAdviceLoading={plantDetailedAdviceLoading}
      />
    ),
    [
      plantStats,
      plantDetailedAdvice,
      plantStatsLoading,
      plantDetailedAdviceLoading,
    ]
  );

  const PhotosTab = useCallback(
    () => (
      <GardenPhotosTab
        gardenId={garden?.id || id}
      />
    ),
    [garden?.id, id]
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
      <Stack.Screen
        options={{
          title: garden?.name,
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push(`/(modules)/gardens/edit/${id}`)}
              style={{ marginRight: 15, padding: 5 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Chỉnh sửa vườn"
              accessibilityHint={`Nhấn để chỉnh sửa thông tin khu vườn ${garden?.name}`}
            >
              <Ionicons name="pencil" size={24} color={theme.primary} />
            </TouchableOpacity>
          ),
        }}
      />

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
              fontSize: 12,
              fontFamily: "Inter-Medium",
              textTransform: "none",
            },
            tabBarScrollEnabled: true,
            tabBarItemStyle: {
              width: 'auto',
              minWidth: 80,
            },
          }}
        >
          <Tab.Screen
            name="Overview"
            component={OverviewTab}
            options={{
              tabBarLabel: "Tổng quan",
              tabBarIcon: ({ color }: { color: string }) => (
                <Ionicons name="home-outline" size={18} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Watering"
            component={WateringTab}
            options={{
              tabBarLabel: "Tưới nước",
              tabBarIcon: ({ color }: { color: string }) => (
                <Ionicons name="water-outline" size={18} color={color} />
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
                  name="pulse-outline"
                  size={18}
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
                <Ionicons name="leaf-outline" size={18} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Photos"
            component={PhotosTab}
            options={{
              tabBarLabel: "Hình ảnh",
              tabBarIcon: ({ color }: { color: string }) => (
                <Ionicons name="images-outline" size={18} color={color} />
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
