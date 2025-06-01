// Helper function to get formatted date parts
export const getFormattedDateParts = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  
  const formatter = new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const fullDateTime = formatter.format(date);
  
  return {
    fullDateTime,
    date: date.toLocaleDateString('vi-VN'),
    time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  };
};

// Helper function to format percentile
export const formatPercentile = (percentile?: number): string => {
  if (percentile === undefined || percentile === null) return 'N/A';
  return `${Math.round(percentile)}%`;
};

// Helper function to format efficiency rating
export const formatEfficiencyRating = (rating?: number): string => {
  if (rating === undefined || rating === null) return 'N/A';
  return `${Math.round(rating * 100)}%`;
};

// Helper function to translate improvement trend
export const translateImprovementTrend = (trend?: 'IMPROVING' | 'STABLE' | 'DECLINING'): string => {
  switch (trend) {
    case 'IMPROVING': return 'Cải thiện';
    case 'STABLE': return 'Ổn định';
    case 'DECLINING': return 'Giảm sút';
    default: return 'Chưa xác định';
  }
};

// Helper function to translate effectiveness level
export const translateEffectivenessLevel = (level?: 'EFFECTIVE' | 'OPTIMAL' | 'SUBOPTIMAL' | 'INEFFECTIVE'): string => {
  switch (level) {
    case 'EFFECTIVE': return 'Hiệu quả';
    case 'OPTIMAL': return 'Tối ưu';
    case 'SUBOPTIMAL': return 'Chưa tối ưu';
    case 'INEFFECTIVE': return 'Không hiệu quả';
    default: return 'Chưa đánh giá';
  }
};

// Helper function to translate overall effectiveness
export const translateOverallEffectiveness = (effectiveness?: 'EFFECTIVE' | 'OPTIMAL' | 'SUBOPTIMAL' | 'INEFFECTIVE'): string => {
  return translateEffectivenessLevel(effectiveness);
};

// Helper function to get activity icon based on activity type
export const getActivityIcon = (activityType: string): string => {
  switch (activityType?.toUpperCase()) {
    case 'WATERING': return 'water';
    case 'FERTILIZING': return 'nutrition';
    case 'PRUNING': return 'cut';
    case 'HARVESTING': return 'basket';
    case 'PLANTING': return 'leaf';
    case 'PEST_CONTROL': return 'bug';
    case 'SOIL_PREPARATION': return 'earth';
    case 'MONITORING': return 'eye';
    default: return 'ellipsis-horizontal';
  }
};

// Helper function to format skill level
export const formatSkillLevel = (level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'): string => {
  switch (level) {
    case 'BEGINNER': return 'Người mới';
    case 'INTERMEDIATE': return 'Trung cấp';
    case 'ADVANCED': return 'Nâng cao';
    case 'EXPERT': return 'Chuyên gia';
    default: return 'Chưa xác định';
  }
};

// Helper function to get color for rating
export const getRatingColor = (rating?: number): string => {
  if (!rating) return '#6B7280';
  if (rating >= 0.8) return '#10B981';
  if (rating >= 0.6) return '#F59E0B';
  if (rating >= 0.4) return '#F97316';
  return '#EF4444';
};

// Helper function to format duration
export const formatDuration = (minutes?: number): string => {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}; 