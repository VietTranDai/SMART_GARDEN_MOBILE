import {TaskStatus} from "@/types";

export interface WateringScheduleItem {
    id: number;
    gardenId: number;
    scheduledAt: string;
    amount: number; // in Liters
    status: TaskStatus;
    createdAt: string;
    updatedAt: string;
}