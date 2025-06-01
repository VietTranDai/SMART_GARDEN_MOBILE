import { ActivityType } from "@/types/activities/activity.types";
import { GardenActivityDto } from "@/types/activities/dtos";
import { ACTIVITY_TYPE_TRANSLATIONS } from "../types";

export const getFormattedDateParts = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  
  const timeOptions: Intl.DateTimeFormatOptions = { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  };
  const time = date.toLocaleTimeString('vi-VN', timeOptions);
  
  let dateLabel = '';
  const isToday = date.toDateString() === now.toDateString();
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    dateLabel = `Hôm nay`;
  } else if (isYesterday) {
    dateLabel = `Hôm qua`;
  } else {
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    dateLabel = date.toLocaleDateString('vi-VN', dateOptions);
  }
  
  return { dateHeader: dateLabel, timeDisplay: time, fullDateTime: `${dateLabel}, ${time}` };
};

export const getActivityIcon = (type: string) => {
  switch (type) {
    case ActivityType.WATERING:
      return 'water-outline';
    case ActivityType.FERTILIZING:
      return 'leaf-outline';
    case ActivityType.PRUNING:
      return 'cut-outline';
    case ActivityType.HARVESTING:
      return 'basket-outline';
    case ActivityType.PEST_CONTROL:
      return 'bug-outline';
    case ActivityType.PLANTING:
      return 'trending-up-outline';
    case ActivityType.WEEDING:
      return 'remove-circle-outline';
    case ActivityType.SOIL_TESTING:
      return 'flask-outline';
    default:
      return 'clipboard-outline';
  }
};

export const formatPercentage = (value: number) => {
  return `${Math.round(value)}%`;
};

export const formatNumber = (value: number) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toString();
};

export const groupActivitiesByDate = (activities: GardenActivityDto[]) => {
  if (!activities || activities.length === 0) {
    return [];
  }

  const groupedByDate = activities.reduce<Record<string, GardenActivityDto[]>>((acc, activity) => {
    const { dateHeader } = getFormattedDateParts(activity.timestamp);
    if (!acc[dateHeader]) {
      acc[dateHeader] = [];
    }
    acc[dateHeader].push(activity);
    return acc;
  }, {});

  // Sort activities within same date by time descending
  Object.keys(groupedByDate).forEach(date => {
    groupedByDate[date].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  });

  // Create sections array and sort by date descending
  const sections = Object.keys(groupedByDate).map(date => {
    let sortDate = new Date();
    if (date === 'Hôm nay') {
      sortDate = new Date();
    } else if (date === 'Hôm qua') {
      sortDate = new Date();
      sortDate.setDate(sortDate.getDate() - 1);
    } else {
      sortDate = new Date(groupedByDate[date][0].timestamp);
    }

    return {
      title: date,
      data: groupedByDate[date],
      sortDate
    };
  }).sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

  return sections;
};

export const filterActivities = (activities: GardenActivityDto[], searchQuery: string) => {
  if (!searchQuery.trim()) {
    return activities;
  }

  const query = searchQuery.toLowerCase().trim();
  return activities.filter(activity => 
    activity.name.toLowerCase().includes(query) ||
    activity.details?.toLowerCase().includes(query) ||
    activity.notes?.toLowerCase().includes(query) ||
    activity.plantName?.toLowerCase().includes(query) ||
    activity.reason?.toLowerCase().includes(query) ||
    ACTIVITY_TYPE_TRANSLATIONS[activity.activityType as ActivityType]?.toLowerCase().includes(query)
  );
};

export const exportActivitiesToText = (activities: GardenActivityDto[]) => {
  if (!activities || activities.length === 0) {
    return null;
  }

  const exportData = activities.map((activity, index) => {
    const { fullDateTime } = getFormattedDateParts(activity.timestamp);
    const activityTypeDisplay = ACTIVITY_TYPE_TRANSLATIONS[activity.activityType as ActivityType] || activity.activityType;
    
    return `
${index + 1}. ${activity.name}
   Loại: ${activityTypeDisplay}
   Thời gian: ${fullDateTime}
   ${activity.details ? `Chi tiết: ${activity.details}` : ''}
   ${activity.plantName ? `Cây: ${activity.plantName}` : ''}
   ${activity.plantGrowStage ? `Giai đoạn: ${activity.plantGrowStage}` : ''}
   ${activity.notes ? `Ghi chú: ${activity.notes}` : ''}
   ${activity.reason ? `Lý do: ${activity.reason}` : ''}
   ---`;
  }).join('\n');

  return `
📖 NHẬT KÝ HOẠT ĐỘNG VƯỜN
Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}
Tổng cộng: ${activities.length} hoạt động

${exportData}

🌱 Smart Farm Mobile App
  `;
};

export const createStatsShareContent = (overview: {
  totalActivities: number;
  averagePerDay: number;
  activeDays: number;
  totalDays: number;
  activityRate: number;
  mostCommonActivityName: string;
  mostActiveGarden?: {
    gardenName: string;
    activityCount: number;
  };
}) => {
  return `
🌱 BÁO CÁO HOẠT ĐỘNG VƯỜN

📊 Tổng quan (30 ngày qua):
• Tổng hoạt động: ${overview.totalActivities}
• Trung bình/ngày: ${overview.averagePerDay.toFixed(1)}
• Ngày hoạt động: ${overview.activeDays}/${overview.totalDays}
• Tỷ lệ hoạt động: ${overview.activityRate.toFixed(1)}%

⭐ Hoạt động phổ biến: ${overview.mostCommonActivityName}
${overview.mostActiveGarden ? `🏆 Vườn tích cực nhất: ${overview.mostActiveGarden.gardenName} (${overview.mostActiveGarden.activityCount} hoạt động)` : ''}

🌱 Smart Farm Mobile App
  `;
}; 