import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Text,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

type OnboardingButtonProps = {
  scrollTo: () => void;
  percentage: number;
  isLastSlide: boolean;
};

export function OnboardingButton({
  scrollTo,
  percentage,
  isLastSlide,
}: OnboardingButtonProps) {
  const size = 70;
  const strokeWidth = 4;
  const center = size / 2;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  const progressAnimation = useRef(new Animated.Value(0)).current;
  const strokeDashoffsetRef = useRef(new Animated.Value(circumference)).current;

  // Progress animation
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: percentage,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease),
    }).start();
  }, [percentage, progressAnimation]);

  // Update the stroke dash offset based on the animation value
  useEffect(() => {
    const listenerId = progressAnimation.addListener(({ value }) => {
      const strokeDashoffset = circumference - circumference * value;
      strokeDashoffsetRef.setValue(strokeDashoffset);
    });

    return () => {
      progressAnimation.removeListener(listenerId);
    };
  }, [circumference, progressAnimation, strokeDashoffsetRef]);

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={scrollTo}
        activeOpacity={0.8}
        style={styles.button}
      >
        <View style={styles.buttonContent}>
          {isLastSlide ? (
            <Text style={styles.buttonText}>Get Started</Text>
          ) : (
            <Feather name="arrow-right" size={32} color="#fff" />
          )}
        </View>

        <Svg width={size} height={size} style={styles.svg}>
          <Circle
            stroke="#E6E7E8"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <AnimatedCircle
            stroke="#FF6B00"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffsetRef}
            fill="transparent"
            strokeLinecap="round"
            rotation="-90"
            origin={`${center}, ${center}`}
          />
        </Svg>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    position: "relative",
    width: 70,
    height: 70,
    backgroundColor: "#FF6B00",
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Inter-Bold",
  },
});
