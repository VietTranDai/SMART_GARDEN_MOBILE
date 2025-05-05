import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";

// Import custom components
import WeatherDisplay from "@/components/garden/WeatherDisplay";
import SensorDetailView from "@/components/garden/SensorDetailView";
import GardenStatusCard from "@/components/garden/GardenStatusCard";
import AlertsList from "@/components/garden/AlertsList";
import ActivityList from "@/components/garden/ActivityList";

// Import API services
import gardenService from "@/service/api/garden.service";
import weatherService from "@/service/api/weather.service";
import sensorService from "@/service/api/sensor.service";
import taskService from "@/service/api/task.service";
import activityService from "@/service/api/activity.service";
import alertService from "@/service/api/alert.service";
import wateringScheduleService from "@/service/api/watering.service";
// Import weather types directly from the weather types file
import {
  DailyForecast,
  HourlyForecast,
  WeatherObservation,
} from "@/types/weather/weather.types";

// Import enums and potentially types from the central database constants/types file
import {
  Alert,
  AlertStatus,
  Garden,
  GardenActivity,
  GardenStatus,
  Sensor,
  TaskStatus,
  WateringSchedule,
} from "@/types";
import { apiClient } from "@/service";

enum DetailSectionType {
  STATUS = "STATUS",
  WEATHER = "WEATHER",
  ALERTS = "ALERTS",
  SCHEDULE = "SCHEDULE",
  SENSORS = "SENSORS",
  ACTIVITY = "ACTIVITY",
  ACTIONS = "ACTIONS",
}

interface DetailSection {
  type: DetailSectionType;
  key: string;
  data: any[];
}

export default function GardenDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State for garden data
  const [garden, setGarden] = useState<Garden | null>(null);
  const [currentWeather, setCurrentWeather] =
    useState<WeatherObservation | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [wateringSchedule, setWateringSchedule] = useState<
    WateringSchedule[]
  >([]);
  const [activities, setActivities] = useState<GardenActivity[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load garden data using API calls
  const loadGardenData = useCallback(async (gardenId: string) => {
    if (!gardenId) return;
    setIsLoading(true);
    setError(null);

    try {
      // Load garden details
      const gardenData = await gardenService.getGardenById(gardenId);
      setGarden(gardenData);

      // Load weather data
      try {
        const weatherData = await weatherService.getCurrentWeather(gardenId);
        setCurrentWeather(weatherData);
      } catch (error) {
        console.error("Failed to load weather data:", error);
        setCurrentWeather(null);
      }

      // Load hourly forecast
      try {
        const hourlyData = await weatherService.getHourlyForecast(gardenId);
        setHourlyForecast(hourlyData);
      } catch (error) {
        console.error("Failed to load hourly forecast:", error);
        setHourlyForecast([]);
      }

      // Load daily forecast
      try {
        const dailyData = await weatherService.getDailyForecast(gardenId);
        setDailyForecast(dailyData);
      } catch (error) {
        console.error("Failed to load daily forecast:", error);
        setDailyForecast([]);
      }

      // Load sensors
      try {
        const sensorData = await sensorService.getSensorsByGarden(gardenId);
        setSensors(sensorData);
      } catch (error) {
        console.error("Failed to load sensor data:", error);
        setSensors([]);
      }

      // Load alerts
      try {
        const alertData = await alertService.getAlertsByGarden(gardenId);
        setAlerts(alertData);
      } catch (error) {
        console.error("Failed to load alerts:", error);
        setAlerts([]);
      }

      // Load watering schedule
      try {
        const response = await wateringScheduleService.getGardenWateringSchedules(gardenId);
        setWateringSchedule(response);
      } catch (error) {
        console.error("Failed to load watering schedule:", error);
        setWateringSchedule([]);
      }

      // Load activities
      try {
        const response = await activityService.getActivitiesByGarden(gardenId);
        setActivities(response);
      } catch (error) {
        console.error("Failed to load activities:", error);
        setActivities([]);
      }
    } catch (error) {
      console.error("Failed to load garden data:", error);
      setError("Failed to load garden data. Please try again.");
      setGarden(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadGardenData(id).then((r) => console.log(r));
    }
  }, [id, loadGardenData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (id) {
      loadGardenData(id).finally(() => setRefreshing(false));
    } else {
      setRefreshing(false);
    }
  }, [id, loadGardenData]);

  const handleResolveAlert = async (alertId: number) => {
    try {
      await alertService.resolveAlert(alertId);

      setAlerts((prevAlerts) =>
        prevAlerts.map((alert) =>
          alert.id === alertId
            ? { ...alert, status: AlertStatus.RESOLVED }
            : alert
        )
      );
    } catch (error) {
      console.error("Failed to resolve alert:", error);
      // Show error toast or message
    }
  };

  const handleIgnoreAlert = async (alertId: number) => {
    try {
      // Assuming there's an API endpoint to ignore alerts
      await apiClient.post(`/alerts/${alertId}/ignore`);

      setAlerts((prevAlerts) =>
        prevAlerts.filter((alert) => alert.id !== alertId)
      );
    } catch (error) {
      console.error("Failed to ignore alert:", error);
      // Show error toast or message
    }
  };

  const getStatusColor = (
    status: TaskStatus | AlertStatus | GardenStatus | string
  ): string => {
    switch (status) {
      case TaskStatus.COMPLETED:
      case AlertStatus.RESOLVED:
      case GardenStatus.ACTIVE:
        return theme.success;
      case TaskStatus.SKIPPED:
      case AlertStatus.IGNORED:
        return theme.warning;
      case GardenStatus.INACTIVE:
        return theme.textTertiary;
      case TaskStatus.PENDING:
      case AlertStatus.PENDING:
      case AlertStatus.IN_PROGRESS:
      case AlertStatus.ESCALATED:
        return theme.primary;
      default:
        return theme.textSecondary;
    }
  };
  const getStatusText = (
    status: TaskStatus | AlertStatus | GardenStatus | string
  ): string => {
    switch (status) {
      case TaskStatus.PENDING:
        return "Chờ xử lý";
      case TaskStatus.COMPLETED:
        return "Hoàn thành";
      case TaskStatus.SKIPPED:
        return "Đã bỏ qua";
      case AlertStatus.PENDING:
        return "Mới";
      case AlertStatus.RESOLVED:
        return "Đã xử lý";
      case AlertStatus.IGNORED:
        return "Đã bỏ qua";
      case AlertStatus.IN_PROGRESS:
        return "Đang xử lý";
      case AlertStatus.ESCALATED:
        return "Đã chuyển cấp";
      case GardenStatus.ACTIVE:
        return "Hoạt động";
      case GardenStatus.INACTIVE:
        return "Ngừng";
      default:
        return String(status);
    }
  };

  const sections: DetailSection[] = useMemo(() => {
    if (!garden) return [];

    const activeAlerts = alerts.filter(
      (a) =>
        a.status !== AlertStatus.RESOLVED && a.status !== AlertStatus.IGNORED
    );
    const upcomingSchedules = wateringSchedule.filter(
      (ws) => ws.status === "PENDING" && new Date(ws.scheduledAt) > new Date()
    );

    let dataSections: DetailSection[] = [
      { type: DetailSectionType.STATUS, key: "status", data: [garden] },
      {
        type: DetailSectionType.WEATHER,
        key: "weather",
        data: [{ currentWeather, hourlyForecast, dailyForecast }],
      },
    ];

    if (activeAlerts.length > 0) {
      dataSections.push({
        type: DetailSectionType.ALERTS,
        key: "alerts",
        data: [activeAlerts],
      });
    }
    if (upcomingSchedules.length > 0) {
      dataSections.push({
        type: DetailSectionType.SCHEDULE,
        key: "schedule",
        data: [upcomingSchedules.slice(0, 3)],
      });
    } else {
      dataSections.push({
        type: DetailSectionType.SCHEDULE,
        key: "schedule-empty",
        data: [[]],
      });
    }

    dataSections.push({
      type: DetailSectionType.SENSORS,
      key: "sensors",
      data: [sensors],
    });

    if (activities.length > 0) {
      dataSections.push({
        type: DetailSectionType.ACTIVITY,
        key: "activity",
        data: [activities.slice(0, 5)],
      });
    } else {
      dataSections.push({
        type: DetailSectionType.ACTIVITY,
        key: "activity-empty",
        data: [[]],
      });
    }

    dataSections.push({
      type: DetailSectionType.ACTIONS,
      key: "actions",
      data: [{ gardenId: id }],
    });

    return dataSections;
  }, [
    garden,
    currentWeather,
    hourlyForecast,
    dailyForecast,
    alerts,
    wateringSchedule,
    sensors,
    activities,
    id,
  ]);

  const renderSectionItem = ({
    section,
    item,
  }: {
    section: DetailSection;
    item: any;
  }) => {
    switch (section.type) {
      case DetailSectionType.STATUS:
        return (
          <View style={styles.sectionContentPadding}>
            <GardenStatusCard
              garden={item}
              onViewPlantDetails={() => {
                console.log("Navigate to plant details for:", item.plantName);
              }}
            />
          </View>
        );
      case DetailSectionType.WEATHER:
        return (
          <View style={styles.sectionContentPadding}>
            {item.currentWeather ? (
              <WeatherDisplay
                currentWeather={item.currentWeather}
                hourlyForecast={item.hourlyForecast}
                dailyForecast={item.dailyForecast}
              />
            ) : (
              <Text style={styles.noDataText}>
                Đang tải dữ liệu thời tiết...
              </Text>
            )}
          </View>
        );
      case DetailSectionType.ALERTS:
        return (
          <AlertsList
            alerts={item}
            onResolveAlert={(alertId: string) =>
              handleResolveAlert(Number(alertId))
            }
            onIgnoreAlert={(alertId: string) =>
              handleIgnoreAlert(Number(alertId))
            }
          />
        );
      case DetailSectionType.SCHEDULE:
        const schedulesToRender = item;
        if (!schedulesToRender || schedulesToRender.length === 0) {
          return (
            <Text style={[styles.noDataText, styles.sectionContentPadding]}>
              Chưa có lịch tưới nào sắp tới.
            </Text>
          );
        }
        return (
          <View style={styles.listSectionContainer}>
            {schedulesToRender.map((scheduleItem: any) => (
              <View key={scheduleItem.id} style={styles.scheduleItem}>
                <MaterialIcons
                  name="water-drop"
                  size={20}
                  color={theme.primary}
                />
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleTime}>
                    {new Date(scheduleItem.scheduledAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(scheduleItem.scheduledAt).toLocaleDateString([], {
                      weekday: "short",
                      month: "numeric",
                      day: "numeric",
                    })}
                  </Text>
                  <Text style={styles.scheduleAmount}>
                    {scheduleItem.amount} L
                  </Text>
                </View>
                <View style={styles.scheduleStatusContainer}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(scheduleItem.status) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.scheduleStatusText,
                      { color: getStatusColor(scheduleItem.status) },
                    ]}
                  >
                    {getStatusText(scheduleItem.status)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        );
      case DetailSectionType.SENSORS:
        return (
          <SensorDetailView
            sensors={item}
            data={item}
            onSelectSensor={(sensor) => router.push(`/sensors/${sensor.id}`)}
          />
        );
      case DetailSectionType.ACTIVITY:
        const activitiesToRender = item;
        if (!activitiesToRender || activitiesToRender.length === 0) {
          return (
            <Text style={[styles.noDataText, styles.sectionContentPadding]}>
              Chưa có hoạt động nào gần đây.
            </Text>
          );
        }
        return <ActivityList activities={activitiesToRender} />;
      case DetailSectionType.ACTIONS:
        return (
          <View
            style={[styles.bottomActionContainer, styles.sectionContentPadding]}
          >
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.primaryLight },
              ]}
              onPress={() =>
                console.log("Go to add activity for garden:", item.gardenId)
              }
            >
              <FontAwesome5 name="plus" size={16} color={theme.primary} />
              <Text style={[styles.actionButtonText, { color: theme.primary }]}>
                Thêm hoạt động
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.primaryLight },
              ]}
              onPress={() => console.log("Image upload TBD")}
            >
              <FontAwesome5 name="camera" size={16} color={theme.primary} />
              <Text style={[styles.actionButtonText, { color: theme.primary }]}>
                Tải ảnh lên
              </Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  const renderSectionHeader = ({ section }: { section: DetailSection }) => {
    let title = "";
    let showButton = false;
    let buttonText = "Xem tất cả";
    let buttonIcon: any = null;
    let buttonOnPress = () => {};
    let hasData = section.data[0]?.length > 0;

    switch (section.type) {
      case DetailSectionType.ALERTS:
        title = "Cảnh báo Đang hoạt động";
        if (!hasData) return null;
        break;
      case DetailSectionType.SCHEDULE:
        title = "Lịch tưới sắp tới";
        showButton = true;
        buttonText = "Quản lý lịch";
        buttonIcon = (
          <MaterialIcons name="schedule" size={18} color={theme.primary} />
        );
        buttonOnPress = () =>
          router.push(`/(modules)/gardens/schedule?id=${id}`);
        break;
      case DetailSectionType.SENSORS:
        title = "Số liệu Cảm biến";
        if (!hasData) return null;
        break;
      case DetailSectionType.ACTIVITY:
        title = "Hoạt động Gần đây";
        showButton = true;
        buttonText = "Xem tất cả";
        buttonIcon = (
          <MaterialIcons name="history" size={18} color={theme.primary} />
        );
        buttonOnPress = () => console.log("Navigate to full activity history");
        break;
      default:
        return null;
    }

    return (
      <View
        style={[styles.sectionContainerHeader, styles.sectionContentPadding]}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        {section.type === DetailSectionType.ALERTS &&
          section.data[0]?.length > 0 && (
            <View
              style={[
                styles.headerAlertCountBadge,
                { backgroundColor: theme.error },
              ]}
            >
              <Text style={styles.headerAlertCountText}>
                {section.data[0].length}
              </Text>
            </View>
          )}
        {showButton && (
          <TouchableOpacity
            onPress={buttonOnPress}
            style={styles.sectionHeaderButton}
          >
            {buttonIcon}
            <Text style={styles.sectionHeaderButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const ListHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => router.back()}
      >
        <Feather name="arrow-left" size={24} color={theme.primary} />
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <Text
          style={[styles.headerTitle, { color: theme.text }]}
          numberOfLines={1}
        >
          {garden?.name}
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          {garden?.district
            ? `${garden.district}, ${garden.city}`
            : garden?.city}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => router.push(`/(modules)/gardens/edit/${id}`)}
      >
        <Feather name="edit-2" size={20} color={theme.primary} />
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !garden) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Đang tải chi tiết vườn...</Text>
      </View>
    );
  }

  if (!garden) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Feather name="alert-triangle" size={40} color={theme.error} />
        <Text style={styles.errorText}>
          {error || "Không thể tải dữ liệu vườn."}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButtonOnError}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (id) {
              loadGardenData(id).then((r) => console.log(r));
            }
          }}
          style={[
            styles.backButtonOnError,
            { marginTop: 10, backgroundColor: theme.secondary },
          ]}
        >
          <Text style={styles.backButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: garden.name, headerShown: false }} />
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => {
          // Ensure a unique string key even if item.id is missing/invalid
          return typeof item?.id === "string" || typeof item?.id === "number"
            ? item.id.toString()
            : `idx-${index}`;
        }}
        renderItem={renderSectionItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={ListHeader}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContentContainer}
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        SectionSeparatorComponent={() => (
          <View style={styles.sectionSeparator} />
        )}
        ListFooterComponent={<View style={{ height: 20 }} />}
      />
    </>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundAlt,
    },
    listContentContainer: {
      paddingBottom: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
    },
    errorText: {
      marginTop: 12,
      fontSize: 16,
      color: theme.error,
      fontFamily: "Inter-SemiBold",
      textAlign: "center",
      marginHorizontal: 20,
    },
    backButtonOnError: {
      marginTop: 20,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: theme.primary,
      borderRadius: 8,
    },
    backButtonText: {
      color: theme.card,
      fontSize: 16,
      fontFamily: "Inter-Medium",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingTop: Platform.OS === "ios" ? 50 : 40,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    headerButton: {
      padding: 5,
    },
    headerTitleContainer: {
      flex: 1,
      marginHorizontal: 12,
      alignItems: "center",
    },
    headerTitle: { fontSize: 18, fontFamily: "Inter-Bold", color: theme.text },
    headerSubtitle: {
      fontSize: 13,
      marginTop: 2,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
    },
    sectionContainerHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 12,
      paddingTop: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
      marginBottom: 10,
    },
    sectionContentPadding: {
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: "Inter-Bold",
      color: theme.text,
      flexShrink: 1,
    },
    headerAlertCountBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 8,
      paddingHorizontal: 5,
    },
    headerAlertCountText: {
      color: theme.card,
      fontSize: 12,
      fontFamily: "Inter-Bold",
    },
    sectionHeaderButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
      backgroundColor: theme.cardAlt,
    },
    sectionHeaderButtonText: {
      fontSize: 13,
      fontFamily: "Inter-Medium",
      color: theme.primary,
      marginLeft: 4,
    },
    scheduleItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      marginHorizontal: 16,
    },
    scheduleInfo: {
      flex: 1,
      marginLeft: 12,
    },
    scheduleTime: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 2,
    },
    scheduleAmount: {
      fontSize: 13,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    scheduleStatusContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: theme.backgroundAlt,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 5,
    },
    scheduleStatusText: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
    },
    listSectionContainer: {},
    bottomActionContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingTop: 16,
      paddingBottom: 10,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
      backgroundColor: theme.background,
      marginTop: 10,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: theme.primaryLight,
    },
    actionButtonText: {
      marginLeft: 8,
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.primary,
    },
    itemSeparator: {
      height: 8,
    },
    sectionSeparator: {
      height: 10,
      backgroundColor: theme.backgroundAlt,
    },
    noDataText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      paddingVertical: 20,
    },
  });
