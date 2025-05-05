import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

interface GardeningTipCardProps {
  title: string;
  content: string;
  imageUrl?: string;
  iconName?: string;
  onPress: () => void;
}

export default function GardeningTipCard({
  title,
  content,
  imageUrl,
  iconName = "leaf",
  onPress,
}: GardeningTipCardProps) {
  const theme = useAppTheme();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Mount animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: theme.animationTiming.medium,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, theme.animationTiming.medium]);

  // Press animations
  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.98,
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

  // Render icon or image
  const renderIconOrImage = () => {
    if (imageUrl) {
      return (
        <Image
          source={{ uri: imageUrl }}
          style={styles.tipImage}
          resizeMode="contain"
        />
      );
    }

    return (
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.statusHealthyBg },
        ]}
      >
        <MaterialCommunityIcons
          name={iconName as any}
          size={36}
          color={theme.primary}
        />
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          ...theme.elevation2,
        },
      ]}
      accessibilityLabel={`Mẹo: ${title}`}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
      >
        <LinearGradient
          colors={[theme.cardHighlight, theme.backgroundTertiary]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            {renderIconOrImage()}
            <Text style={[styles.title, { color: theme.primaryDark }]}>
              {title}
            </Text>
          </View>

          <View style={styles.content}>
            <Text
              style={[styles.contentText, { color: theme.textSecondary }]}
              numberOfLines={4}
            >
              {content}
            </Text>

            <View style={styles.footer}>
              <Text style={[styles.readMoreText, { color: theme.primary }]}>
                Xem thêm
              </Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={theme.primary}
              />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  touchable: {
    width: "100%",
  },
  gradient: {
    padding: 16,
    minHeight: 160,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  tipImage: {
    width: 60,
    height: 60,
    marginRight: 14,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 6,
  },
  readMoreText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginRight: 2,
  },
});
