import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WeatherDisplay from "@/components/common/WeatherDisplay";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { WeatherObservation, HourlyForecast, DailyForecast } from "@/types";
import { getValidIconName } from "@/utils/iconUtils";

interface WeatherModalProps {
  visible: boolean;
  onClose: () => void;
  currentWeather?: WeatherObservation;
  hourlyForecast?: HourlyForecast[];
  dailyForecast?: DailyForecast[];
}

const WeatherModal: React.FC<WeatherModalProps> = ({
  visible,
  onClose,
  currentWeather,
  hourlyForecast,
  dailyForecast,
}) => {
  const theme = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Thông tin thời tiết
            </Text>
            <TouchableOpacity
              onPress={onClose}
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
                <Text
                  style={[styles.noDataText, { color: theme.textSecondary }]}
                >
                  Đang tải dữ liệu thời tiết...
                </Text>
              </View>
            )}

            {/* Hourly forecast */}
            {hourlyForecast && hourlyForecast.length > 0 && (
              <View style={styles.forecastSection}>
                <Text
                  style={[styles.forecastSectionTitle, { color: theme.text }]}
                >
                  Dự báo theo giờ
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.hourlyForecastScroll}
                >
                  {hourlyForecast.slice(0, 24).map((hour, index: number) => (
                    <View
                      key={`hourly-${index}`}
                      style={[
                        styles.hourlyForecastItem,
                        { backgroundColor: theme.cardAlt },
                      ]}
                    >
                      <Text
                        style={[
                          styles.hourTime,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {new Date(hour.forecastedAt).getHours()}:00
                      </Text>
                      <Ionicons
                        name={getValidIconName(hour.iconCode)}
                        size={24}
                        color={theme.primary}
                      />
                      <Text style={[styles.hourTemp, { color: theme.text }]}>
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
                <Text
                  style={[styles.forecastSectionTitle, { color: theme.text }]}
                >
                  Dự báo 7 ngày
                </Text>
                {dailyForecast.map((day, index: number) => (
                  <View
                    key={`daily-${index}`}
                    style={[
                      styles.dailyForecastItem,
                      { borderBottomColor: theme.borderLight },
                    ]}
                  >
                    <Text style={[styles.dayName, { color: theme.text }]}>
                      {new Date(day.forecastedAt).toLocaleDateString("vi", {
                        weekday: "short",
                      })}
                    </Text>
                    <View style={styles.dayIconContainer}>
                      <Ionicons
                        name={getValidIconName(day.iconCode)}
                        size={24}
                        color={theme.primary}
                      />
                    </View>
                    <View style={styles.tempRangeContainer}>
                      <Text style={[styles.tempRange, { color: theme.text }]}>
                        {Math.round(day.tempMin)}° - {Math.round(day.tempMax)}
                        °C
                      </Text>
                    </View>
                    <Text style={[styles.rainChance, { color: theme.primary }]}>
                      {Math.round(day.pop * 100)}%
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.modalCloseButton,
              { backgroundColor: theme.primary },
            ]}
            onPress={onClose}
            accessible={true}
            accessibilityLabel="Đóng"
            accessibilityRole="button"
          >
            <Text style={[styles.modalCloseButtonText, { color: theme.card }]}>
              Đóng
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000000",
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
    borderBottomColor: "#E5E5E5",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
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
    borderRadius: 8,
    marginVertical: 16,
    width: "80%",
  },
  modalCloseButtonText: {
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
  noDataText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    textAlign: "center",
    marginTop: 10,
  },
  forecastSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  forecastSectionTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
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
    borderRadius: 12,
    minWidth: 60,
  },
  hourTime: {
    fontSize: 13,
    fontFamily: "Inter-Medium",
    marginBottom: 6,
  },
  hourTemp: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    marginTop: 6,
  },
  dailyForecastItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dayName: {
    width: 50,
    fontSize: 14,
    fontFamily: "Inter-Medium",
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
  },
  rainChance: {
    fontSize: 13,
    fontFamily: "Inter-Medium",
    marginLeft: 8,
  },
});

export default WeatherModal;
