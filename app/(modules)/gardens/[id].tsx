import React, { useCallback, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Image as RNImage,
  Modal,
  ScrollView,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  Feather,
  FontAwesome5,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Image } from "expo-image";

// Import custom components
import WeatherDisplay from "@/components/common/WeatherDisplay";
import GardenStatusCard from "@/components/common/GardenStatusCard";
import AlertsList from "@/components/common/AlertsList";
import AdviceModal from "@/components/common/AdviceModal";
import GardenSensorSection, {
  UISensor,
} from "@/components/garden/GardenSensorSection";
import ActivityList from "@/components/garden/ActivityList";
import env from "@/config/environment";

// Import custom hooks
import { useGardenDetail } from "@/hooks/useGardenDetail";

// Import API services
import alertService from "@/service/api/alert.service";
import { apiClient } from "@/service";

import { AlertStatus, Garden, GardenStatus, TaskStatus } from "@/types";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";

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

const getValidIconName = (iconName: string): any => {
  // Define a set of valid icon names we use
  const validIcons = [
    "cloudy-outline",
    "sunny-outline",
    "rainy-outline",
    "thunderstorm-outline",
    "snow-outline",
    "partly-sunny-outline",
    "cloud-outline",
    "close",
    // Add more as needed
  ];

  // Return the icon if it's valid, otherwise return a default icon
  return validIcons.includes(iconName) ? iconName : "cloudy-outline"; // Default icon
};

export default function GardenDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppTheme();

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Use the custom hook for all garden data and operations
  const {
    garden,
    currentWeather,
    hourlyForecast,
    dailyForecast,
    alerts,
    wateringSchedule,
    activities,
    sensors,
    isLoading,
    isRefreshing,
    isSensorDataLoading,
    error,
    sensorDataError,
    lastSensorUpdate,
    adviceModalVisible,
    gardenAdvice,
    adviceLoading,
    adviceError,
    weatherModalVisible,
    loadGardenData,
    handleRefresh,
    refreshSensorData,
    fetchGardenAdvice,
    showAdviceModal,
    closeAdviceModal,
    showWeatherModal,
    closeWeatherModal,
    getSensorTrend,
    getTimeSinceUpdate,
  } = useGardenDetail({ gardenId: id || null });

  // Create memoized styles
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Handle alert functionality
  const handleResolveAlert = async (alertId: number) => {
    try {
      await alertService.updateAlertStatus(alertId, AlertStatus.RESOLVED);

      // Refresh data to reflect changes
      if (id) {
        refreshSensorData(id);
      }

      Toast.show({
        type: "success",
        text1: "Đã xử lý cảnh báo",
        position: "bottom",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Failed to resolve alert:", error);

      Toast.show({
        type: "error",
        text1: "Lỗi xử lý cảnh báo",
        text2: "Vui lòng thử lại sau",
        position: "bottom",
        visibilityTime: 3000,
      });
    }
  };

  const handleIgnoreAlert = async (alertId: number) => {
    try {
      // Assuming there's an API endpoint to ignore alerts
      await apiClient.post(`/alerts/${alertId}/ignore`);

      // Refresh data to reflect changes
      if (id) {
        refreshSensorData(id);
      }

      Toast.show({
        type: "success",
        text1: "Đã bỏ qua cảnh báo",
        position: "bottom",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Failed to ignore alert:", error);

      Toast.show({
        type: "error",
        text1: "Lỗi bỏ qua cảnh báo",
        text2: "Vui lòng thử lại sau",
        position: "bottom",
        visibilityTime: 3000,
      });
    }
  };

  // Weather button component
  const renderStatusWithWeatherButton = (garden: Garden) => {
    return (
      <View style={styles.weatherButtonContainer}>
        <TouchableOpacity
          style={styles.weatherButton}
          onPress={showWeatherModal}
          accessible={true}
          accessibilityLabel="Xem thông tin thời tiết"
          accessibilityHint="Nhấn để xem dự báo thời tiết chi tiết"
          accessibilityRole="button"
        >
          <Ionicons
            name={getValidIconName(
              currentWeather?.iconCode
                ? `${currentWeather.iconCode}-outline`
                : "cloudy-outline"
            )}
            size={22}
            color={theme.primary}
          />
          {currentWeather ? (
            <Text style={styles.weatherButtonTemp}>
              {Math.round(currentWeather.temp)}°C
            </Text>
          ) : (
            <Text style={styles.weatherButtonText}>Thời tiết</Text>
          )}
          <Ionicons
            name="chevron-down-outline"
            size={14}
            color={theme.primary}
            style={{ marginLeft: 3 }}
          />
        </TouchableOpacity>
      </View>
    );
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

    const activeAlerts = Array.isArray(alerts)
      ? alerts.filter(
          (a) =>
            a.status !== AlertStatus.RESOLVED &&
            a.status !== AlertStatus.IGNORED
        )
      : [];

    const upcomingSchedules = Array.isArray(wateringSchedule)
      ? wateringSchedule.filter(
          (ws) =>
            ws.status === "PENDING" && new Date(ws.scheduledAt) > new Date()
        )
      : [];

    let dataSections: DetailSection[] = [
      { type: DetailSectionType.STATUS, key: "status", data: [garden] },
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
  }, [garden, alerts, wateringSchedule, sensors, activities, id]);

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
              onShowAdvice={() => id && showAdviceModal(id)}
              topRightComponent={renderStatusWithWeatherButton(item)}
            />
          </View>
        );
      case DetailSectionType.WEATHER:
        return (
          <View style={styles.sectionContentPadding}>
            {item.currentWeather ? (
              <WeatherDisplay currentWeather={item.currentWeather} />
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
                <View style={styles.scheduleIconContainer}>
                  <MaterialIcons
                    name="water-drop"
                    size={20}
                    color={theme.primary}
                  />
                </View>
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
          <GardenSensorSection
            sensors={sensors}
            isSensorDataLoading={isSensorDataLoading}
            sensorDataError={sensorDataError}
            lastSensorUpdate={lastSensorUpdate}
            getTimeSinceUpdate={getTimeSinceUpdate}
            onSelectSensor={(sensor) => router.push(`/sensors/${sensor.id}`)}
            onRefreshSensors={() => id && refreshSensorData(id)}
            title="Thông tin cảm biến vườn"
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
                router.push(
                  `/(modules)/activities/create?gardenId=${item.gardenId}`
                )
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

    // Determine section title based on section type
    switch (section.type) {
      case DetailSectionType.STATUS:
        return null; // No header for the status section
      case DetailSectionType.WEATHER:
        title = "Thời tiết";
        break;
      case DetailSectionType.ALERTS:
        title = "Cảnh báo";
        break;
      case DetailSectionType.SCHEDULE:
        title = "Lịch tưới sắp tới";
        break;
      case DetailSectionType.SENSORS:
        return null; // Handled within the SensorDetailView component
      case DetailSectionType.ACTIVITY:
        title = "Hoạt động gần đây";
        break;
      case DetailSectionType.ACTIONS:
        title = "Hoạt động khác";
        break;
      default:
        return null;
    }

    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
      </View>
    );
  };

  // Header component for the section list
  const HeaderComponent = () => {
    if (!garden) return null;

    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerImageWrapper}>
          {garden.profilePicture ? (
            <Image
              source={{ uri: `${env.apiUrl}${garden.profilePicture}` }}
              style={styles.headerImage}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <RNImage
              source={require("@/assets/images/garden-placeholder.png")}
              style={styles.headerImage}
            />
          )}
          <LinearGradient
            style={styles.headerGradient}
            colors={["rgba(0,0,0,0.5)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessible={true}
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  // Weather Modal
  const renderWeatherModal = () => {
    return (
      <Modal
        visible={weatherModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeWeatherModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thông tin thời tiết</Text>
              <TouchableOpacity
                onPress={closeWeatherModal}
                accessible={true}
                accessibilityLabel="Đóng thông tin thời tiết"
                accessibilityRole="button"
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {currentWeather ? (
                <WeatherDisplay currentWeather={currentWeather} />
              ) : (
                <View style={styles.weatherLoadingContainer}>
                  <ActivityIndicator size="large" color={theme.primary} />
                  <Text style={styles.noDataText}>
                    Đang tải dữ liệu thời tiết...
                  </Text>
                </View>
              )}

              {/* Hourly forecast */}
              {hourlyForecast && hourlyForecast.length > 0 && (
                <View style={styles.forecastSection}>
                  <Text style={styles.forecastSectionTitle}>
                    Dự báo theo giờ
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.hourlyForecastScroll}
                  >
                    {hourlyForecast.slice(0, 24).map((hour, index) => (
                      <View
                        key={`hourly-${index}`}
                        style={styles.hourlyForecastItem}
                      >
                        <Text style={styles.hourTime}>
                          {new Date(hour.forecastedAt).getHours()}:00
                        </Text>
                        <Ionicons
                          name={getValidIconName(
                            hour.iconCode
                              ? `${hour.iconCode}-outline`
                              : "cloudy-outline"
                          )}
                          size={24}
                          color={theme.primary}
                        />
                        <Text style={styles.hourTemp}>
                          {Math.round(hour.temp)}°C
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Daily forecast */}
              {dailyForecast && dailyForecast.length > 0 && (
                <View style={styles.forecastSection}>
                  <Text style={styles.forecastSectionTitle}>Dự báo 7 ngày</Text>
                  {dailyForecast.map((day, index) => (
                    <View
                      key={`daily-${index}`}
                      style={styles.dailyForecastItem}
                    >
                      <Text style={styles.dayName}>
                        {new Date(day.forecastedAt).toLocaleDateString("vi", {
                          weekday: "short",
                        })}
                      </Text>
                      <View style={styles.dayIconContainer}>
                        <Ionicons
                          name={getValidIconName(
                            day.iconCode
                              ? `${day.iconCode}-outline`
                              : "cloudy-outline"
                          )}
                          size={24}
                          color={theme.primary}
                        />
                      </View>
                      <View style={styles.tempRangeContainer}>
                        <Text style={styles.tempRange}>
                          {Math.round(day.tempMin)}° - {Math.round(day.tempMax)}
                          °C
                        </Text>
                      </View>
                      <Text style={styles.rainChance}>
                        {Math.round(day.pop * 100)}%
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeWeatherModal}
              accessible={true}
              accessibilityLabel="Đóng"
              accessibilityRole="button"
            >
              <Text style={styles.modalCloseButtonText}>Đóng</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  // Loading state
  if (isLoading && !garden) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Đang tải chi tiết vườn...</Text>
      </View>
    );
  }

  // Error state
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
              loadGardenData(id);
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
      <Stack.Screen options={{ title: garden?.name, headerShown: false }} />
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
        ListHeaderComponent={HeaderComponent}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContentContainer}
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        SectionSeparatorComponent={() => (
          <View style={styles.sectionSeparator} />
        )}
        ListFooterComponent={<View style={{ height: 20 }} />}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />

      {/* Weather modal */}
      {renderWeatherModal()}

      {/* Advice modal */}
      <AdviceModal
        isVisible={adviceModalVisible}
        onClose={closeAdviceModal}
        advice={gardenAdvice}
        isLoading={adviceLoading}
        error={adviceError}
        gardenName={garden?.name || ""}
        theme={theme}
        adviceType="garden"
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
    headerContainer: {
      position: "relative",
      height: 220,
    },
    headerImageWrapper: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    headerImage: {
      position: "absolute",
      width: "100%",
      height: "100%",
      backgroundColor: theme.borderLight,
    },
    headerGradient: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 120,
    },
    backButton: {
      padding: 8,
      backgroundColor: "rgba(0,0,0,0.3)",
      borderRadius: 20,
      position: "absolute",
      top: 10,
      left: 10,
    },
    sectionHeader: {
      padding: 16,
    },
    sectionHeaderText: {
      fontSize: 18,
      fontFamily: "Inter-Bold",
      color: theme.text,
    },
    sectionContentPadding: {
      paddingHorizontal: 16,
    },
    itemSeparator: {
      height: 8,
    },
    sectionSeparator: {
      height: 15,
      backgroundColor: theme.backgroundAlt,
    },
    noDataText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      paddingVertical: 20,
    },
    listSectionContainer: {
      paddingVertical: 5,
    },
    scheduleItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      padding: 14,
      borderRadius: 12,
      marginBottom: 10,
      marginHorizontal: 16,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    scheduleIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primaryLight,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    scheduleInfo: {
      flex: 1,
      marginLeft: 4,
    },
    scheduleTime: {
      fontSize: 15,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 3,
    },
    scheduleAmount: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    scheduleStatusContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
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
    bottomActionContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingTop: 16,
      paddingBottom: 14,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
      backgroundColor: theme.background,
      marginTop: 10,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 25,
      backgroundColor: theme.primaryLight,
    },
    actionButtonText: {
      marginLeft: 8,
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.primary,
    },
    weatherButtonContainer: {
      position: "absolute",
      top: 10,
      right: 10,
      zIndex: 5,
    },
    weatherButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.cardAlt,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 16,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    weatherButtonTemp: {
      marginLeft: 4,
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.primary,
    },
    weatherButtonText: {
      marginLeft: 4,
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.primary,
    },
    // Weather modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      width: "90%",
      maxHeight: "80%",
      backgroundColor: theme.background,
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: "Inter-Bold",
      color: theme.text,
    },
    modalContent: {
      padding: 16,
    },
    closeButton: {
      padding: 8,
      borderRadius: 20,
    },
    modalCloseButton: {
      alignSelf: "center",
      paddingVertical: 12,
      paddingHorizontal: 24,
      backgroundColor: theme.primary,
      borderRadius: 8,
      marginVertical: 16,
      width: "80%",
    },
    modalCloseButtonText: {
      color: theme.card,
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      textAlign: "center",
    },
    // Weather forecast styles
    weatherLoadingContainer: {
      padding: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    forecastSection: {
      marginTop: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
    },
    forecastSectionTitle: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 12,
    },
    hourlyForecastScroll: {
      flexGrow: 0,
      marginBottom: 8,
    },
    hourlyForecastItem: {
      alignItems: "center",
      marginRight: 16,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: theme.cardAlt,
      borderRadius: 12,
      minWidth: 60,
    },
    hourTime: {
      fontSize: 13,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
      marginBottom: 6,
    },
    hourTemp: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginTop: 6,
    },
    dailyForecastItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    dayName: {
      width: 50,
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.text,
    },
    dayIconContainer: {
      width: 40,
      alignItems: "center",
    },
    tempRangeContainer: {
      flex: 1,
      marginLeft: 8,
    },
    tempRange: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
    },
    rainChance: {
      fontSize: 13,
      fontFamily: "Inter-Medium",
      color: theme.primary,
      marginLeft: 8,
    },
  });
