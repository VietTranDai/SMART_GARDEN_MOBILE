import React, { useState, useCallback, memo } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Pressable,
  Animated,
} from "react-native";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import useAnimation from "@/hooks/ui/useAnimation";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "text"
  | "gradient"
  | "glass";
type ButtonSize = "small" | "medium" | "large";
type OverflowType = "visible" | "hidden" | "scroll";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  gradientColors?: [string, string];
  withAnimation?: boolean;
  withHaptics?: boolean;
  animationType?: "scale" | "opacity" | "none";
  hasShadow?: boolean;
}

function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  gradientColors = ["#4c669f", "#3b5998"],
  withAnimation = true,
  withHaptics = true,
  animationType = "scale",
  hasShadow = true,
}: ButtonProps) {
  const theme = useAppTheme();
  const [isPressed, setIsPressed] = useState(false);

  // Animation for button press
  const { animatedValue, animatedStyle } = useAnimation("scale", {
    initialValue: 1,
    toValue: 0.96,
    duration: 100,
  });

  // Handle press in with optional haptic feedback and animation
  const handlePressIn = useCallback(() => {
    setIsPressed(true);
    if (withAnimation && animationType === "scale") {
      Animated.timing(animatedValue, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }

    if (withHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [withAnimation, animationType, animatedValue, withHaptics]);

  // Handle press out
  const handlePressOut = useCallback(() => {
    setIsPressed(false);
    if (withAnimation && animationType === "scale") {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [withAnimation, animationType, animatedValue]);

  // Get button styles based on variant
  const getButtonStyle = useCallback(() => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: disabled
            ? theme.buttonBackgroundDisabled
            : theme.buttonBackground,
          borderColor: disabled
            ? theme.buttonBackgroundDisabled
            : theme.buttonBackground,
        };
      case "secondary":
        return {
          backgroundColor: disabled
            ? theme.buttonBackgroundDisabled
            : theme.secondary,
          borderColor: disabled
            ? theme.buttonBackgroundDisabled
            : theme.secondary,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: disabled ? theme.buttonTextDisabled : theme.primary,
          borderWidth: 1,
        };
      case "text":
        return {
          backgroundColor: "transparent",
          borderWidth: 0,
          paddingHorizontal: 0,
        };
      case "gradient":
        return {
          backgroundColor: "transparent",
          borderWidth: 0,
        };
      case "glass":
        return {
          backgroundColor: "transparent",
          borderWidth: 0,
          overflow: "hidden" as OverflowType,
        };
      default:
        return {
          backgroundColor: disabled
            ? theme.buttonBackgroundDisabled
            : theme.buttonBackground,
          borderColor: disabled
            ? theme.buttonBackgroundDisabled
            : theme.buttonBackground,
        };
    }
  }, [variant, theme, disabled]);

  // Get text color based on variant
  const getTextColor = useCallback(() => {
    if (disabled) {
      return theme.buttonTextDisabled;
    }

    switch (variant) {
      case "primary":
      case "secondary":
      case "gradient":
      case "glass":
        return theme.buttonText;
      case "outline":
        return theme.buttonTextSecondary;
      case "text":
        return theme.textLink;
      default:
        return theme.buttonText;
    }
  }, [variant, theme, disabled]);

  // Get button size
  const getButtonSize = useCallback(() => {
    switch (size) {
      case "small":
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
        };
      case "medium":
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 10,
        };
      case "large":
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          borderRadius: 12,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 10,
        };
    }
  }, [size]);

  // Get text size
  const getTextSize = useCallback(() => {
    switch (size) {
      case "small":
        return 14;
      case "medium":
        return 16;
      case "large":
        return 18;
      default:
        return 16;
    }
  }, [size]);

  // Get shadow style
  const getShadowStyle = useCallback(() => {
    if (!hasShadow || variant === "text" || variant === "outline" || disabled)
      return {};

    return {
      shadowColor: variant === "primary" ? theme.primary : theme.secondary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 6,
    };
  }, [hasShadow, variant, disabled, theme]);

  // Get content based on variant
  const renderButtonContent = useCallback(() => {
    const content = (
      <>
        {loading ? (
          <ActivityIndicator color={getTextColor()} size="small" />
        ) : (
          <>
            {leftIcon && <span style={styles.leftIcon}>{leftIcon}</span>}
            <Text
              style={[
                styles.text,
                { color: getTextColor(), fontSize: getTextSize() },
                textStyle,
              ]}
            >
              {title}
            </Text>
            {rightIcon && <span style={styles.rightIcon}>{rightIcon}</span>}
          </>
        )}
      </>
    );

    // Return content wrapped in appropriate container based on variant
    if (variant === "gradient") {
      return (
        <LinearGradient
          colors={gradientColors || [theme.primaryLight, theme.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientContainer, getButtonSize()]}
        >
          {content}
        </LinearGradient>
      );
    }

    if (variant === "glass") {
      return (
        <BlurView
          intensity={80}
          tint="default"
          style={[styles.glassContainer, getButtonSize()]}
        >
          {content}
        </BlurView>
      );
    }

    return content;
  }, [
    loading,
    leftIcon,
    rightIcon,
    getTextColor,
    getTextSize,
    textStyle,
    variant,
    gradientColors,
    getButtonSize,
    theme,
  ]);

  // Disable button if loading or disabled
  const isButtonDisabled = loading || disabled;

  return (
    <Animated.View
      style={[
        withAnimation && animationType === "scale" ? animatedStyle : null,
        hasShadow ? getShadowStyle() : null,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isButtonDisabled}
        style={({ pressed }) => [
          styles.button,
          getButtonStyle(),
          getButtonSize(),
          {
            opacity:
              withAnimation && animationType === "opacity" && pressed
                ? 0.7
                : isButtonDisabled
                  ? 0.5
                  : 1,
          },
          style,
        ]}
      >
        {renderButtonContent()}
      </Pressable>
    </Animated.View>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(Button);

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  gradientContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  glassContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
});
