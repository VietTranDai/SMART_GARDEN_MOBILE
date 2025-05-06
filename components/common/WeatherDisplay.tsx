import React, { useMemo, ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  ScrollView,
  Platform,
} from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";
import useSectionAnimation from "@/hooks/useSectionAnimation";
import {
  WeatherObservation,
  HourlyForecast,
  DailyForecast,
  WeatherMain,
  GardenType,
} from "@/types";
import { GardenDisplay } from "@/hooks/useHomeData";

interface WeatherDisplayProps {
  currentWeather: WeatherObservation | null;
  selectedGarden?: GardenDisplay;
  hourlyForecast?: HourlyForecast[];
  dailyForecast?: DailyForecast[];
  getWeatherTip?: (
    weather: WeatherObservation,
    gardenType?: GardenType
  ) => string;
  showFullDetails?: boolean;
  isCompact?: boolean;
}

export default function WeatherDisplay({
  currentWeather,
  selectedGarden,
  hourlyForecast = [],
  dailyForecast = [],
  getWeatherTip,
  showFullDetails = false,
  isCompact = false,
}: WeatherDisplayProps) {
  const theme = useAppTheme();
  const { getAnimatedStyle } = useSectionAnimation("weather");

  if (!currentWeather) return null;

  // Determine background color based on weather condition
  const getWeatherBackgroundColor = () => {
    switch (currentWeather.weatherMain) {
      case "CLEAR":
        return "#4da0ff";
      case "CLOUDS":
        return "#b8c3d2";
      case "RAIN":
      case "DRIZZLE":
        return "#778899";
      case "THUNDERSTORM":
        return "#6c7689";
      case "SNOW":
        return "#e3e3e3";
      case "ATMOSPHERE":
        return "#c7c5c5";
      default:
        return "#4da0ff";
    }
  };

  const getWeatherIcon = (iconCode: string, size = "4x") =>
    `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;

  const capitalizeFirstLetter = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // Format time to hour:minute
  const formatTime = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getFormattedWeatherDesc = () => {
    return capitalizeFirstLetter(currentWeather.weatherDesc);
  };

  const getWindDirection = (deg: number) => {
    const dirs = [
      "B",
      "BĐB",
      "ĐB",
      "ĐĐB",
      "Đ",
      "ĐĐN",
      "ĐN",
      "NĐN",
      "N",
      "NTN",
      "TN",
      "TNN",
      "T",
      "TBB",
      "TB",
      "NTB",
    ];
    return dirs[Math.round(deg / 22.5) % 16];
  };

  const formatDay = (iso: string) =>
    new Date(iso).toLocaleDateString("vi-VN", {
      weekday: "short",
      month: "numeric",
      day: "numeric",
    });

  // Get precipitation probability text
  const getPrecipitationText = () => {
    if (
      currentWeather.weatherMain === "RAIN" ||
      currentWeather.weatherMain === "DRIZZLE" ||
      currentWeather.weatherMain === "THUNDERSTORM"
    ) {
      if (currentWeather.rain1h) {
        return `${currentWeather.rain1h} mm mưa`;
      }
      return "Có mưa";
    }
    return `${currentWeather.humidity}% độ ẩm`;
  };

  // Get icon for weather main
  const getWeatherStateIcon = () => {
    switch (currentWeather.weatherMain) {
      case "CLEAR":
        return "sunny-outline";
      case "CLOUDS":
        return "cloud-outline";
      case "RAIN":
      case "DRIZZLE":
        return "rainy-outline";
      case "THUNDERSTORM":
        return "thunderstorm-outline";
      case "SNOW":
        return "snow-outline";
      case "ATMOSPHERE":
        return "water-outline";
      default:
        return "cloud-outline";
    }
  };

  const tip =
    getWeatherTip?.(currentWeather, selectedGarden?.type as GardenType) || "";

  const backgroundColor = getWeatherBackgroundColor();

  if (showFullDetails) {
    return (
      <View style={[styles.container, { backgroundColor: theme.card }]}>
        {/* --- Hiện tại --- */}
        <View style={styles.currentWeatherContainer}>
          <View style={styles.mainWeatherInfo}>
            <Image
              source={{ uri: getWeatherIcon(currentWeather.iconCode, "") }}
              style={styles.weatherIcon}
            />
            <View style={styles.tempContainer}>
              <Text style={[styles.temperature, { color: theme.text }]}>
                {Math.round(currentWeather.temp)}°C
              </Text>
              <Text style={[styles.feelsLike, { color: theme.textSecondary }]}>
                Cảm giác như {Math.round(currentWeather.feelsLike)}°C
              </Text>
            </View>
          </View>

          <Text style={[styles.weatherDescription, { color: theme.text }]}>
            {getFormattedWeatherDesc()}
          </Text>

          <View style={styles.weatherDetailsContainer}>
            <View style={styles.weatherDetailItem}>
              <FontAwesome5 name="wind" size={16} color={theme.primary} />
              <Text
                style={[
                  styles.weatherDetailValue,
                  { color: theme.textSecondary },
                ]}
              >
                {currentWeather.windSpeed} m/s{" "}
                {getWindDirection(currentWeather.windDeg)}
              </Text>
            </View>

            <View style={styles.weatherDetailItem}>
              <FontAwesome5 name="tint" size={16} color={theme.primary} />
              <Text
                style={[
                  styles.weatherDetailValue,
                  { color: theme.textSecondary },
                ]}
              >
                {currentWeather.humidity}%
              </Text>
            </View>

            <View style={styles.weatherDetailItem}>
              <MaterialCommunityIcons
                name="cloud-outline"
                size={16}
                color={theme.primary}
              />
              <Text
                style={[
                  styles.weatherDetailValue,
                  { color: theme.textSecondary },
                ]}
              >
                {currentWeather.clouds}%
              </Text>
            </View>

            <View style={styles.weatherDetailItem}>
              <FontAwesome5
                name="compress-arrows-alt"
                size={16}
                color={theme.primary}
              />
              <Text
                style={[
                  styles.weatherDetailValue,
                  { color: theme.textSecondary },
                ]}
              >
                {currentWeather.pressure} hPa
              </Text>
            </View>
          </View>
        </View>

        {/* --- Dự báo hàng giờ --- */}
        {hourlyForecast && hourlyForecast.length > 0 && (
          <View style={styles.forecastSection}>
            <Text style={[styles.forecastTitle, { color: theme.text }]}>
              Dự báo hàng giờ
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {hourlyForecast.map((item, idx) => (
                <View
                  key={idx}
                  style={[styles.hourlyItem, { borderColor: theme.border }]}
                >
                  <Text style={[styles.hourlyTime, { color: theme.text }]}>
                    {formatTime(item.forecastFor)}
                  </Text>
                  <Image
                    source={{ uri: getWeatherIcon(item.iconCode, "") }}
                    style={styles.hourlyIcon}
                  />
                  <Text style={[styles.hourlyTemp, { color: theme.text }]}>
                    {Math.round(item.temp)}°C
                  </Text>
                  <View style={styles.precipContainer}>
                    <FontAwesome5 name="tint" size={12} color={theme.primary} />
                    <Text
                      style={[
                        styles.precipChance,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {Math.round(item.pop * 100)}%
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* --- Dự báo 5 ngày --- */}
        {dailyForecast && dailyForecast.length > 0 && (
          <View style={styles.forecastSection}>
            <Text style={[styles.forecastTitle, { color: theme.text }]}>
              Dự báo 5 ngày
            </Text>
            <View style={styles.dailyForecastContainer}>
              {dailyForecast.map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dailyItem,
                    {
                      borderBottomColor:
                        idx < dailyForecast.length - 1
                          ? theme.divider
                          : "transparent",
                    },
                  ]}
                >
                  <Text style={[styles.dayName, { color: theme.text }]}>
                    {formatDay(item.forecastFor)}
                  </Text>
                  <Image
                    source={{ uri: getWeatherIcon(item.iconCode, "") }}
                    style={styles.dailyIcon}
                  />
                  <Text
                    style={[styles.dailyDesc, { color: theme.textSecondary }]}
                  >
                    {item.weatherDesc.charAt(0).toUpperCase() +
                      item.weatherDesc.slice(1)}
                  </Text>
                  <View style={styles.precipContainer}>
                    <FontAwesome5 name="tint" size={12} color={theme.primary} />
                    <Text
                      style={[
                        styles.precipChance,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {Math.round(item.pop * 100)}%
                    </Text>
                  </View>
                  <Text style={[styles.dailyTemp, { color: theme.text }]}>
                    {Math.round(item.tempDay)}°C
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, getAnimatedStyle()]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Thời tiết
        </Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push("/weather")}
        >
          <Text style={[styles.viewAllText, { color: theme.primary }]}>
            Xem chi tiết
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.weatherContainer}>
        <View style={[styles.weatherContent, { backgroundColor }]}>
          <View style={styles.weatherLayout}>
            <View style={styles.currentWeather}>
              <Ionicons
                name={getWeatherStateIcon() as any}
                size={16}
                color="#FFFFFF"
                style={styles.weatherStateIcon}
              />
              <Image
                source={{ uri: getWeatherIcon(currentWeather.iconCode) }}
                style={styles.weatherIcon}
              />
              <Text style={[styles.temperature, { color: "#FFFFFF" }]}>
                {Math.round(currentWeather.temp)}°C
              </Text>
              <Text style={[styles.weatherDesc, { color: "#FFFFFF" }]}>
                {getFormattedWeatherDesc()}
              </Text>
              {selectedGarden && (
                <View style={styles.locationTag}>
                  <Ionicons name="location" size={12} color="#FFFFFF" />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {selectedGarden.location || selectedGarden.name}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.weatherDetails}>
              <View style={styles.detailSection}>
                <View style={styles.detailItems}>
                  <View style={styles.detailRow}>
                    <FontAwesome5 name="tint" size={12} color="#FFFFFF" />
                    <Text style={[styles.detailText, { color: "#FFFFFF" }]}>
                      {getPrecipitationText()}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <FontAwesome5
                      name="thermometer-half"
                      size={12}
                      color="#FFFFFF"
                    />
                    <Text style={[styles.detailText, { color: "#FFFFFF" }]}>
                      Cảm giác: {Math.round(currentWeather.feelsLike)}°C
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <FontAwesome5 name="wind" size={12} color="#FFFFFF" />
                    <Text style={[styles.detailText, { color: "#FFFFFF" }]}>
                      Gió: {currentWeather.windSpeed} m/s
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="eye-outline" size={14} color="#FFFFFF" />
                    <Text style={[styles.detailText, { color: "#FFFFFF" }]}>
                      Tầm nhìn: {(currentWeather.visibility / 1000).toFixed(1)}{" "}
                      km
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {tip && (
            <View style={styles.tipContainer}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  weatherContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  weatherContent: {
    borderRadius: 16,
    overflow: "hidden",
  },
  weatherLayout: {
    flexDirection: "row",
    padding: 16,
  },
  currentWeather: {
    flex: 1,
    alignItems: "center",
  },
  weatherStateIcon: {
    alignSelf: "flex-start",
    marginBottom: -10,
  },
  weatherIcon: {
    width: 80,
    height: 80,
  },
  temperature: {
    fontSize: 32,
    fontFamily: "Inter-Bold",
    marginTop: -10,
  },
  weatherDesc: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    marginTop: 4,
  },
  locationTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  locationText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Inter-Medium",
    marginLeft: 4,
  },
  weatherDetails: {
    flex: 1,
    justifyContent: "center",
  },
  detailSection: {
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.3)",
    paddingLeft: 16,
  },
  forecastTitle: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  detailItems: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
  tipContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    gap: 8,
  },
  tipIcon: {
    fontSize: 16,
  },
  tipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Inter-Regular",
    flex: 1,
  },
  // Styles for detailed weather view
  currentWeatherContainer: {
    padding: 16,
  },
  mainWeatherInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  tempContainer: {
    marginLeft: 12,
  },
  feelsLike: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  weatherDescription: {
    fontSize: 18,
    fontFamily: "Inter-Medium",
    marginTop: 4,
    marginBottom: 16,
  },
  weatherDetailsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
  weatherDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 12,
    gap: 8,
  },
  weatherDetailValue: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  forecastSection: {
    padding: 16,
    borderTopWidth: 1,
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  hourlyItem: {
    alignItems: "center",
    padding: 12,
    marginRight: 8,
    borderRadius: 12,
    borderWidth: 1,
    width: 80,
  },
  hourlyTime: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    marginBottom: 4,
  },
  hourlyIcon: {
    width: 40,
    height: 40,
  },
  hourlyTemp: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    marginVertical: 4,
  },
  precipContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  precipChance: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
  dailyForecastContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  dailyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  dayName: {
    width: "25%",
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  dailyIcon: {
    width: 40,
    height: 40,
  },
  dailyDesc: {
    width: "30%",
    fontSize: 12,
    fontFamily: "Inter-Regular",
    paddingHorizontal: 4,
  },
  dailyTemp: {
    width: "15%",
    fontSize: 14,
    fontFamily: "Inter-Bold",
    textAlign: "right",
  },
});
