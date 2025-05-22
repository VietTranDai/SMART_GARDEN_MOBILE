import { useState } from "react";
import {
  WeatherObservation,
  HourlyForecast,
  DailyForecast,
} from "@/types/weather/weather.types";

interface UseGardenWeatherReturn {
  weatherModalVisible: boolean;
  currentWeather?: WeatherObservation;
  hourlyForecast?: HourlyForecast[];
  dailyForecast?: DailyForecast[];
  showWeatherModal: () => void;
  closeWeatherModal: () => void;
  setWeatherData: (data: {
    currentWeather?: WeatherObservation;
    hourlyForecast?: HourlyForecast[];
    dailyForecast?: DailyForecast[];
  }) => void;
}

export const useGardenWeather = (): UseGardenWeatherReturn => {
  const [weatherModalVisible, setWeatherModalVisible] =
    useState<boolean>(false);
  const [currentWeather, setCurrentWeather] = useState<
    WeatherObservation | undefined
  >(undefined);
  const [hourlyForecast, setHourlyForecast] = useState<
    HourlyForecast[] | undefined
  >(undefined);
  const [dailyForecast, setDailyForecast] = useState<
    DailyForecast[] | undefined
  >(undefined);

  const showWeatherModal = () => {
    setWeatherModalVisible(true);
  };

  const closeWeatherModal = () => {
    setWeatherModalVisible(false);
  };

  const setWeatherData = (data: {
    currentWeather?: WeatherObservation;
    hourlyForecast?: HourlyForecast[];
    dailyForecast?: DailyForecast[];
  }) => {
    if (data.currentWeather) setCurrentWeather(data.currentWeather);
    if (data.hourlyForecast) setHourlyForecast(data.hourlyForecast);
    if (data.dailyForecast) setDailyForecast(data.dailyForecast);
  };

  return {
    weatherModalVisible,
    currentWeather,
    hourlyForecast,
    dailyForecast,
    showWeatherModal,
    closeWeatherModal,
    setWeatherData,
  };
};
