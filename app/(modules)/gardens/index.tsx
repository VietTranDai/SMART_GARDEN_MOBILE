/**
 * Enhanced GardensScreen with:
 * - useHomeData hook for data fetching
 * - FastImage for optimized image loading
 * - Skeleton loading placeholders
 * - Accessibility features
 * - Optimized FlatList performance
 * - Improved empty state
 * - Progress bar with percentage
 */
import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Platform,
  ViewStyle,
} from "react-native";
import { router, Stack } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
  FontAwesome5,
} from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { GardenStatus, GardenType } from "@/types";
import { Garden } from "@/types/gardens/garden.types";
import env from "@/config/environment";
import { Image } from "expo-image";
import SkeletonPlaceholder from "@/components/ui/SkeletonPlaceholder";
import useHomeData from "@/hooks/useHomeData";
import { gardenService } from "@/service/api";

// Gradient Replacement Component with proper TypeScript types
const GradientOverlay = ({ style }: { style: ViewStyle }) => {
  const theme = useAppTheme();
  return (
    <View
      style={[
        style,
        {
          backgroundColor: "transparent",
          borderBottomWidth: 50,
          borderBottomColor: "rgba(0,0,0,0.4)",
        },
      ]}
    />
  );
};

// Extract GardenItem component and wrap with React.memo for optimization
const GardenItem = React.memo(
  ({
    item,
    theme,
    getStatusColor,
    getStatusText,
    getGardenTypeIcon,
    getGardenTypeText,
    getLocationText,
  }: {
    item: Garden;
    theme: any;
    getStatusColor: (status: GardenStatus) => string;
    getStatusText: (status: GardenStatus) => string;
    getGardenTypeIcon: (type: GardenType) => string;
    getGardenTypeText: (type: GardenType) => string;
    getLocationText: (garden: Garden) => string;
  }) => {
    // Added animated press effect for better feedback
    const scale = new Animated.Value(1);

    const onPressIn = () => {
      Animated.spring(scale, {
        toValue: 0.97,
        friction: 5,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    };

    // Get growth progress for the progress bar
    const growthProgress = item.growthProgress;
    const growthProgressText = `${Math.round(growthProgress)}%`;

    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          style={styles.gardenCard}
          onPress={() => router.push(`/(modules)/gardens/${item.id}`)}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={0.9}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Khu vườn ${item.name}`}
          accessibilityHint={`Nhấn để xem chi tiết về khu vườn ${item.name}`}
        >
          <View style={styles.imageThumbnailContainer}>
            <Image
              source={{
                uri: item.profilePicture
                  ? `${env.apiUrl}${item.profilePicture}`
                  : gardenService.getDefaultGardenImage(item.type).uri,
              }}
              style={styles.gardenThumbnail}
              contentFit="cover"
              priority="normal"
              placeholder={require("@/assets/images/garden-placeholder.png")}
              transition={300}
            />
            <GradientOverlay style={styles.imageGradient} />
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
            accessible={true}
            accessibilityLabel={`Trạng thái: ${getStatusText(item.status)}`}
          >
            <Text style={styles.statusBadgeText}>
              {getStatusText(item.status)}
            </Text>
          </View>

          <View style={styles.gardenContent}>
            <Text
              style={styles.gardenTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.name}
            </Text>
            <View style={styles.gardenMetaRow}>
              <View
                style={styles.gardenMetaItem}
                accessible={true}
                accessibilityLabel={`Loại: ${getGardenTypeText(item.type)}`}
              >
                <Ionicons
                  name={getGardenTypeIcon(item.type) as any}
                  size={14}
                  color={theme.textSecondary}
                />
                <Text style={styles.gardenMetaText}>
                  {getGardenTypeText(item.type)}
                </Text>
              </View>
              <View
                style={styles.gardenMetaItem}
                accessible={true}
                accessibilityLabel={`Vị trí: ${getLocationText(item)}`}
              >
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={theme.textSecondary}
                />
                <Text
                  style={styles.gardenMetaText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {getLocationText(item)}
                </Text>
              </View>
            </View>
            <View style={styles.gardenMetaRow}>
              {item.plantName && (
                <View
                  style={styles.gardenMetaItem}
                  accessible={true}
                  accessibilityLabel={`Loại cây: ${item.plantName}`}
                >
                  <Feather
                    name="target"
                    size={14}
                    color={theme.textSecondary}
                  />
                  <Text
                    style={styles.gardenMetaText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.plantName}
                  </Text>
                </View>
              )}
              {item.plantGrowStage && (
                <View
                  style={styles.gardenMetaItem}
                  accessible={true}
                  accessibilityLabel={`Giai đoạn phát triển: ${item.plantGrowStage}`}
                >
                  <FontAwesome5
                    name="seedling"
                    size={13}
                    color={theme.textSecondary}
                  />
                  <Text style={styles.gardenMetaText}>
                    {item.plantGrowStage}
                  </Text>
                </View>
              )}
            </View>

            {item.plantStartDate && item.plantDuration && (
              <View
                style={styles.progressContainer}
                accessible={true}
                accessibilityLabel={`Tiến độ phát triển: ${growthProgressText}`}
              >
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressLabel}>Tiến độ phát triển</Text>
                  <Text style={styles.progressPercentage}>
                    {growthProgressText}
                  </Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${growthProgress}%`,
                        backgroundColor: theme.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

export default function GardensScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Use the useHomeData hook instead of direct API calls
  const { gardens, loading, error, refreshing, handleRefresh } = useHomeData();

  // --- Helper Functions (Use new interface/enums) ---
  const getStatusColor = (status: GardenStatus) => {
    switch (status) {
      case GardenStatus.ACTIVE:
        return theme.success;
      case GardenStatus.INACTIVE:
        return theme.textTertiary;
      // Add cases for other statuses if needed
      default:
        return theme.warning; // Default for PENDING etc.
    }
  };

  const getGardenTypeIcon = (type: GardenType) => {
    switch (type) {
      case GardenType.INDOOR:
        return "home-outline";
      case GardenType.OUTDOOR:
        return "leaf-outline";
      case GardenType.BALCONY:
        return "grid-outline";
      case GardenType.ROOFTOP:
        return "business-outline";
      case GardenType.WINDOW_SILL:
        return "browsers-outline";
      default:
        return "help-circle-outline";
    }
  };

  const getStatusText = (status: GardenStatus): string => {
    switch (status) {
      case GardenStatus.ACTIVE:
        return "Hoạt động";
      case GardenStatus.INACTIVE:
        return "Ngừng";
      // Add other statuses like PENDING if used
      default:
        return status;
    }
  };

  const getGardenTypeText = (type: GardenType): string => {
    switch (type) {
      case GardenType.INDOOR:
        return "Trong nhà";
      case GardenType.OUTDOOR:
        return "Ngoài trời";
      case GardenType.BALCONY:
        return "Ban công";
      case GardenType.ROOFTOP:
        return "Sân thượng";
      case GardenType.WINDOW_SILL:
        return "Cửa sổ";
      default:
        return type;
    }
  };

  // Get garden location display text
  const getLocationText = (garden: Garden): string => {
    const parts = [];
    if (garden.district) parts.push(garden.district);
    if (garden.city) parts.push(garden.city);
    return parts.length > 0 ? parts.join(", ") : "Chưa có địa chỉ";
  };

  // --- Render Logic (Use fields from Garden) ---
  const renderGardenItem = ({ item }: { item: Garden }) => {
    return (
      <GardenItem
        item={item}
        theme={theme}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        getGardenTypeIcon={getGardenTypeIcon}
        getGardenTypeText={getGardenTypeText}
        getLocationText={getLocationText}
      />
    );
  };

  // Render skeleton loading placeholders
  const renderSkeletonPlaceholder = () => {
    return Array(3)
      .fill(0)
      .map((_, index) => (
        <View key={`skeleton-${index}`} style={styles.gardenCard}>
          <SkeletonPlaceholder
            backgroundColor={theme.border || "#e1e9ee"}
            highlightColor={theme.borderLight || "#f2f8fc"}
          >
            <SkeletonPlaceholder.Item
              height={150}
              width="100%"
              borderTopLeftRadius={16}
              borderTopRightRadius={16}
            />
            <SkeletonPlaceholder.Item padding={16}>
              <SkeletonPlaceholder.Item
                width="70%"
                height={20}
                marginBottom={10}
              />
              <SkeletonPlaceholder.Item flexDirection="row" marginBottom={8}>
                <SkeletonPlaceholder.Item
                  width="40%"
                  height={14}
                  marginRight={20}
                />
                <SkeletonPlaceholder.Item width="30%" height={14} />
              </SkeletonPlaceholder.Item>
              <SkeletonPlaceholder.Item flexDirection="row" marginBottom={12}>
                <SkeletonPlaceholder.Item
                  width="35%"
                  height={14}
                  marginRight={20}
                />
                <SkeletonPlaceholder.Item width="25%" height={14} />
              </SkeletonPlaceholder.Item>
              <SkeletonPlaceholder.Item
                width="100%"
                height={6}
                marginTop={10}
              />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        </View>
      ));
  };

  // Item separator for the FlatList
  const ItemSeparator = () => <View style={styles.itemSeparator} />;

  // Memoized keyExtractor to improve performance
  const keyExtractor = useCallback((item: Garden) => item.id.toString(), []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          title: "Khu vườn của tôi",
          headerRight: () => (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push("/(modules)/gardens/create")}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Tạo khu vườn mới"
              accessibilityHint="Nhấn để tạo khu vườn mới"
            >
              <Ionicons name="add-outline" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          {renderSkeletonPlaceholder()}
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRefresh}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Thử lại"
            accessibilityHint="Nhấn để tải lại danh sách khu vườn"
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : gardens.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyImageContainer}>
            <MaterialCommunityIcons
              name="sprout"
              size={84}
              color={theme.primary}
              style={styles.emptyIcon}
            />
          </View>
          <MaterialCommunityIcons
            name="sprout"
            size={64}
            color={theme.textTertiary}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>Chưa có khu vườn nào</Text>
          <Text style={styles.emptyText}>
            Bạn chưa có khu vườn nào. Hãy tạo khu vườn đầu tiên của bạn ngay!
          </Text>
          <TouchableOpacity
            style={styles.createGardenButton}
            onPress={() => router.push("/(modules)/gardens/create")}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Tạo khu vườn"
            accessibilityHint="Nhấn để tạo khu vườn đầu tiên của bạn"
          >
            <Text style={styles.createGardenButtonText}>Tạo khu vườn</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={gardens}
          renderItem={renderGardenItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === "android"}
          ItemSeparatorComponent={ItemSeparator}
          getItemLayout={(data, index) => ({
            length: 320, // approximate height of a garden card with all elements
            offset: 320 * index,
            index,
          })}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loadingContainer: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
      backgroundColor: theme.background,
    },
    gardenList: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 80,
    },
    gardenCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 16,
      elevation: 4,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      position: "relative",
    },
    imageThumbnailContainer: {
      position: "relative",
      width: "100%",
      height: 150,
    },
    gardenThumbnail: {
      width: "100%",
      height: 150,
      backgroundColor: theme.border,
    },
    imageGradient: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 50,
    },
    statusBadge: {
      position: "absolute",
      top: 12,
      left: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      opacity: 0.95,
      zIndex: 1,
    },
    alertBadge: {
      position: "absolute",
      top: 10,
      right: 10,
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.error,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 5,
      zIndex: 1,
    },
    alertBadgeText: {
      color: theme.card,
      fontSize: 12,
      fontFamily: "Inter-Bold",
    },
    statusBadgeText: {
      color: theme.card,
      fontSize: 12,
      fontFamily: "Inter-SemiBold",
      textTransform: "uppercase",
    },
    gardenContent: {
      padding: 16,
    },
    gardenTitle: {
      fontSize: 18,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 10,
    },
    gardenMetaRow: {
      flexDirection: "row",
      marginBottom: 8,
      flexWrap: "wrap",
      gap: 16,
    },
    gardenMetaItem: {
      flexDirection: "row",
      alignItems: "center",
      maxWidth: "70%", // Ensure text doesn't overflow too much
    },
    gardenMetaText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginLeft: 6,
    },
    gardenPlantInfo: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textTertiary,
      marginTop: 6,
    },
    progressContainer: {
      marginTop: 10,
    },
    progressLabelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 5,
    },
    progressLabel: {
      fontSize: 13,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
    },
    progressPercentage: {
      fontSize: 13,
      color: theme.primary,
      fontFamily: "Inter-Medium",
    },
    progressBarBackground: {
      height: 6,
      backgroundColor: theme.borderLight,
      borderRadius: 3,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 3,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
      marginTop: 40,
      minHeight: 300,
    },
    emptyImageContainer: {
      width: 150,
      height: 150,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.borderLight,
      borderRadius: 75,
      marginBottom: 20,
    },
    emptyIcon: {
      marginBottom: 10,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      textAlign: "center",
      marginTop: 16,
      marginBottom: 24,
    },
    createButtonEmpty: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 25,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primary,
      elevation: 2,
    },
    createButtonText: {
      color: theme.card,
      fontSize: 16,
      fontFamily: "Inter-Medium",
      marginLeft: 8,
    },
    fab: {
      position: "absolute",
      bottom: 30,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      elevation: 5,
    },
    loadingText: {
      color: theme.text,
      fontSize: 16,
      fontFamily: "Inter-Regular",
      marginTop: 16,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
      marginTop: 40,
      minHeight: 300,
    },
    errorText: {
      color: theme.error,
      fontSize: 16,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      marginTop: 16,
      marginBottom: 24,
    },
    retryButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 25,
      backgroundColor: theme.primary,
      elevation: 2,
    },
    retryButtonText: {
      color: theme.card,
      fontSize: 16,
      fontFamily: "Inter-Medium",
    },
    createGardenButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 25,
      backgroundColor: theme.primary,
      elevation: 4,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    createGardenButtonText: {
      color: theme.card,
      fontSize: 16,
      fontFamily: "Inter-Medium",
    },
    emptyTitle: {
      fontSize: 22,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginTop: 20,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 80,
    },
    createButton: {
      padding: 8,
      backgroundColor: theme.primary,
      borderRadius: 20,
      marginRight: 8,
    },
    itemSeparator: {
      height: 16,
    },
  });
