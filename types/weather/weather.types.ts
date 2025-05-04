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
