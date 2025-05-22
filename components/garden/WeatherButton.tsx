import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getValidIconName } from "@/utils/iconUtils";
import { WeatherObservation } from "@/types";

// Define local interface instead of importing from @/types
// interface WeatherData {
//   iconCode?: string;
//   temp: number;
//   description?: string;
//   humidity?: number;
//   windSpeed?: number;
// }

interface WeatherButtonProps {
  currentWeather?: WeatherObservation;
  onPress: () => void;
}

const WeatherButton: React.FC<WeatherButtonProps> = ({
  currentWeather,
  onPress,
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.weatherButtonContainer}>
      <TouchableOpacity
        style={[
          styles.weatherButton,
          {
            backgroundColor: theme.cardAlt,
            borderColor: theme.borderLight,
          },
        ]}
        onPress={onPress}
        accessible={true}
        accessibilityLabel="Xem thông tin thời tiết"
        accessibilityHint="Nhấn để xem dự báo thời tiết chi tiết"
        accessibilityRole="button"
      >
        <Ionicons
          name={getValidIconName(currentWeather?.iconCode)}
          size={22}
          color={theme.primary}
        />
        {currentWeather ? (
          <Text style={[styles.weatherButtonTemp, { color: theme.primary }]}>
            {Math.round(currentWeather.temp)}°C
          </Text>
        ) : (
          <Text style={[styles.weatherButtonText, { color: theme.primary }]}>
            Thời tiết
          </Text>
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

const styles = StyleSheet.create({
  weatherButtonContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 5,
  },
  weatherButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
  },
  weatherButtonTemp: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
  },
  weatherButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
});

export default WeatherButton;
