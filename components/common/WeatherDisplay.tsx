import React, { memo, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import Gradient from "@/components/ui/Gradient";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  WeatherObservation,
  HourlyForecast,
  DailyForecast,
  WeatherDisplayProps,
} from "@/types/weather/weather.types";
import { weatherService } from "@/service/api";

/**
 * A component to display current weather and forecast information
 */
const WeatherDisplay = memo(
  ({
    currentWeather,
    selectedGarden,
    hourlyForecast = [],
    dailyForecast = [],
    getWeatherTip,
    showFullDetails = false,
    onShowDetail,
    isCompact = false,
  }: WeatherDisplayProps) => {
    const theme = useAppTheme();

    // Memoize styles to prevent recreation on re-renders
    const styles = useMemo(() => makeStyles(theme), [theme]);

    if (!currentWeather) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Không có dữ liệu thời tiết
          </Text>
        </View>
      );
    }

    // Get background colors based on weather condition
    const [gradientStart, gradientEnd] =
      weatherService.getWeatherBackgroundColor(currentWeather.weatherMain);

    // Get weather icon URL
    const weatherIconUrl = weatherService.getWeatherIcon(
      currentWeather.iconCode
    );

    // Format weather display data
    const formattedTime = weatherService.formatTime(currentWeather.observedAt);
    const windDirection = weatherService.getWindDirection(
      currentWeather.windDeg
    );

    // Get weather tip - use prop function if provided, otherwise use service function
    const tip = getWeatherTip
      ? getWeatherTip(currentWeather, selectedGarden?.type)
      : weatherService.getWeatherTip(currentWeather, selectedGarden?.type);

    // If compact mode is enabled, show simplified view
    if (isCompact) {
      return (
        <View style={styles.compactContainer}>
          <View style={styles.compactContent}>
            <View style={styles.compactMainInfo}>
              <Text style={[styles.compactTemp, { color: theme.text }]}>
                {Math.round(currentWeather.temp)}°
              </Text>
              <Text
                style={[styles.compactLocation, { color: theme.textSecondary }]}
              >
                {selectedGarden?.name || ""}
              </Text>
            </View>
            <View style={styles.compactWeatherInfo}>
              {currentWeather.iconCode && (
                <Image
                  source={{ uri: weatherIconUrl }}
                  style={styles.compactWeatherIcon}
                />
              )}
              <Text
                style={[styles.compactDescription, { color: theme.text }]}
                numberOfLines={1}
              >
                {currentWeather.weatherDesc.charAt(0).toUpperCase() +
                  currentWeather.weatherDesc.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Gradient
          colors={[gradientStart, gradientEnd]}
          style={styles.cardContent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.weatherHeader}>
            <View style={styles.locationContainer}>
              {selectedGarden ? (
                <Text style={styles.location}>{selectedGarden.name}</Text>
              ) : (
                <Text style={styles.location}>Thời tiết hiện tại</Text>
              )}
              <Text style={styles.weatherTime}>{formattedTime}</Text>
            </View>
            <Image
              source={{ uri: weatherIconUrl }}
              style={styles.weatherIcon}
            />
          </View>

          <View style={styles.weatherBody}>
            <Text style={styles.temperature}>
              {Math.round(currentWeather.temp)}°C
            </Text>
            <Text style={styles.weatherDesc}>
              {currentWeather.weatherDesc.charAt(0).toUpperCase() +
                currentWeather.weatherDesc.slice(1)}
            </Text>
            <Text style={styles.feelsLike}>
              Cảm giác như {Math.round(currentWeather.feelsLike)}°C
            </Text>
          </View>

          <View style={styles.weatherDetails}>
            <View style={styles.detailItem}>
              <FontAwesome5 name="tint" size={18} color="#fff" />
              <Text style={styles.detailText}>
                {currentWeather.humidity}% độ ẩm
              </Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <FontAwesome5 name="wind" size={18} color="#fff" />
              <Text style={styles.detailText}>
                {currentWeather.windSpeed} m/s {windDirection}
              </Text>
            </View>
          </View>

          {!isCompact &&
            Array.isArray(hourlyForecast) &&
            hourlyForecast.length > 0 && (
              <View style={styles.forecastSection}>
                <Text style={styles.forecastTitle}>Dự báo 24 giờ tới</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalScroll}
                >
                  {(() => {
                    try {
                      // Ensure we have a valid array with a safe length
                      const safeHourlyData = Array.isArray(hourlyForecast)
                        ? hourlyForecast.slice(0, 24)
                        : [];

                      // Map over the safe array with item validation
                      return safeHourlyData.map((item, index) => {
                        if (!item || typeof item !== "object") return null;

                        return (
                          <View key={`hourly-${index}`} style={styles.hourItem}>
                            <Text style={styles.hourText}>
                              {weatherService.formatTime(item.forecastFor)}
                            </Text>
                            <Image
                              source={{
                                uri: weatherService.getWeatherIcon(
                                  item.iconCode
                                ),
                              }}
                              style={styles.smallIcon}
                            />
                            <Text style={styles.hourTemp}>
                              {Math.round(item.temp)}°
                            </Text>
                            <View style={styles.precipContainer}>
                              <FontAwesome5
                                name="tint"
                                size={12}
                                color="#fff"
                              />
                              <Text style={styles.precipChance}>
                                {Math.round((item.pop || 0) * 100)}%
                              </Text>
                            </View>
                          </View>
                        );
                      });
                    } catch (error) {
                      console.error("Error rendering hourly forecast:", error);
                      return null;
                    }
                  })()}
                </ScrollView>
              </View>
            )}

          {tip && (
            <View style={styles.tipContainer}>
              <Ionicons name="bulb-outline" size={20} color="#fff" />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          )}
        </Gradient>
      </View>
    );
  }
);

// Memoized styles creation
const makeStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      margin: 8,
      borderRadius: 20,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "#1a7a30", // Dark green border
    },
    cardContent: {
      padding: 16,
      borderRadius: 20,
    },
    weatherHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    locationContainer: {
      flex: 1,
    },
    location: {
      color: "#fff",
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      marginBottom: 2,
    },
    weatherTime: {
      color: "rgba(255,255,255,0.7)",
      fontSize: 12,
      fontFamily: "Inter-Regular",
    },
    weatherIcon: {
      width: 60,
      height: 60,
    },
    weatherBody: {
      alignItems: "flex-start",
      marginTop: 8,
      marginBottom: 16,
    },
    temperature: {
      color: "#fff",
      fontSize: 48,
      fontFamily: "Inter-Bold",
    },
    weatherDesc: {
      color: "#fff",
      fontSize: 14,
      fontFamily: "Inter-Medium",
      marginTop: 4,
    },
    feelsLike: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 12,
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    weatherDetails: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: "rgba(255,255,255,0.2)",
      paddingTop: 12,
      marginTop: 4,
    },
    detailItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    detailText: {
      color: "#fff",
      fontSize: 12,
      fontFamily: "Inter-Medium",
      marginLeft: 4,
    },
    detailDivider: {
      width: 1,
      height: 16,
      backgroundColor: "rgba(255,255,255,0.2)",
    },
    forecastSection: {
      marginTop: 16,
      borderTopWidth: 1,
      borderTopColor: "rgba(255,255,255,0.2)",
      paddingTop: 12,
    },
    forecastTitle: {
      color: "#fff",
      fontSize: 14,
      fontFamily: "Inter-Medium",
      marginBottom: 8,
    },
    horizontalScroll: {
      marginHorizontal: -8,
    },
    hourItem: {
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 10,
      padding: 12,
      marginHorizontal: 4,
      width: 100,
    },
    hourText: {
      color: "#fff",
      fontSize: 12,
      fontFamily: "Inter-Regular",
    },
    hourTemp: {
      color: "#fff",
      fontSize: 16,
      fontFamily: "Inter-Bold",
      marginTop: 4,
    },
    smallIcon: {
      width: 32,
      height: 32,
      marginVertical: 4,
    },
    precipContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },
    precipChance: {
      color: "#fff",
      fontSize: 12,
      fontFamily: "Inter-Regular",
      marginLeft: 4,
    },
    tipContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
      backgroundColor: "rgba(255,255,255,0.1)",
      padding: 12,
      borderRadius: 10,
    },
    tipText: {
      color: "#fff",
      fontSize: 13,
      fontFamily: "Inter-Regular",
      marginLeft: 6,
      flex: 1,
    },
    showDetailButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 16,
      padding: 10,
      backgroundColor: "rgba(255,255,255,0.25)",
      borderRadius: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    showDetailText: {
      color: "#fff",
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      marginRight: 4,
    },
    // Compact mode styles
    compactContainer: {
      backgroundColor: "transparent",
    },
    compactContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    compactMainInfo: {
      flex: 1,
    },
    compactTemp: {
      fontSize: 36,
      fontFamily: "Inter-Bold",
    },
    compactLocation: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
    },
    compactWeatherInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    compactWeatherIcon: {
      width: 50,
      height: 50,
    },
    compactDescription: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
    },
    emptyContainer: {
      padding: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      textAlign: "center",
    },
  });

export default WeatherDisplay;
