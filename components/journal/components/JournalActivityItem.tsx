import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { createJournalStyles } from '../styles/journalStyles';
import { GardenActivityDto } from '@/types/activities/dtos';
import { 
  ACTIVITY_COLOR_MAP, 
  ACTIVITY_TYPE_TRANSLATIONS 
} from '../types';
import { getActivityIcon, getFormattedDateParts } from '../utils/journalUtils';
import { ActivityType } from '@/types/activities/activity.types';

interface JournalActivityItemProps {
  activity: GardenActivityDto;
  isLastInSection: boolean;
  onAnalyticsPress?: (activityId: number) => void;
}

export const JournalActivityItem: React.FC<JournalActivityItemProps> = ({
  activity,
  isLastInSection,
  onAnalyticsPress,
}) => {
  const theme = useAppTheme();
  const styles = createJournalStyles(theme);

  const { timeDisplay } = getFormattedDateParts(activity.timestamp);
  const activityColor = ACTIVITY_COLOR_MAP[activity.activityType] || theme.primary;
  const activityTypeDisplay = ACTIVITY_TYPE_TRANSLATIONS[activity.activityType as ActivityType] || activity.activityType;

  const formatSensorValue = (value: any, unit: string) => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'number') {
      return `${value.toFixed(1)}${unit}`;
    }
    return `${value}${unit}`;
  };

  const handleAnalyze = () => {
    if (onAnalyticsPress) {
      onAnalyticsPress(activity.id);
    } else {
      console.log('Analyze activity:', activity.id);
      alert('Tính năng phân tích chi tiết sẽ được thêm trong phiên bản tiếp theo');
    }
  };

  const handleShare = () => {
    console.log('Share activity:', activity.id);
    const shareContent = `
🌱 ${activity.name}
📝 Loại: ${activityTypeDisplay}
⏰ ${getFormattedDateParts(activity.timestamp).fullDateTime}
${activity.details ? `📋 Chi tiết: ${activity.details}` : ''}
${activity.plantName ? `🌿 Cây: ${activity.plantName}` : ''}

📱 Smart Farm Mobile App
    `;
    alert(`Chia sẻ hoạt động:\n${shareContent.trim()}`);
  };

  const renderSensorData = () => {
    const sensorGroups = [
      {
        title: '🌡️ Môi trường',
        data: [
          { key: 'temperature', label: 'Nhiệt độ', value: activity.temperature, unit: '°C', icon: 'thermometer-outline' },
          { key: 'humidity', label: 'Độ ẩm', value: activity.humidity, unit: '%', icon: 'water-outline' },
          { key: 'lightIntensity', label: 'Ánh sáng', value: activity.lightIntensity, unit: 'lux', icon: 'sunny-outline' },
        ]
      },
      {
        title: '🌱 Đất',
        data: [
          { key: 'soilMoisture', label: 'Độ ẩm đất', value: activity.soilMoisture, unit: '%', icon: 'leaf-outline' },
          { key: 'soilPH', label: 'pH đất', value: activity.soilPH, unit: '', icon: 'flask-outline' },
        ]
      },
      {
        title: '💧 Nước',
        data: [
          { key: 'waterLevel', label: 'Mực nước', value: activity.waterLevel, unit: 'cm', icon: 'water' },
          { key: 'rainfall', label: 'Lượng mưa', value: activity.rainfall, unit: 'mm', icon: 'rainy-outline' },
        ]
      }
    ];

    const hasAnyData = sensorGroups.some(group => 
      group.data.some(item => item.value !== undefined && item.value !== null)
    );

    if (!hasAnyData) return null;

    return (
      <View style={styles.sensorDataGrid}>
        {sensorGroups.map((group, groupIndex) => {
          const validData = group.data.filter(item => item.value !== undefined && item.value !== null);
          if (validData.length === 0) return null;

          return (
            <View key={groupIndex} style={styles.sensorGroup}>
              <Text style={styles.sensorGroupTitle}>{group.title}</Text>
              <View style={styles.sensorRow}>
                {validData.map((item, index) => (
                  <View key={index} style={styles.sensorItem}>
                    <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={12} color={theme.primary} />
                    <Text style={styles.sensorText}>
                      {item.label}: {formatSensorValue(item.value, item.unit)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.timelineItemContainer}>
      {/* Timeline circle and line */}
      <View style={styles.timelineContainer}>
        <View style={[styles.timelineCircle, { backgroundColor: activityColor }]} />
        {!isLastInSection && <View style={styles.timelineLine} />}
      </View>

      {/* Activity card */}
      <View style={[styles.journalCard, { borderLeftColor: activityColor }]}>
        {/* Time badge */}
        <View style={styles.timeBadge}>
          <Text style={styles.timeText}>{timeDisplay}</Text>
        </View>

        {/* Header with icon and title */}
        <View style={styles.journalHeader}>
          <View style={[
            styles.activityIconContainer,
            { backgroundColor: activityColor + '20' }
          ]}>
            <Ionicons
              name={getActivityIcon(activity.activityType)}
              size={20}
              color={activityColor}
            />
          </View>
          <View style={styles.activityTitleContainer}>
            <Text style={styles.activityTitle}>{activity.name}</Text>
            <Text style={[styles.activityType, { color: activityColor }]}>
              {activityTypeDisplay}
            </Text>
          </View>
        </View>

        {/* Details */}
        {activity.details && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsText}>{activity.details}</Text>
          </View>
        )}

        {/* Metadata */}
        <View style={styles.metadataContainer}>
          {activity.plantName && (
            <View style={styles.metadataItem}>
              <Ionicons name="leaf" size={12} color={theme.primary} />
              <Text style={styles.metadataText}>{activity.plantName}</Text>
            </View>
          )}
          {activity.plantGrowStage && (
            <View style={styles.metadataItem}>
              <Ionicons name="trending-up" size={12} color={theme.primary} />
              <Text style={styles.metadataText}>{activity.plantGrowStage}</Text>
            </View>
          )}
          {activity.reason && (
            <View style={styles.metadataItem}>
              <Ionicons name="help-circle" size={12} color={theme.primary} />
              <Text style={styles.metadataText}>{activity.reason}</Text>
            </View>
          )}
          {/* TODO: Fix gardenName property when available */}
          {/* {activity.gardenName && (
            <View style={styles.metadataItem}>
              <Ionicons name="location" size={12} color={theme.primary} />
              <Text style={styles.metadataText}>{activity.gardenName}</Text>
            </View>
          )} */}
        </View>

        {/* Additional info */}
        {(activity.notes || renderSensorData()) && (
          <View style={styles.additionalInfoContainer}>
            {activity.notes && (
              <Text style={styles.notesText}>
                <Text style={styles.labelText}>Ghi chú:</Text> {activity.notes}
              </Text>
            )}
            {renderSensorData()}
          </View>
        )}

        {/* Quick actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleAnalyze}
            activeOpacity={0.7}
          >
            <Ionicons name="analytics-outline" size={14} color={theme.primary} />
            <Text style={styles.quickActionText}>Phân tích</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={14} color={theme.primary} />
            <Text style={styles.quickActionText}>Chia sẻ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}; 