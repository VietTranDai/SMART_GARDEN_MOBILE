import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";
import useSectionAnimation from "@/hooks/useSectionAnimation";
import { GardenDisplay } from "@/hooks/useHomeData";

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  onPress: () => void;
}

interface QuickActionsProps {
  selectedGardenId?: number | null;
  gardens: GardenDisplay[];
  alerts: Record<string, any[]>;
  actions?: QuickAction[];
  showFullDetails?: boolean;
}

export default function QuickActions({
  selectedGardenId,
  gardens,
  alerts,
  actions,
  showFullDetails = false,
}: QuickActionsProps) {
  const theme = useAppTheme();
  const { getAnimatedStyle } = useSectionAnimation("quick_actions");

  const getActionIcon = (action: string) => {
    switch (action) {
      case "water":
        return "water-outline";
      case "fertilize":
        return "nutrition-outline";
      case "prune":
        return "cut-outline";
      case "harvest":
        return "leaf-outline";
      case "monitor":
        return "analytics-outline";
      case "settings":
        return "settings-outline";
      default:
        return "help-outline";
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "water":
        return "Tưới nước";
      case "fertilize":
        return "Bón phân";
      case "prune":
        return "Cắt tỉa";
      case "harvest":
        return "Thu hoạch";
      case "monitor":
        return "Giám sát";
      case "settings":
        return "Cài đặt";
      default:
        return "Khác";
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "water":
        return "#4A90E2";
      case "fertilize":
        return "#50E3C2";
      case "prune":
        return "#F5A623";
      case "harvest":
        return "#7ED321";
      case "monitor":
        return "#9013FE";
      case "settings":
        return "#D0021B";
      default:
        return theme.primary;
    }
  };

  const renderActionButton = (
    action: QuickAction | string,
    onPress?: () => void
  ) => {
    // Handle both string type (from defaults) and QuickAction type (from custom actions)
    const isQuickActionObj = typeof action !== "string";

    const actionId = isQuickActionObj ? action.id : (action as string);
    const actionTitle = isQuickActionObj
      ? action.title
      : getActionLabel(actionId);
    const actionIcon = isQuickActionObj ? action.icon : getActionIcon(actionId);
    const actionOnPress = isQuickActionObj ? action.onPress : onPress;
    const color = getActionColor(actionId);

    return (
      <TouchableOpacity
        key={actionId}
        style={[styles.actionButton, { backgroundColor: theme.card }]}
        onPress={actionOnPress}
      >
        <View
          style={[
            styles.actionIconContainer,
            { backgroundColor: color + "20" },
          ]}
        >
          {isQuickActionObj ? (
            <MaterialCommunityIcons
              name={actionIcon as any}
              size={24}
              color={color}
            />
          ) : (
            <Ionicons name={actionIcon as any} size={24} color={color} />
          )}
        </View>
        <Text style={[styles.actionLabel, { color: theme.text }]}>
          {actionTitle}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderActionSection = () => {
    // Use provided custom actions if available
    if (actions && actions.length > 0) {
      return (
        <View style={styles.customActionsGrid}>
          {actions.map((action) => renderActionButton(action))}
        </View>
      );
    }

    // Default actions
    const defaultActions = [
      {
        id: "water",
        onPress: () => router.push("/actions/water"),
      },
      {
        id: "fertilize",
        onPress: () => router.push("/actions/fertilize"),
      },
      {
        id: "prune",
        onPress: () => router.push("/actions/prune"),
      },
      {
        id: "harvest",
        onPress: () => router.push("/actions/harvest"),
      },
    ];

    if (showFullDetails) {
      defaultActions.push(
        {
          id: "monitor",
          onPress: () => router.push("/monitor"),
        },
        {
          id: "settings",
          onPress: () => router.push("/settings"),
        }
      );
    }

    return (
      <View style={styles.actionsContainer}>
        {defaultActions.map((action) =>
          renderActionButton(action.id, action.onPress)
        )}
      </View>
    );
  };

  if (!selectedGardenId) {
    return (
      <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
        <Ionicons name="leaf-outline" size={48} color={theme.textSecondary} />
        <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
          Vui lòng chọn một vườn để thực hiện các thao tác
        </Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, getAnimatedStyle()]}>
      {!showFullDetails && (
        <View style={styles.sectionHeader}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Thao tác nhanh
          </Text>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push("/actions")}
          >
            <Text style={[styles.viewAllText, { color: theme.primary }]}>
              Xem tất cả
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>
      )}

      {renderActionSection()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginRight: 2,
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    gap: 12,
  },
  customActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    padding: 16,
  },
  actionButton: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 12,
    margin: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    textAlign: "center",
    marginTop: 12,
  },
});
