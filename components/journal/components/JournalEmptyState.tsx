import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { createJournalStyles } from '../styles/journalStyles';

interface JournalEmptyStateProps {
  searchQuery?: string;
  hasFilters?: boolean;
}

export const JournalEmptyState: React.FC<JournalEmptyStateProps> = ({
  searchQuery,
  hasFilters,
}) => {
  const theme = useAppTheme();
  const styles = createJournalStyles(theme);

  const handleCreateActivity = () => {
    router.push('/activity/create' as never);
  };

  const quickStartActivities = [
    { icon: 'water-outline', name: 'Tưới nước cho cây', type: 'WATERING' },
    { icon: 'leaf-outline', name: 'Bón phân cho vườn', type: 'FERTILIZING' },
    { icon: 'trending-up-outline', name: 'Trồng cây mới', type: 'PLANTING' },
    { icon: 'cut-outline', name: 'Cắt tỉa cành', type: 'PRUNING' },
    { icon: 'basket-outline', name: 'Thu hoạch sản phẩm', type: 'HARVESTING' },
  ];

  if (searchQuery) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyImageContainer}>
          <Ionicons name="search-outline" size={48} color={theme.textSecondary} />
        </View>
        <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
        <Text style={styles.emptyText}>
          Không có hoạt động nào phù hợp với từ khóa &ldquo;{searchQuery}&rdquo;.
          {'\n'}Hãy thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả.
        </Text>
      </View>
    );
  }

  if (hasFilters) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyImageContainer}>
          <Ionicons name="filter-outline" size={48} color={theme.textSecondary} />
        </View>
        <Text style={styles.emptyTitle}>Không có hoạt động</Text>
        <Text style={styles.emptyText}>
          Không có hoạt động nào phù hợp với bộ lọc hiện tại.
          {'\n'}Hãy thử điều chỉnh bộ lọc hoặc thêm hoạt động mới.
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={handleCreateActivity}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.emptyButtonText}>Thêm hoạt động mới</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyImageContainer}>
        <Ionicons name="journal-outline" size={48} color={theme.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>Nhật ký trống</Text>
      <Text style={styles.emptyText}>
        Bạn chưa có hoạt động nào trong vườn.
        {'\n'}Hãy bắt đầu ghi chép những hoạt động chăm sóc cây trồng của bạn!
      </Text>

      {/* Quick start suggestions */}
      <View style={styles.quickStartContainer}>
        <Text style={styles.quickStartTitle}>💡 Gợi ý hoạt động phổ biến:</Text>
        {quickStartActivities.map((activity, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickStartItem}
            onPress={handleCreateActivity}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={activity.icon as keyof typeof Ionicons.glyphMap} 
              size={16} 
              color={theme.primary} 
            />
            <Text style={styles.quickStartText}>{activity.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.emptyButton}
        onPress={handleCreateActivity}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={styles.emptyButtonText}>Bắt đầu ghi nhật ký</Text>
      </TouchableOpacity>
    </View>
  );
}; 