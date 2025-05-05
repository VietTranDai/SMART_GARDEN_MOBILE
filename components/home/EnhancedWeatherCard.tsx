import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "@/hooks/useAppTheme";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { WeatherObservation } from "@/types/weather/weather.types";

interface EnhancedWeatherCardProps {
  weatherData: WeatherObservation;
  onPress: () => void;
}

export default function EnhancedWeatherCard({
  weatherData,
  onPress,
}: EnhancedWeatherCardProps) {
  const theme = useAppTheme();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(20)).current;

  // Animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: theme.animationTiming.medium,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: theme.animationTiming.medium,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateAnim, theme.animationTiming.medium]);

  // Animation when data changes
  useEffect(() => {
    // Only run this effect after initial mounting animation is complete
    const timer = setTimeout(() => {
      // When weather data updates, do a subtle animation
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1000); // Delay to ensure initial animation is complete

    return () => clearTimeout(timer);
  }, [weatherData, fadeAnim]);

  // Get weather background based on weather condition
  const getWeatherBackground = () => {
    const weatherMain = weatherData.weatherMain?.toLowerCase() || "";

    if (weatherMain.includes("clear")) {
      return theme.gradientPrimary;
    } else if (
      weatherMain.includes("cloud") ||
      weatherMain.includes("overcast")
    ) {
      return theme.gradientSecondary;
    } else if (
      weatherMain.includes("rain") ||
      weatherMain.includes("drizzle") ||
      weatherMain.includes("shower")
    ) {
      return ["#E3F2FD", "#BBDEFB", "#90CAF9"]; // Blue shades
    } else if (weatherMain.includes("thunder")) {
      return ["#E1F5FE", "#B3E5FC", "#81D4FA"]; // Light blue
    } else if (weatherMain.includes("snow")) {
      return ["#E8EAF6", "#C5CAE9", "#9FA8DA"]; // Indigo shades
    } else if (
      weatherMain.includes("mist") ||
      weatherMain.includes("fog") ||
      weatherMain.includes("haze")
    ) {
      return ["#ECEFF1", "#CFD8DC", "#B0BEC5"]; // Blue grey
    } else {
      return theme.gradientPrimary; // Default
    }
  };

  // Get weather icon
  const getWeatherIcon = () => {
    // If we have an iconCode from the API, use that
    if (weatherData.iconCode) {
      return (
        <Image
          source={{
            uri: `https://openweathermap.org/img/wn/${weatherData.iconCode}@2x.png`,
          }}
          style={styles.weatherIcon}
          onError={() => console.error("Failed to load weather icon")}
        />
      );
    }

    // Otherwise fall back to a default icon based on weather condition
    const weatherMain = weatherData.weatherMain?.toLowerCase() || "";

    if (weatherMain.includes("clear")) {
      return (
        <MaterialCommunityIcons
          name="weather-sunny"
          size={70}
          color="#FF9800"
        />
      );
    } else if (
      weatherMain.includes("cloud") ||
      weatherMain.includes("overcast")
    ) {
      return (
        <MaterialCommunityIcons
          name="weather-cloudy"
          size={70}
          color="#78909C"
        />
      );
    } else if (
      weatherMain.includes("rain") ||
      weatherMain.includes("drizzle") ||
      weatherMain.includes("shower")
    ) {
      return (
        <MaterialCommunityIcons
          name="weather-rainy"
          size={70}
          color="#42A5F5"
        />
      );
    } else if (weatherMain.includes("thunder")) {
      return (
        <MaterialCommunityIcons
          name="weather-lightning"
          size={70}
          color="#5C6BC0"
        />
      );
    } else if (weatherMain.includes("snow")) {
      return (
        <MaterialCommunityIcons
          name="weather-snowy"
          size={70}
          color="#90A4AE"
        />
      );
    } else if (
      weatherMain.includes("mist") ||
      weatherMain.includes("fog") ||
      weatherMain.includes("haze")
    ) {
      return (
        <MaterialCommunityIcons name="weather-fog" size={70} color="#B0BEC5" />
      );
    } else {
      return (
        <MaterialCommunityIcons
          name="weather-partly-cloudy"
          size={70}
          color="#78909C"
        />
      );
    }
  };

  // Format temperature
  const formatTemperature = (temp: number | undefined) => {
    if (temp === undefined || temp === null) return "--";
    return Math.round(temp);
  };

  // Get readable weather description
  const getWeatherDescription = () => {
    return weatherData.weatherDesc || "Không có dữ liệu";
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateAnim }],
          ...theme.elevation2,
        },
      ]}
      accessibilityLabel={`Thời tiết hiện tại: ${getWeatherDescription()}, ${formatTemperature(
        weatherData.temp
      )} độ C`}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={getWeatherBackground() as any}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerRow}>
            <Text style={styles.title}>Thời tiết hiện tại</Text>
            <TouchableOpacity
              onPress={onPress}
              style={styles.detailsButton}
              accessibilityLabel="Xem chi tiết thời tiết"
            >
              <Text style={styles.detailsText}>Chi tiết</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>{getWeatherIcon()}</View>

            <View style={styles.dataContainer}>
              <Text style={styles.temperature}>
                {formatTemperature(weatherData.temp)}°C
              </Text>

              <Text style={styles.description}>{getWeatherDescription()}</Text>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons
                    name="water-percent"
                    size={18}
                    color={theme.text}
                  />
                  <Text style={styles.detailText}>
                    {weatherData.humidity ?? "--"}%
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <MaterialCommunityIcons
                    name="weather-windy"
                    size={18}
                    color={theme.text}
                  />
                  <Text style={styles.detailText}>
                    {weatherData.windSpeed
                      ? Math.round(weatherData.windSpeed * 3.6)
                      : "--"}{" "}
                    km/h
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  touchable: {
    width: "100%",
  },
  gradient: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontFamily: "Inter-SemiBold",
    color: "#333333",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailsText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#2E7D32",
    marginRight: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 16,
  },
  weatherIcon: {
    width: 80,
    height: 80,
  },
  dataContainer: {
    flex: 1,
  },
  temperature: {
    fontSize: 36,
    fontFamily: "Inter-Bold",
    color: "#333333",
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: "#555555",
    marginBottom: 12,
    textTransform: "capitalize",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#555555",
  },
});
