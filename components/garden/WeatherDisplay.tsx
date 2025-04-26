import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Types based on Prisma schema
interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDeg: number;
  cloudiness: number;
  weatherMain: string;
  weatherDesc: string;
  iconCode: string;
  observedAt: string;
}

interface ForecastItem {
  forecastFor: string;
  temp: number;
  weatherMain: string;
  weatherDesc: string;
  iconCode: string;
  pop: number; // Probability of precipitation
}

interface WeatherDisplayProps {
  currentWeather: WeatherData;
  hourlyForecast: ForecastItem[];
  dailyForecast: ForecastItem[];
}

export default function WeatherDisplay({
  currentWeather,
  hourlyForecast,
  dailyForecast,
}: WeatherDisplayProps) {
  const theme = useAppTheme();

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getWindDirection = (degrees: number) => {
    const directions = [
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
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      month: "numeric",
      day: "numeric",
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <View style={styles.currentWeatherContainer}>
        <View style={styles.mainWeatherInfo}>
          <Image
            source={{ uri: getWeatherIcon(currentWeather.iconCode) }}
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
          {currentWeather.weatherDesc.charAt(0).toUpperCase() +
            currentWeather.weatherDesc.slice(1)}
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
              {currentWeather.cloudiness}%
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

      <View style={styles.forecastSection}>
        <Text style={[styles.forecastTitle, { color: theme.text }]}>
          Dự báo hàng giờ
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          {hourlyForecast.map((item, index) => (
            <View
              key={index}
              style={[styles.hourlyItem, { borderColor: theme.border }]}
            >
              <Text style={[styles.hourlyTime, { color: theme.text }]}>
                {formatTime(item.forecastFor)}
              </Text>
              <Image
                source={{ uri: getWeatherIcon(item.iconCode) }}
                style={styles.hourlyIcon}
              />
              <Text style={[styles.hourlyTemp, { color: theme.text }]}>
                {Math.round(item.temp)}°C
              </Text>
              <View style={styles.precipContainer}>
                <FontAwesome5 name="tint" size={12} color={theme.primary} />
                <Text
                  style={[styles.precipChance, { color: theme.textSecondary }]}
                >
                  {Math.round(item.pop * 100)}%
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.forecastSection}>
        <Text style={[styles.forecastTitle, { color: theme.text }]}>
          Dự báo 5 ngày
        </Text>
        <View style={styles.dailyForecastContainer}>
          {dailyForecast.map((item, index) => (
            <View
              key={index}
              style={[
                styles.dailyItem,
                {
                  borderBottomColor:
                    index < dailyForecast.length - 1
                      ? theme.divider
                      : "transparent",
                },
              ]}
            >
              <Text style={[styles.dayName, { color: theme.text }]}>
                {formatDay(item.forecastFor)}
              </Text>
              <View style={styles.dailyIconContainer}>
                <Image
                  source={{ uri: getWeatherIcon(item.iconCode) }}
                  style={styles.dailyIcon}
                />
              </View>
              <Text style={[styles.dailyDesc, { color: theme.textSecondary }]}>
                {item.weatherDesc.charAt(0).toUpperCase() +
                  item.weatherDesc.slice(1)}
              </Text>
              <View style={styles.precipContainer}>
                <FontAwesome5 name="tint" size={12} color={theme.primary} />
                <Text
                  style={[styles.precipChance, { color: theme.textSecondary }]}
                >
                  {Math.round(item.pop * 100)}%
                </Text>
              </View>
              <Text style={[styles.dailyTemp, { color: theme.text }]}>
                {Math.round(item.temp)}°C
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginVertical: 8,
    overflow: "hidden",
  },
  currentWeatherContainer: {
    padding: 16,
  },
  mainWeatherInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  weatherIcon: {
    width: 80,
    height: 80,
  },
  tempContainer: {
    marginLeft: 8,
  },
  temperature: {
    fontSize: 32,
    fontWeight: "bold",
  },
  feelsLike: {
    fontSize: 14,
  },
  weatherDescription: {
    fontSize: 16,
    marginVertical: 8,
    textAlign: "center",
  },
  weatherDetailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    flexWrap: "wrap",
  },
  weatherDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  weatherDetailValue: {
    fontSize: 14,
    marginLeft: 8,
  },
  forecastSection: {
    marginTop: 12,
  },
  forecastTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 16,
    marginBottom: 8,
  },
  horizontalScroll: {
    paddingLeft: 16,
  },
  hourlyItem: {
    alignItems: "center",
    marginRight: 16,
    padding: 8,
    borderWidth: 1,
    borderRadius: 12,
    width: 80,
  },
  hourlyTime: {
    fontSize: 12,
    marginBottom: 4,
  },
  hourlyIcon: {
    width: 50,
    height: 50,
  },
  hourlyTemp: {
    fontSize: 16,
    fontWeight: "bold",
  },
  precipContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  precipChance: {
    fontSize: 12,
    marginLeft: 4,
  },
  dailyForecastContainer: {
    marginHorizontal: 16,
  },
  dailyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dayName: {
    flex: 1.5,
    fontSize: 14,
  },
  dailyIconContainer: {
    flex: 0.75,
    alignItems: "center",
  },
  dailyIcon: {
    width: 40,
    height: 40,
  },
  dailyDesc: {
    flex: 2,
    fontSize: 12,
  },
  dailyTemp: {
    flex: 0.75,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },
});
