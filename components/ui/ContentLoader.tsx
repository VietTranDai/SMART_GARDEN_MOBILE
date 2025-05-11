import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, {
  Rect as SvgRect,
  ClipPath,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface RectProps {
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
  ry?: number;
}

export const Rect = ({
  x,
  y,
  width,
  height,
  rx = 0,
  ry = 0,
}: RectProps): JSX.Element => {
  return <SvgRect x={x} y={y} width={width} height={height} rx={rx} ry={ry} />;
};

interface ContentLoaderProps {
  width: number;
  height: number;
  speed?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  children: React.ReactNode;
}

const ContentLoader = ({
  width,
  height,
  speed = 2,
  backgroundColor = "#f3f3f3",
  foregroundColor = "#ecebeb",
  children,
}: ContentLoaderProps): JSX.Element => {
  const animatedValue = useSharedValue(0);

  React.useEffect(() => {
    animatedValue.value = withRepeat(
      withTiming(1, { duration: 1000 / speed }),
      -1,
      true
    );
  }, [speed, animatedValue]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: animatedValue.value * width * -1 }],
    };
  });

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <ClipPath id="clip">{children}</ClipPath>
          <LinearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={backgroundColor} stopOpacity="1" />
            <Stop offset="0.5" stopColor={foregroundColor} stopOpacity="1" />
            <Stop offset="1" stopColor={backgroundColor} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <SvgRect
          x="0"
          y="0"
          width={width}
          height={height}
          clipPath="url(#clip)"
          fill="url(#gradient)"
        />
        <Animated.View style={[{ width: width * 3 }, animatedStyle]}>
          <SvgRect
            x="0"
            y="0"
            width={width * 3}
            height={height}
            clipPath="url(#clip)"
            fill="url(#gradient)"
          />
        </Animated.View>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
});

export default ContentLoader;
