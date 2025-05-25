import React, { useRef, useCallback, memo } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Animated,
  ViewStyle,
  TextStyle,
  LayoutChangeEvent,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

export type CardVariant =
  | "elevated"
  | "outlined"
  | "filled"
  | "glass"
  | "gradient";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: CardVariant;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  contentStyle?: ViewStyle;
  gradientColors?: [string, string];
  withAnimation?: boolean;
  withHaptics?: boolean;
  withShadow?: boolean;
  animateOnPress?: boolean;
  borderRadius?: number;
  blurIntensity?: number;
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
}

function Card({
  children,
  title,
  subtitle,
  variant = "elevated",
  onPress,
  disabled = false,
  style,
  titleStyle,
  subtitleStyle,
  contentStyle,
  gradientColors = ["#4c669f", "#3b5998"],
  withAnimation = true,
  withHaptics = false,
  withShadow = true,
  animateOnPress = true,
  borderRadius = 16,
  blurIntensity = 40,
  headerComponent,
  footerComponent,
}: CardProps) {
  const theme = useAppTheme();

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(1)).current;
  const cardWidth = useRef<number>(width - 32);

  // Handle layout to get card width
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    cardWidth.current = event.nativeEvent.layout.width;
  }, []);

  // Animation timing
  const pressDuration = 150;

  // Handle press in animation
  const handlePressIn = useCallback(() => {
    if (!withAnimation || !animateOnPress) return;

    if (withHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: pressDuration,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 0.7,
        duration: pressDuration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    withAnimation,
    animateOnPress,
    withHaptics,
    scaleAnim,
    shadowAnim,
    pressDuration,
  ]);

  // Handle press out animation
  const handlePressOut = useCallback(() => {
    if (!withAnimation || !animateOnPress) return;

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: pressDuration,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1,
        duration: pressDuration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [withAnimation, animateOnPress, scaleAnim, shadowAnim, pressDuration]);

  // Get card base style based on variant
  const getCardBaseStyle = useCallback((): ViewStyle => {
    switch (variant) {
      case "elevated":
        return {
          backgroundColor: theme.card,
          borderRadius,
        };
      case "outlined":
        return {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius,
        };
      case "filled":
        return {
          backgroundColor: theme.backgroundSecondary,
          borderRadius,
        };
      case "glass":
        return {
          backgroundColor: "transparent",
          borderRadius,
          overflow: "hidden" as const,
        };
      case "gradient":
        return {
          backgroundColor: "transparent",
          borderRadius,
          overflow: "hidden" as const,
        };
      default:
        return {
          backgroundColor: theme.card,
          borderRadius,
        };
    }
  }, [variant, theme, borderRadius]);

  // Get shadow style
  const getShadowStyle = useCallback(() => {
    if (!withShadow || variant === "outlined" || variant === "filled")
      return {};

    return {
      shadowColor: theme.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity:
        withAnimation && animateOnPress
          ? shadowAnim.interpolate({
              inputRange: [0.7, 1],
              outputRange: [0.1, 0.2],
            })
          : 0.2,
      shadowRadius:
        withAnimation && animateOnPress
          ? shadowAnim.interpolate({
              inputRange: [0.7, 1],
              outputRange: [3, 5],
            })
          : 5,
      elevation:
        withAnimation && animateOnPress
          ? shadowAnim.interpolate({
              inputRange: [0.7, 1],
              outputRange: [2, 5],
            })
          : 5,
    };
  }, [withShadow, variant, withAnimation, animateOnPress, shadowAnim, theme]);

  // Render card content
  const renderCardContent = useCallback(() => {
    const content = (
      <>
        {(title || subtitle || headerComponent) && (
          <View style={styles.header}>
            {headerComponent || (
              <>
                {title && (
                  <Text
                    style={[styles.title, { color: theme.text }, titleStyle]}
                  >
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text
                    style={[
                      styles.subtitle,
                      { color: theme.textSecondary },
                      subtitleStyle,
                    ]}
                  >
                    {subtitle}
                  </Text>
                )}
              </>
            )}
          </View>
        )}
        <View style={[styles.content, contentStyle]}>{children}</View>
        {footerComponent && (
          <View style={styles.footer}>{footerComponent}</View>
        )}
      </>
    );

    // Wrap content based on variant
    if (variant === "glass") {
      return (
        <BlurView
          intensity={blurIntensity}
          tint={theme.background === "#FFFFFF" ? "light" : "dark"}
          style={styles.blurContainer}
        >
          {content}
        </BlurView>
      );
    }

    if (variant === "gradient") {
      return (
        <LinearGradient
          colors={gradientColors || [theme.primaryLight, theme.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          {content}
        </LinearGradient>
      );
    }

    return content;
  }, [
    title,
    subtitle,
    headerComponent,
    footerComponent,
    children,
    variant,
    theme,
    titleStyle,
    subtitleStyle,
    contentStyle,
    blurIntensity,
    gradientColors,
  ]);

  const CardComponent = (
    <Animated.View
      style={[
        styles.card,
        getCardBaseStyle(),
        withShadow && getShadowStyle(),
        {
          transform: [
            {
              scale: withAnimation && animateOnPress ? scaleAnim : 1,
            },
          ],
        },
        style,
      ]}
      onLayout={handleLayout}
    >
      {renderCardContent()}
    </Animated.View>
  );

  // If card is pressable, wrap it in a Pressable
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={({ pressed }) => ({
          opacity: disabled ? 0.6 : 1,
        })}
      >
        {CardComponent}
      </Pressable>
    );
  }

  // Otherwise just return the card
  return CardComponent;
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    margin: 8,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    padding: 16,
    paddingTop: 8,
  },
  footer: {
    padding: 16,
    paddingTop: 0,
  },
  blurContainer: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
});

export default memo(Card);
