import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { createJournalStyles } from '../styles/journalStyles';
import { Garden } from '@/types/gardens/garden.types';

interface JournalFiltersProps {
  selectedGardenId?: string;
  setSelectedGardenId: (id?: string) => void;
  selectedActivityType?: string;
  setSelectedActivityType: (type?: string) => void;
  gardens: Garden[];
  loadingGardens: boolean;
  gardenFetchError: string | null;
  isStatsExpanded: boolean;
  setIsStatsExpanded: (expanded: boolean) => void;
}

export const JournalFilters: React.FC<JournalFiltersProps> = ({
  selectedGardenId,
  setSelectedGardenId,
  selectedActivityType,
  setSelectedActivityType,
  gardens,
  loadingGardens,
  gardenFetchError,
  isStatsExpanded,
  setIsStatsExpanded,
}) => {
  const theme = useAppTheme();
  const styles = createJournalStyles(theme);

  // Chỉ count garden filter
  const activeFilterCount = selectedGardenId ? 1 : 0;

  const clearAllFilters = () => {
    setSelectedGardenId(undefined);
  };

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <>
      {/* Filter Content - Luôn hiển thị */}
      <View style={styles.compactFilterContainer}>
        <View style={styles.compactFilterContent}>
          <View style={styles.compactFilterRow}>
            {/* Garden filter - Chiếm 70% width */}
            <View style={[styles.compactFilterItem, { flex: 2 }]}>
              <Text style={styles.compactFilterLabel}>
                <Ionicons name="leaf-outline" size={12} color={theme.primary} /> Chọn vườn để xem nhật ký
              </Text>
              <View style={styles.compactPickerWrapper}>
                <Picker
                  selectedValue={selectedGardenId || ''}
                  onValueChange={(value) => setSelectedGardenId(value || undefined)}
                  style={styles.compactPickerStyle}
                  dropdownIconColor={theme.textSecondary}
                  enabled={!loadingGardens && !gardenFetchError}
                >
                  <Picker.Item label="Tất cả vườn của tôi" value="" />
                  {gardens.map((garden) => (
                    <Picker.Item 
                      key={garden.id} 
                      label={garden.name} 
                      value={garden.id.toString()} 
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Detailed Analytics Button - Chiếm 30% width */}
            <View style={[styles.compactFilterItem, { flex: 1 }]}>
              <Text style={styles.compactFilterLabel}>
                <Ionicons name="analytics-outline" size={12} color={theme.primary} /> Thống kê chi tiết
              </Text>
              <TouchableOpacity
                style={[
                  styles.compactAnalyticsButton,
                  isStatsExpanded && styles.compactAnalyticsButtonActive
                ]}
                onPress={() => setIsStatsExpanded(!isStatsExpanded)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={isStatsExpanded ? "analytics" : "analytics-outline"} 
                  size={16} 
                  color={isStatsExpanded ? "#FFFFFF" : theme.primary} 
                />
                <Text style={[
                  styles.compactAnalyticsButtonText,
                  isStatsExpanded && styles.compactAnalyticsButtonTextActive
                ]}>
                  {isStatsExpanded ? "Ẩn" : "Xem"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Status and Clear Button */}
          <View style={styles.compactFilterFooter}>
            {loadingGardens && (
              <Text style={styles.compactFilterStatus}>
                <ActivityIndicator size="small" color={theme.primary} /> Đang tải vườn...
              </Text>
            )}
            {gardenFetchError && (
              <Text style={styles.compactFilterError}>{gardenFetchError}</Text>
            )}
            {hasActiveFilters && (
              <TouchableOpacity
                onPress={clearAllFilters}
                style={styles.compactClearButton}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh-outline" size={12} color={theme.primary} />
                <Text style={styles.compactClearButtonText}>Bỏ chọn vườn</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Active Garden Filter Display */}
      {hasActiveFilters && (
        <View style={styles.compactActiveFiltersContainer}>
          <View style={[
            styles.compactActiveFilterTag,
            { backgroundColor: theme.primary + '15', borderColor: theme.primary }
          ]}>
            <Ionicons name="leaf" size={12} color={theme.primary} />
            <Text style={styles.compactActiveFilterText} numberOfLines={1}>
              {gardens.find(g => g.id.toString() === selectedGardenId)?.name || 'Vườn đã chọn'}
            </Text>
            <TouchableOpacity
              style={styles.compactActiveFilterRemove}
              onPress={() => setSelectedGardenId(undefined)}
            >
              <Ionicons name="close" size={12} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
}; 