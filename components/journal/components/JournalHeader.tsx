import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { createJournalStyles } from '../styles/journalStyles';
import { JournalStats } from '../types';

interface JournalHeaderProps {
  stats: JournalStats;
  isSearchActive: boolean;
  setIsSearchActive: (active: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activities: any[];
}

export const JournalHeader: React.FC<JournalHeaderProps> = ({
  stats,
  isSearchActive,
  setIsSearchActive,
  searchQuery,
  onSearchChange,
  activities,
}) => {
  const theme = useAppTheme();
  const styles = createJournalStyles(theme);

  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
    if (isSearchActive) {
      onSearchChange('');
    }
  };

  return (
    <View style={styles.compactContentHeader}>
      <View style={{ paddingHorizontal: 16 }}>
        {/* Main Row: Search + Actions */}
        <View style={styles.compactSearchContainer}>
          {/* Search Section */}
          <View style={styles.compactSearchWrapper}>
            {!isSearchActive ? (
              <TouchableOpacity
                style={styles.compactSearchTrigger}
                onPress={toggleSearch}
                activeOpacity={0.7}
              >
                <Ionicons name="search-outline" size={18} color={theme.textSecondary} />
                <Text style={styles.compactSearchPlaceholder}>Tìm kiếm hoạt động...</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.compactActiveSearchContainer}>
                <Ionicons name="search" size={18} color={theme.primary} />
                <TextInput
                  style={styles.compactActiveSearchInput}
                  placeholder="Tìm kiếm hoạt động..."
                  placeholderTextColor={theme.textSecondary}
                  value={searchQuery}
                  onChangeText={onSearchChange}
                  autoFocus={true}
                  returnKeyType="search"
                />
                <TouchableOpacity
                  style={styles.compactSearchCloseButton}
                  onPress={toggleSearch}
                >
                  <Ionicons name="close" size={18} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.compactActionButtonsContainer}>
            <TouchableOpacity
              style={styles.compactActionButton}
              onPress={() => alert('Xuất dữ liệu nhật ký')}
              activeOpacity={0.7}
            >
              <Ionicons name="download-outline" size={18} color={theme.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.compactActionButton}
              onPress={() => alert('Chia sẻ thống kê')}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={18} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Results */}
        {isSearchActive && searchQuery.trim() && (
          <View style={styles.compactSearchResults}>
            <Text style={styles.compactSearchResultsText}>
              {activities.length > 0 
                ? `${activities.length} kết quả`
                : `Không có kết quả`
              }
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}; 