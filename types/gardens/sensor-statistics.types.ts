import { SensorType } from "./sensor.types"; // Assuming SensorType is compatible

export interface SensorStatisticsDto {
  sensorId: number;
  sensorType: SensorType;
  sensorName?: string;
  startDate: string; // Keep as string to match backend query/response, convert to Date object in frontend if needed
  endDate: string; // Keep as string
  totalReadings: number;
  averageValue: number;
  minValue: number;
  maxValue: number;
  stdDeviation: number;
  firstReadingTime: string; // Keep as string
  lastReadingTime: string; // Keep as string
}

export interface DailyAggregateDto {
  date: string;
  averageValue: number;
  minValue: number;
  maxValue: number;
  readingsCount: number;
}

export interface SensorAnalyticsDto {
  sensorId: number;
  sensorType: SensorType;
  unit: string;
  dailyData: DailyAggregateDto[];
}
