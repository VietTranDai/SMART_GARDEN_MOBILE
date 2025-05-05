import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";

// Define a type for quick action item
type QuickActionItem = {
  id: string;
  icon: string;
  iconType: "material" | "materialCommunity" | "ionicons";
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
};

interface QuickActionsBarProps {
  title?: string;
  actions: QuickActionItem[];
}

export default function QuickActionsBar({
  title = "Tác vụ nhanh",
  actions,
}: QuickActionsBarProps) {
  const theme = useAppTheme();

  // Create animation values for staggered appearance
  const fadeAnims = useRef<Animated.Value[]>([]);

  // Initialize or update animation values when actions change
  useEffect(() => {
    // Make sure we have the right number of animation values
    if (fadeAnims.current.length !== actions.length) {
      fadeAnims.current = actions.map(() => new Animated.Value(0));
    }

    const animations = fadeAnims.current.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: 100 + i * 50, // Stagger the animations
        useNativeDriver: true,
      })
    );

    Animated.stagger(50, animations).start();
  }, [actions]);

  // Render a single quick action button
  const renderQuickAction = (action: QuickActionItem, index: number) => {
    // Function to get the right icon based on type
    const getIcon = () => {
      const size = 24;
      const color = theme.primary;

      switch (action.iconType) {
        case "material":
          return (
            <MaterialIcons
              name={action.icon as any}
              size={size}
              color={color}
            />
          );
        case "materialCommunity":
          return (
            <MaterialCommunityIcons
              name={action.icon as any}
              size={size}
              color={color}
            />
          );
        case "ionicons":
          return (
            <Ionicons name={action.icon as any} size={size} color={color} />
          );
        default:
          return (
            <MaterialCommunityIcons
              name={action.icon as any}
              size={size}
              color={color}
            />
          );
      }
    };

    // Action press animation
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    // Only render if we have the animation value
    if (!fadeAnims.current[index]) {
      return null;
    }

    return (
      <Animated.View
        key={action.id}
        style={[
          styles.actionWrapper,
          {
            opacity: fadeAnims.current[index],
            transform: [
              { scale: scaleAnim },
              {
                translateY: fadeAnims.current[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.card, ...theme.elevation1 },
          ]}
          onPress={action.onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
          accessibilityLabel={action.accessibilityLabel || action.label}
          accessibilityRole="button"
        >
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: theme.statusHealthyBg },
            ]}
          >
            {getIcon()}
          </View>
          <Text
            style={[styles.actionText, { color: theme.text }]}
            numberOfLines={1}
          >
            {action.label}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {title && (
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text, marginBottom: 16, paddingHorizontal: 20 },
          ]}
        >
          {title}
        </Text>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        decelerationRate="fast"
        snapToInterval={124} // Width of action item + spacing
        snapToAlignment="start"
      >
        {actions.map((action, index) => renderQuickAction(action, index))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 19,
    fontFamily: "Inter-Bold",
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  actionWrapper: {
    margin: 6,
  },
  actionButton: {
    width: 110,
    height: 100,
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    textAlign: "center",
  },
});
