import React, { useRef, useCallback, useMemo, memo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import useSectionAnimation from "@/hooks/ui/useSectionAnimation";
import { GardenType } from "@/types/gardens/garden.types";
import { GardenDisplayDto } from "@/types/gardens/dtos";
import { SensorType, SensorData } from "@/types/gardens/sensor.types";
import { makeHomeStyles } from "../common/styles";
import { LinearGradient } from "expo-linear-gradient";
import { useGardenContext } from "@/contexts/GardenContext";
import gardenService from "@/service/api/garden.service";
import sensorService from "@/service/api/sensor.service";
import SensorStrip from "./SensorStrip";
import env from "@/config/environment";

// Interface cho GardenCard props
interface GardenCardProps {
  garden: GardenDisplayDto;
  index: number;
  isSelected: boolean;
  onSelect: (gardenId: number, index: number) => void;
  onShowAdvice?: (gardenId: number) => void;
  onShowWeatherDetail?: (gardenId: number) => void;
  gardenSensorData: Record<string, SensorData[]>;
  gardenWeather: any | null;
  getSensorStatus?: (
    value: number,
    type: SensorType
  ) => "normal" | "warning" | "critical";
  theme: any;
  showLargeCards: boolean;
  getGardenIcon: (type: GardenType) => string;
  getGardenTypeText: (type: GardenType) => string;
  getDefaultGardenImage: (type: GardenType) => { uri: string };
  formatDate: (dateString?: string) => string;
  adviceLoading?: boolean;
  weatherLoading?: boolean;
  onShowAlertDetails?: (gardenId: number) => void;
}

interface GardenDisplayProps {
  gardens: GardenDisplayDto[];
  selectedGardenId?: number | null;
  onSelectGarden: (gardenId: number) => void;
  showFullDetails?: boolean;
  sensorDataByGarden?: Record<number, Record<string, SensorData[]>>;
  sensorDataLoading?: Record<number, boolean>;
  sensorDataError?: Record<number, string | null>;
  onShowAdvice?: (gardenId: number) => void;
  onTogglePinGarden?: (gardenId: number) => void;
  weatherDataByGarden?: Record<number, any>;
  showLargeCards?: boolean;
  getSensorStatus?: (
    value: number,
    type: SensorType
  ) => "normal" | "warning" | "critical";
  onShowWeatherDetail?: (gardenId: number) => void;
  onScrollToWeatherSection?: (gardenId: number) => void;
  adviceLoading?: Record<number, boolean>;
  weatherDetailLoading?: Record<number, boolean>;
  onShowAlertDetails?: (gardenId: number) => void;
}

// Tối ưu component với memo
const GardenCard = memo(
  ({
    garden,
    index,
    isSelected,
    onSelect,
    onShowAdvice,
    onShowWeatherDetail,
    gardenSensorData = {},
    gardenWeather = null,
    getSensorStatus,
    theme,
    showLargeCards = false,
    getGardenIcon,
    getGardenTypeText,
    getDefaultGardenImage,
    formatDate,
    adviceLoading = false,
    weatherLoading = false,
    onShowAlertDetails,
  }: GardenCardProps) => {
    const iconName = getGardenIcon(garden.type);
    const scaleValue = useRef(new Animated.Value(1)).current;

    // Xác định số cảnh báo từ sensor data
    const getSensorAlerts = useCallback(() => {
      let alertCount = 0;

      // Kiểm tra nếu gardenSensorData không phải là object hợp lệ
      if (!gardenSensorData || typeof gardenSensorData !== "object") {
        return 0;
      }

      // Kiểm tra các loại cảm biến phổ biến
      const sensorTypes = [
        SensorType.TEMPERATURE,
        SensorType.HUMIDITY,
        SensorType.SOIL_MOISTURE,
        SensorType.LIGHT,
      ];

      sensorTypes.forEach((type) => {
        // Chuyển đổi enum thành string để sử dụng làm key
        const typeKey = type.toString();

        // Kiểm tra an toàn trước khi truy cập
        if (gardenSensorData[typeKey]?.length) {
          const latestReading = gardenSensorData[typeKey][0]; // Lấy chỉ số mới nhất
          if (latestReading) {
            // Kiểm tra giá trị cảm biến có vượt ngưỡng không
            const status = getSensorStatus
              ? getSensorStatus(latestReading.value, type)
              : "normal";

            if (status === "warning" || status === "critical") {
              alertCount++;
            }
          }
        }
      });

      return alertCount;
    }, [gardenSensorData, getSensorStatus, garden.id]);

    // Lấy tổng số cảnh báo (kết hợp giữa alert từ backend và sensor alerts)
    const sensorAlertCount = getSensorAlerts();

    const handlePress = useCallback(() => {
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      onSelect(garden.id, index);
    }, [scaleValue, onSelect, garden.id, index]);

    // Navigate to garden detail page
    const handleGoToDetail = useCallback(() => {
      router.push(`/garden/${garden.id}`);
    }, [garden.id]);

    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleValue }],
          margin: 4,
        }}
      >
        <TouchableOpacity
          style={[
            styles.gardenCard,
            showLargeCards ? styles.largeGardenCard : {},
            {
              backgroundColor: theme.card,
              borderWidth: isSelected ? 2 : 0,
              borderColor: isSelected ? theme.primary : "transparent",
              ...Platform.select({
                ios: {
                  shadowColor: theme.shadow,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isSelected ? 0.15 : 0.1,
                  shadowRadius: 6,
                },
                android: {
                  elevation: isSelected ? 4 : 2,
                },
              }),
            },
          ]}
          onPress={handlePress}
          activeOpacity={0.9}
        >
          {/* Profile Picture với overlay gradient */}
          <View style={styles.imageContainer}>
            {garden.profilePicture ? (
              <Image
                source={{ uri: `${env.apiUrl}${garden.profilePicture}` }}
                style={styles.gardenImage}
                defaultSource={getDefaultGardenImage(garden.type)}
              />
            ) : (
              <Image
                source={getDefaultGardenImage(garden.type)}
                style={styles.gardenImage}
              />
            )}

            {/* Gradient overlay để làm nổi bật thông tin trên ảnh */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={styles.imageGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />

            {/* Icon Garden Type */}
            <View style={styles.gardenTypeIconContainer}>
              <Ionicons name={iconName as any} size={14} color="#fff" />
            </View>

            {/* Garden name over image */}
            <View style={styles.gardenNameContainer}>
              <Text
                style={styles.gardenImageName}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {garden.name}
              </Text>
              <Text style={styles.gardenImageType}>
                {getGardenTypeText(garden.type)}
              </Text>
              {sensorAlertCount > 0 && (
                <TouchableOpacity
                  style={[
                    styles.alertBadge,
                    { backgroundColor: `${theme.warning}CC` },
                  ]}
                  onPress={() => {
                    // This would show alert details
                    if (isSelected && onShowAlertDetails) {
                      onShowAlertDetails(garden.id);
                    } else {
                      // Select garden first, then show alerts
                      onSelect(garden.id, index);
                      setTimeout(() => {
                        if (onShowAlertDetails) onShowAlertDetails(garden.id);
                      }, 300);
                    }
                  }}
                >
                  <Ionicons name="alert-circle" size={12} color="#fff" />
                  <Text style={styles.alertBadgeText}>
                    {sensorAlertCount} cảnh báo
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Garden Information */}
          <View style={styles.gardenInfo}>
            {/* Garden Stats - Thông tin số liệu đặt ở đầu */}
            <View style={styles.statsContainer}>
              <View
                style={[
                  styles.statItem,
                  { backgroundColor: `${theme.primary}10` },
                ]}
              >
                <Ionicons
                  name="hardware-chip-outline"
                  size={16}
                  color={theme.primary}
                  style={styles.statIcon}
                />
                <View style={styles.statTextContainer}>
                  <Text style={styles.statLabel}>Cảm biến</Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>
                    {garden.sensorCount || 0}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.statItem,
                  { backgroundColor: `${theme.primary}10` },
                ]}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color={sensorAlertCount > 0 ? theme.warning : theme.primary}
                  style={styles.statIcon}
                />
                <View style={styles.statTextContainer}>
                  <Text style={styles.statLabel}>Cảnh báo</Text>
                  <Text
                    style={[
                      styles.statValue,
                      {
                        color:
                          sensorAlertCount > 0 ? theme.warning : theme.text,
                      },
                    ]}
                  >
                    {sensorAlertCount}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.statItem,
                  { backgroundColor: `${theme.primary}10` },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={theme.primary}
                  style={styles.statIcon}
                />
                <View style={styles.statTextContainer}>
                  <Text style={styles.statLabel}>Trồng lúc</Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>
                    {garden.plantStartDate
                      ? formatDate(garden.plantStartDate)
                      : "--/--"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Plant Info Row - Đầu tiên */}
            {garden.plantName && (
              <View style={styles.plantInfoRow}>
                <Ionicons name="leaf-outline" size={14} color={theme.primary} />
                <Text
                  style={[styles.plantInfoText, { color: theme.text }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {garden.plantName}{" "}
                  {garden.plantGrowStage ? `(${garden.plantGrowStage})` : ""}
                </Text>
              </View>
            )}

            {/* Garden Description */}
            {garden.description && (
              <View style={styles.descriptionContainer}>
                <Text
                  style={[
                    styles.descriptionText,
                    { color: theme.textSecondary },
                  ]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {garden.description}
                </Text>
              </View>
            )}

            {/* Harvest Progress - Đặt thứ hai */}
            {garden.daysUntilHarvest !== undefined && (
              <View style={styles.harvestProgressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Tiến độ thu hoạch</Text>
                  <Text style={styles.daysRemaining}>
                    {garden.growthProgress || 0}% - {garden.daysUntilHarvest}{" "}
                    ngày
                  </Text>
                </View>
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: `${theme.primary}15` },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: theme.primary,
                        width: `${garden.growthProgress || 0}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            )}

            {/* Direct Sensor Data Display - Đặt thứ ba */}
            <SensorStrip
              sensorData={gardenSensorData || {}}
              theme={theme}
              compact={true}
            />

            {/* Location Row - Đặt thứ tư */}
            {garden.location && (
              <View style={styles.metaInfoRow}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={theme.textSecondary}
                />
                <Text
                  style={[styles.metaInfoText, { color: theme.textSecondary }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {garden.location}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              {/* Detail Button - Go to garden detail page */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: `${theme.primary}20` },
                ]}
                onPress={handleGoToDetail}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={theme.primary}
                />
              </TouchableOpacity>

              {/* Advice Button */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: `${theme.card}E6` },
                ]}
                disabled={adviceLoading}
                onPress={() => {
                  if (onShowAdvice && !adviceLoading) {
                    onShowAdvice(garden.id);
                  }
                }}
              >
                {adviceLoading ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <Ionicons
                    name="bulb-outline"
                    size={18}
                    color={theme.primary}
                  />
                )}
              </TouchableOpacity>

              {/* Weather Button - Enhanced with better styling */}
              {gardenWeather && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: `${theme.primary}20` },
                  ]}
                  disabled={weatherLoading}
                  onPress={() => {
                    if (onShowWeatherDetail && !weatherLoading) {
                      onShowWeatherDetail(garden.id);
                    }
                  }}
                >
                  {weatherLoading ? (
                    <ActivityIndicator size="small" color="#4da0ff" />
                  ) : (
                    <Ionicons
                      name={
                        gardenWeather.weatherMain === "CLEAR"
                          ? "sunny-outline"
                          : gardenWeather.weatherMain === "CLOUDS"
                            ? "cloudy-outline"
                            : gardenWeather.weatherMain === "RAIN"
                              ? "rainy-outline"
                              : "cloud-outline"
                      }
                      size={18}
                      color="#4da0ff"
                    />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  },
  // Optimize memo comparison to prevent unnecessary renders
  (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.gardenSensorData === nextProps.gardenSensorData &&
      prevProps.adviceLoading === nextProps.adviceLoading &&
      prevProps.weatherLoading === nextProps.weatherLoading &&
      // Check gardenWeather content instead of just reference
      ((prevProps.gardenWeather === null && nextProps.gardenWeather === null) ||
        (prevProps.gardenWeather !== null &&
          nextProps.gardenWeather !== null &&
          prevProps.gardenWeather.weatherMain ===
            nextProps.gardenWeather.weatherMain))
    );
  }
);

// Wrap GardenDisplay in memo for maximum optimization
const GardenDisplay = memo(function GardenDisplay({
  gardens,
  selectedGardenId: propSelectedGardenId,
  onSelectGarden: propOnSelectGarden,
  showFullDetails = false,
  sensorDataByGarden = {},
  sensorDataLoading = {},
  sensorDataError = {},
  onShowAdvice,
  onTogglePinGarden,
  weatherDataByGarden = {},
  showLargeCards = false,
  getSensorStatus,
  onShowWeatherDetail,
  onScrollToWeatherSection,
  adviceLoading = {},
  weatherDetailLoading = {},
  onShowAlertDetails,
}: GardenDisplayProps) {
  const theme = useAppTheme();
  const { selectedGardenId, selectGarden } = useGardenContext();
  const { getAnimatedStyle } = useSectionAnimation("gardens");
  const scrollViewRef = useRef<ScrollView>(null);
  const lastSelectedIndex = useRef<number | null>(null);

  // Sử dụng propSelectedGardenId nếu được cung cấp, nếu không sử dụng giá trị từ context
  const effectiveSelectedGardenId = propSelectedGardenId ?? selectedGardenId;

  // Sử dụng callback propOnSelectGarden nếu được cung cấp, nếu không sử dụng context
  const handleSelectGarden = useCallback(
    (gardenId: number) => {
      if (propOnSelectGarden) {
        propOnSelectGarden(gardenId);
      } else {
        selectGarden(gardenId);
      }
    },
    [propOnSelectGarden, selectGarden]
  );

  // Memoize utility functions để tối ưu hiệu suất
  // Sử dụng sensorService thay vì định nghĩa trực tiếp
  const getSensorStatusFunc = useCallback(
    (value: number, type: SensorType) => {
      return getSensorStatus
        ? getSensorStatus(value, type)
        : sensorService.getSensorStatus(value, type);
    },
    [getSensorStatus]
  );

  // Các utility functions đã memoize
  const getGardenIcon = useCallback((type: GardenType) => {
    return gardenService.getGardenIconName(type);
  }, []);

  const getGardenTypeText = useCallback((type: GardenType) => {
    return gardenService.getGardenTypeText(type);
  }, []);

  const getDefaultGardenImage = useCallback((type: GardenType) => {
    return gardenService.getDefaultGardenImage(type);
  }, []);

  const formatDate = useCallback((dateString?: string) => {
    return gardenService.formatDate(dateString || "");
  }, []);

  // Luôn duy trì vị trí scroll khi component re-render
  useEffect(() => {
    // Scroll tới item đã chọn sau khi component render
    if (
      effectiveSelectedGardenId !== null &&
      lastSelectedIndex.current !== null
    ) {
      const selectedIndex = gardens.findIndex(
        (g) => g.id === effectiveSelectedGardenId
      );
      if (selectedIndex >= 0 && scrollViewRef.current) {
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
              x: selectedIndex * (showLargeCards ? 390 : 300),
              animated: false, // Không dùng animation để tránh nhảy
            });
          }
        }, 50); // Delay nhỏ để đảm bảo ScrollView đã render
      }
    }
  }, [gardens, effectiveSelectedGardenId, showLargeCards]);

  const renderCreateGardenCard = useCallback(() => {
    return (
      <TouchableOpacity
        style={[
          styles.gardenCard,
          styles.createGardenCard,
          { backgroundColor: theme.background, borderColor: theme.primary },
        ]}
        onPress={() => router.push("/garden/create")}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.createIconContainer,
            { backgroundColor: theme.primary + "20" },
          ]}
        >
          <Ionicons name="add" size={28} color={theme.primary} />
        </View>
        <Text style={[styles.createCardText, { color: theme.text }]}>
          Thêm vườn mới
        </Text>
      </TouchableOpacity>
    );
  }, [theme]);

  if (gardens.length === 0) {
    return (
      <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
        <Ionicons name="leaf-outline" size={48} color={theme.textSecondary} />
        <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
          Bạn chưa có vườn nào. Hãy tạo vườn mới để bắt đầu!
        </Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: theme.primary }]}
          onPress={() => router.push("/garden/create")}
        >
          <Text style={[styles.createButtonText, { color: "#FFFFFF" }]}>
            Tạo vườn mới
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, getAnimatedStyle()]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Vườn của bạn
        </Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push("/gardens")}
        >
          <Text style={[styles.viewAllText, { color: theme.primary }]}>
            Xem tất cả
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        snapToInterval={showLargeCards ? 390 : 300}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          // Lưu lại vị trí scroll hiện tại để duy trì khi re-render
          const offsetX = e.nativeEvent.contentOffset.x;
          const index = Math.round(offsetX / (showLargeCards ? 390 : 300));
          lastSelectedIndex.current = index;
        }}
      >
        {gardens.map((garden) => (
          <GardenCard
            key={`garden-${garden.id}-${garden.name}`}
            garden={garden}
            index={gardens.indexOf(garden)}
            isSelected={garden.id === selectedGardenId}
            onSelect={handleSelectGarden}
            onShowAdvice={onShowAdvice}
            onShowWeatherDetail={onShowWeatherDetail}
            onShowAlertDetails={onShowAlertDetails}
            gardenSensorData={sensorDataByGarden[garden.id] || {}}
            gardenWeather={weatherDataByGarden[garden.id] || null}
            getSensorStatus={getSensorStatus}
            theme={theme}
            showLargeCards={showLargeCards}
            getGardenIcon={getGardenIcon}
            getGardenTypeText={getGardenTypeText}
            getDefaultGardenImage={getDefaultGardenImage}
            formatDate={formatDate}
            adviceLoading={adviceLoading[garden.id]}
            weatherLoading={weatherDetailLoading[garden.id]}
          />
        ))}
        <View key="create-garden-card">{renderCreateGardenCard()}</View>
      </ScrollView>
    </Animated.View>
  );
});

export default GardenDisplay;

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginRight: 2,
  },
  scrollView: {
    paddingLeft: 20,
  },
  scrollViewContent: {
    paddingRight: 20,
    gap: 10,
  },
  gardenCard: {
    width: 325,
    height: 580,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 0,
    backgroundColor: "#fff",
  },
  largeGardenCard: {
    width: 390,
    height: 620,
  },
  imageContainer: {
    height: 165,
    width: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  imageGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    zIndex: 1,
  },
  gardenImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gardenNameContainer: {
    position: "absolute",
    bottom: 8,
    left: 10,
    right: 10,
    zIndex: 2,
  },
  gardenImageName: {
    fontSize: 20,
    fontFamily: "Inter-SemiBold",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  gardenImageType: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  gardenTypeIconContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 6,
    borderRadius: 12,
    zIndex: 2,
  },
  alertBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    backgroundColor: "rgba(255, 87, 51, 0.8)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
    gap: 4,
  },
  alertBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
  gardenInfo: {
    padding: 16,
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 5,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "31%",
    backgroundColor: "rgba(0,0,0,0.03)",
    padding: 8,
    borderRadius: 8,
  },
  statIcon: {
    marginRight: 4,
  },
  statTextContainer: {
    flexDirection: "column",
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Inter-Regular",
    color: "rgba(0,0,0,0.5)",
  },
  statValue: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
  },
  harvestProgressContainer: {
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: "rgba(0,0,0,0.02)",
    padding: 8,
    borderRadius: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  progressTitle: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "rgba(0,0,0,0.7)",
  },
  daysRemaining: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    color: "rgba(0,0,0,0.8)",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    width: "100%",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  metaInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
    marginTop: 6,
  },
  metaInfoText: {
    fontSize: 11,
    fontFamily: "Inter-Regular",
    flex: 1,
  },
  plantInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.02)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginVertical: 6,
    gap: 4,
  },
  plantInfoText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 3,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  descriptionText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    fontStyle: "italic",
    lineHeight: 16,
  },
  actionButtonsContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  pinButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 2,
  },
  weatherBadge: {
    position: "absolute",
    right: 8,
    bottom: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    zIndex: 2,
  },
  weatherTemp: {
    color: "#FFF",
    fontSize: 12,
    fontFamily: "Inter-Bold",
  },
  createGardenCard: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    height: 480,
    width: 280,
  },
  createIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  createCardText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
    padding: 40,
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#FFFFFF",
  },
  weatherInfoContainer: {
    marginVertical: 6,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 8,
  },
  weatherInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 3,
  },
});
