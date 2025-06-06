/**
 * Weather Types
 *
 * Type definitions for weather-related data
 */

export enum WeatherMain {
  THUNDERSTORM = "THUNDERSTORM", // Thunderstorm weather condition
  DRIZZLE = "DRIZZLE", // Drizzle weather condition
  RAIN = "RAIN", // Rain weather condition
  SNOW = "SNOW", // Snow weather condition
  ATMOSPHERE = "ATMOSPHERE", // Atmospheric conditions (e.g., fog, mist)
  CLEAR = "CLEAR", // Clear weather condition
  CLOUDS = "CLOUDS", // Cloudy weather condition
}

/**
 * Weather and Alert interfaces aligned with Prisma schema
 */
export interface WeatherObservation {
  id: number;
  gardenId: number;
  observedAt: string;
  temp: number;
  feelsLike: number;
  pressure: number;
  humidity: number;
  clouds: number;
  visibility: number;
  windSpeed: number;
  windDeg: number;
  windGust?: number;
  rain1h?: number;
  snow1h?: number;
  weatherMain: WeatherMain; // One of WeatherMain enum values
  weatherDesc: string;
  iconCode: string;
}

export interface HourlyForecast {
  id: number;
  gardenId: number;
  forecastFor: string;
  forecastedAt: string;
  temp: number;
  feelsLike: number;
  pressure: number;
  humidity: number;
  clouds: number;
  visibility: number;
  pop: number; // Probability of precipitation
  windSpeed: number;
  windDeg: number;
  windGust?: number;
  rain1h?: number;
  snow1h?: number;
  weatherMain: WeatherMain; // One of WeatherMain enum values
  weatherDesc: string;
  iconCode: string;
}

export interface DailyForecast {
  id: number;
  gardenId: number;
  forecastFor: string;
  forecastedAt: string;
  tempDay: number;
  tempMin: number;
  tempMax: number;
  tempNight: number;
  feelsLikeDay: number;
  pressure: number;
  humidity: number;
  clouds: number;
  pop: number; // Probability of precipitation
  windSpeed: number;
  windDeg: number;
  windGust?: number;
  rain?: number;
  snow?: number;
  weatherMain: WeatherMain; // One of WeatherMain enum values
  weatherDesc: string;
  iconCode: string;
}

/**
 * Weather-based advice interface for suggesting activities based on weather conditions
 */
export interface WeatherAdvice {
  id: number;
  title: string; // Short title for the advice
  description: string; // Detailed explanation
  detailedSteps?: string[]; // Optional: Detailed steps for the advice
  reasons?: string[]; // Optional: Reasons behind the advice
  tips?: string[]; // Optional: Additional tips
  personalizedMessage?: string; // Optional: Personalized message for the user
  urgencyLevel?: string; // Optional: Urgency level (e.g., HIGH, MEDIUM, LOW)
  difficultyLevel?: string; // Optional: Difficulty level (e.g., EASY, MEDIUM, HARD)
  duration?: string; // Optional: Estimated duration for the task
  frequency?: string; // Optional: Recommended frequency for the task
  weatherCondition: WeatherMain | string; // Weather condition this advice applies to (string for flexibility if backend sends new values)
  temperature?: {
    // Optional temperature range this advice applies to
    min?: number;
    max?: number;
  };
  humidity?: {
    // Optional humidity range this advice applies to
    min?: number;
    max?: number;
  };
  wind?: {
    // Optional wind conditions this advice applies to
    minSpeed?: number;
    maxSpeed?: number;
  };
  icon: string; // Icon to represent this advice
  priority: number; // Priority level, higher means more important
  bestTimeOfDay?: string; // Recommended time to perform the activity
  applicableGardenTypes?: string[]; // Garden types this advice is most relevant for
  plantTypes?: string[]; // Optional: Specific plant types this advice may apply to
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for optimal gardening time slots based on weather forecasts
 */
export interface OptimalGardenTime {
  startTime: string; // ISO timestamp for when the optimal time starts
  endTime: string; // ISO timestamp for when the optimal time ends
  activity: string; // The recommended activity (e.g., "Watering", "Fertilizing")
  reason: string; // Why this time slot is optimal
  score: number; // 0-100 score indicating how optimal this time is
  weatherCondition: WeatherMain; // Expected weather during this time
  temperature: number; // Expected temperature during this time
}

/**
 * Interface for garden weather data with all weather-related information
 */
export interface GardenWeatherData {
  current: WeatherObservation | null;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

/**
 * Interface for UI display components
 */
export interface WeatherDisplayProps {
  currentWeather: WeatherObservation | null;
  selectedGarden?: any; // Sử dụng GardenDisplay từ types/gardens khi chúng ta cập nhật
  hourlyForecast?: HourlyForecast[];
  dailyForecast?: DailyForecast[];
  getWeatherTip?: (weather: WeatherObservation, gardenType?: string) => string;
  showFullDetails?: boolean;
  isCompact?: boolean;
  onShowDetail?: () => void;
}
