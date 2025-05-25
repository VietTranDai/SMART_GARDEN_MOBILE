import { useRef, useEffect } from "react";
import { Animated, ViewStyle } from "react-native";

/**
 * Hook để quản lý hiệu ứng animate cho các section trong HomeScreen
 *
 * @param sectionName Tên của section để theo dõi animation riêng biệt
 * @param delay Độ trễ trước khi bắt đầu animation (ms)
 * @returns Animated ViewStyle cho section
 */
export default function useSectionAnimation(
  sectionName: string,
  delay: number = 0
) {
  // Animation refs
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  // Animation on mount
  useEffect(() => {
    const animationTimeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => {
      clearTimeout(animationTimeout);
    };
  }, [opacity, translateY, scale, delay]);

  // Animation style getter - fixed to use proper transform array structure
  const getAnimatedStyle = () => ({
    opacity,
    transform: [{ translateY: translateY }, { scale: scale }],
  });

  // Reset animation (for use when data changes)
  const resetAnimation = () => {
    opacity.setValue(0);
    translateY.setValue(20);
    scale.setValue(0.95);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return {
    getAnimatedStyle,
    resetAnimation,
    animations: {
      opacity,
      translateY,
      scale,
    },
  };
}
