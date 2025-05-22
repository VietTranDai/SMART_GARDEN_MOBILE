import {
  AlertStatus,
  Garden,
  GardenStatus,
  TaskStatus,
  GardenPhoto,
  GardenPlantDetails,
  Alert,
  WateringSchedule,
  SensorHistory,
  ActivityDisplay,
} from "@/types";
import { SensorType } from "@/types/gardens/sensor.types";
import { UISensor } from "@/components/garden/GardenSensorSection";

export enum DetailSectionType {
  STATUS = "STATUS",
  WEATHER = "WEATHER",
  ALERTS = "ALERTS",
  SCHEDULE = "SCHEDULE",
  SENSORS = "SENSORS",
  ACTIVITY = "ACTIVITY",
  ACTIONS = "ACTIONS",
  PLANT_DETAILS = "PLANT_DETAILS",
  PHOTOS = "PHOTOS",
}

// Type definitions for section data
export interface GardenStatusData {
  garden: Garden;
}

export interface PlantDetailsData {
  plantDetails: GardenPlantDetails;
}

export interface AlertsData {
  alerts: Alert[];
}

export interface ScheduleData {
  schedules: WateringSchedule[];
}

export interface SensorsData {
  sensors: UISensor[];
  sensorHistories: Record<string, SensorHistory>;
  currentGrowthStage?: string;
  isSensorDataLoading: boolean;
  isRefreshing: boolean;
  lastSensorUpdate?: string;
}

export interface PhotosData {
  photos: GardenPhoto[];
  gardenId: string | number;
}

export interface ActivityData {
  activities: ActivityDisplay[];
}

export interface ActionsData {
  gardenId: string | number;
}

// Union type for all section data types
export type SectionData =
  | GardenStatusData
  | PlantDetailsData
  | AlertsData
  | ScheduleData
  | SensorsData
  | PhotosData
  | ActivityData
  | ActionsData;

export interface DetailSection {
  type: DetailSectionType;
  key: string;
  data: SectionData[];
}

// Type guards
export const isGardenStatusData = (
  data: SectionData
): data is GardenStatusData => "garden" in data;

export const isSensorsData = (data: SectionData): data is SensorsData =>
  "sensors" in data && "sensorHistories" in data;

export const isPhotosData = (data: SectionData): data is PhotosData =>
  "photos" in data && "gardenId" in data;

export const isActionsData = (data: SectionData): data is ActionsData =>
  "gardenId" in data && !("photos" in data);

export const isAlertsData = (data: SectionData): data is AlertsData =>
  "alerts" in data;

export const isScheduleData = (data: SectionData): data is ScheduleData =>
  "schedules" in data;

export const isActivityData = (data: SectionData): data is ActivityData =>
  "activities" in data;

export const isPlantDetailsData = (
  data: SectionData
): data is PlantDetailsData => "plantDetails" in data;

// Helper functions
export const getStatusColor = (
  status: TaskStatus | AlertStatus | GardenStatus | string,
  theme: Record<string, any>
): string => {
  switch (status) {
    case TaskStatus.COMPLETED:
    case AlertStatus.RESOLVED:
    case GardenStatus.ACTIVE:
      return theme.success;
    case TaskStatus.SKIPPED:
    case AlertStatus.IGNORED:
      return theme.warning;
    case GardenStatus.INACTIVE:
      return theme.textTertiary;
    case TaskStatus.PENDING:
    case AlertStatus.PENDING:
    case AlertStatus.IN_PROGRESS:
    case AlertStatus.ESCALATED:
      return theme.primary;
    default:
      return theme.textSecondary;
  }
};

export const getStatusText = (
  status: TaskStatus | AlertStatus | GardenStatus | string
): string => {
  switch (status) {
    case TaskStatus.PENDING:
      return "Chờ xử lý";
    case TaskStatus.COMPLETED:
      return "Hoàn thành";
    case TaskStatus.SKIPPED:
      return "Đã bỏ qua";
    case AlertStatus.PENDING:
      return "Mới";
    case AlertStatus.RESOLVED:
      return "Đã xử lý";
    case AlertStatus.IGNORED:
      return "Đã bỏ qua";
    case AlertStatus.IN_PROGRESS:
      return "Đang xử lý";
    case AlertStatus.ESCALATED:
      return "Đã chuyển cấp";
    case GardenStatus.ACTIVE:
      return "Hoạt động";
    case GardenStatus.INACTIVE:
      return "Ngừng";
    default:
      return String(status);
  }
};
