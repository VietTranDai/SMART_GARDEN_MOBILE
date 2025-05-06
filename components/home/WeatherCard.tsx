import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  WeatherObservation,
  DailyForecast,
  WeatherMain,
} from "@/types/weather/weather.types";

interface WeatherCardProps {
  current: WeatherObservation;
  forecast: DailyForecast[];
}

const WEATHER_ICONS: Record<WeatherMain, string> = {
  [WeatherMain.THUNDERSTORM]: "lightning",
  [WeatherMain.DRIZZLE]: "weather-rainy",
  [WeatherMain.RAIN]: "weather-pouring",
  [WeatherMain.SNOW]: "weather-snowy",
  [WeatherMain.ATMOSPHERE]: "weather-fog",
  [WeatherMain.CLEAR]: "weather-sunny",
  [WeatherMain.CLOUDS]: "weather-cloudy",
};

export default function WeatherCard({ current, forecast }: WeatherCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString([], {
      weekday: "short",
      month: "numeric",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      {/* Current Weather */}
      <View style={styles.currentWeather}>
        <View style={styles.currentLeft}>
          <MaterialCommunityIcons
            name={WEATHER_ICONS[current.weatherMain] as any}
            size={48}
            color={theme.primary}
          />
          <View style={styles.temperatureContainer}>
            <Text style={styles.temperature}>{Math.round(current.temp)}°</Text>
            <Text style={styles.feelsLike}>
              Feels like {Math.round(current.feelsLike)}°
            </Text>
          </View>
        </View>

        <View style={styles.currentRight}>
          <Text style={styles.weatherDesc}>{current.weatherDesc}</Text>
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons
                name="water-percent"
                size={16}
                color={theme.textSecondary}
              />
              <Text style={styles.detailText}>{current.humidity}%</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons
                name="weather-windy"
                size={16}
                color={theme.textSecondary}
              />
              <Text style={styles.detailText}>{current.windSpeed} m/s</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Forecast */}
      <View style={styles.forecastContainer}>
        {forecast.slice(0, 3).map((day) => (
          <View key={day.forecastFor} style={styles.forecastDay}>
            <Text style={styles.forecastDate}>
              {formatDate(day.forecastFor)}
            </Text>
            <MaterialCommunityIcons
              name={WEATHER_ICONS[day.weatherMain] as any}
              size={24}
              color={theme.text}
            />
            <View style={styles.forecastTemp}>
              <Text style={styles.forecastTempMax}>
                {Math.round(day.tempMax)}°
              </Text>
              <Text style={styles.forecastTempMin}>
                {Math.round(day.tempMin)}°
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      margin: 16,
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    currentWeather: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    currentLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    temperatureContainer: {
      marginLeft: 12,
    },
    temperature: {
      fontSize: 32,
      fontFamily: "Inter-Bold",
      color: theme.text,
    },
    feelsLike: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    currentRight: {
      alignItems: "flex-end",
    },
    weatherDesc: {
      fontSize: 16,
      fontFamily: "Inter-Medium",
      color: theme.text,
      marginBottom: 8,
    },
    detailsContainer: {
      flexDirection: "row",
      gap: 12,
    },
    detailItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    detailText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    forecastContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
      paddingTop: 16,
    },
    forecastDay: {
      alignItems: "center",
      flex: 1,
    },
    forecastDate: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
      marginBottom: 8,
    },
    forecastTemp: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 4,
    },
    forecastTempMax: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
    },
    forecastTempMin: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
  });
