import { useEffect } from "react";
import { Animated, Easing, EasingFunction } from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withDelay,
} from "react-native-reanimated";

/**
 * Animation Types
 */
export type AnimationType =
  | "fade"
  | "scale"
  | "slide"
  | "rotate"
  | "pulse"
  | "bounce";

export type AnimationDirection = "up" | "down" | "left" | "right";

/**
 * Animation Options
 */
interface AnimationOptions {
  duration?: number;
  delay?: number;
  easing?: EasingFunction;
  useNativeDriver?: boolean;
  repeat?: number;
  direction?: AnimationDirection;
  initialValue?: number;
  toValue?: number;
}

/**
 * Default animation options
 */
const defaultOptions: AnimationOptions = {
  duration: 300,
  delay: 0,
  easing: Easing.ease,
  useNativeDriver: true,
  repeat: 0,
  initialValue: 0,
  toValue: 1,
};

/**
 * Hook for creating various animations
 */
const useAnimation = (type: AnimationType, options: AnimationOptions = {}) => {
  // Merge default options with provided options
  const config = { ...defaultOptions, ...options };

  // Create animated value
  const animatedValue = new Animated.Value(config.initialValue!);

  // Create shared value for Reanimated
  const sharedValue = useSharedValue(config.initialValue!);

  // Start the animation
  const startAnimation = () => {
    // Reset value to initial
    animatedValue.setValue(config.initialValue!);
    sharedValue.value = config.initialValue!;

    // Create animation
    let animation;

    // Using Animated API
    if (config.repeat && config.repeat > 0) {
      animation = Animated.loop(
        Animated.timing(animatedValue, {
          toValue: config.toValue!,
          duration: config.duration,
          delay: config.delay,
          easing: config.easing,
          useNativeDriver: !!config.useNativeDriver,
        }),
        { iterations: config.repeat }
      );
    } else {
      animation = Animated.timing(animatedValue, {
        toValue: config.toValue!,
        duration: config.duration,
        delay: config.delay,
        easing: config.easing,
        useNativeDriver: !!config.useNativeDriver,
      });
    }

    // Start animation
    animation.start();

    // Using Reanimated API
    if (config.repeat && config.repeat > 0) {
      sharedValue.value = withRepeat(
        withDelay(
          config.delay || 0,
          withTiming(config.toValue!, { duration: config.duration })
        ),
        config.repeat,
        true
      );
    } else {
      sharedValue.value = withDelay(
        config.delay || 0,
        withTiming(config.toValue!, { duration: config.duration })
      );
    }
  };

  // Stop animation
  const stopAnimation = () => {
    animatedValue.stopAnimation();
  };

  // Create animation styles based on type
  const getAnimatedStyle = () => {
    switch (type) {
      case "fade":
        return {
          opacity: animatedValue,
        };
      case "scale":
        return {
          transform: [{ scale: animatedValue }],
        };
      case "slide": {
        const direction = config.direction || "right";
        let transformValue = {};

        switch (direction) {
          case "up": {
            const translateY = animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0],
            });
            transformValue = { transform: [{ translateY }] };
            break;
          }
          case "down": {
            const translateY = animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [-100, 0],
            });
            transformValue = { transform: [{ translateY }] };
            break;
          }
          case "left": {
            const translateX = animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0],
            });
            transformValue = { transform: [{ translateX }] };
            break;
          }
          case "right": {
            const translateX = animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [-100, 0],
            });
            transformValue = { transform: [{ translateX }] };
            break;
          }
        }

        return transformValue;
      }
      case "rotate":
        return {
          transform: [
            {
              rotate: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "360deg"],
              }),
            },
          ],
        };
      case "pulse":
        return {
          transform: [{ scale: animatedValue }],
        };
      case "bounce":
        return {
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                outputRange: [0, -10, -15, -10, -5, 0],
              }),
            },
          ],
        };
      default:
        return {};
    }
  };

  // Create Reanimated animation styles
  const getReanimatedStyle = useAnimatedStyle(() => {
    switch (type) {
      case "fade":
        return {
          opacity: sharedValue.value,
        };
      case "scale":
        return {
          transform: [{ scale: sharedValue.value }],
        };
      case "rotate":
        return {
          transform: [
            {
              rotate: `${sharedValue.value * 360}deg`,
            },
          ],
        };
      case "pulse":
        return {
          transform: [{ scale: sharedValue.value }],
        };
      default:
        return {};
    }
  });

  // Auto-start animation on mount
  useEffect(() => {
    startAnimation();
    return () => {
      stopAnimation();
    };
  }, []);

  return {
    animatedValue,
    sharedValue,
    animatedStyle: getAnimatedStyle(),
    reanimatedStyle: getReanimatedStyle,
    startAnimation,
    stopAnimation,
  };
};

export default useAnimation;
