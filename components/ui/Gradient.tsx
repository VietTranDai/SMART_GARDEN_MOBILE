import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

type GradientDirection = "vertical" | "horizontal" | "diagonal";

interface GradientProps {
  colors: string[];
  style?: ViewStyle;
  direction?: GradientDirection;
  locations?: number[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  children?: React.ReactNode;
}

/**
 * A custom Gradient component that works as a replacement for LinearGradient
 * when it causes compatibility issues with React Native.
 */
export const Gradient: React.FC<GradientProps> = ({
  colors,
  style,
  direction = "vertical",
  children,
}) => {
  if (!colors || colors.length === 0) {
    return <View style={style}>{children}</View>;
  }

  if (colors.length === 1) {
    return (
      <View style={[style, { backgroundColor: colors[0] }]}>{children}</View>
    );
  }

  // For simplicity, we'll handle the common case of having two colors
  // We can extend this for more colors if needed
  const color1 = colors[0] || "transparent";
  const color2 = colors[colors.length - 1] || "transparent";

  let gradientStyle: ViewStyle = {};

  switch (direction) {
    case "horizontal":
      gradientStyle = {
        borderLeftWidth: "50%",
        borderRightWidth: "50%",
        borderLeftColor: color1,
        borderRightColor: color2,
      };
      break;
    case "diagonal":
      // For diagonal gradients, we'll use a background overlay approach
      gradientStyle = {
        backgroundColor: color1,
        position: "relative",
        overflow: "hidden",
      };
      break;
    case "vertical":
    default:
      gradientStyle = {
        backgroundColor: color1,
      };

      if (colors[0] === "transparent" && colors[1] !== "transparent") {
        // Common overlay gradient from transparent to color
        gradientStyle = {
          backgroundColor: "transparent",
          borderBottomWidth: style?.height || "100%",
          borderBottomColor: color2,
        };
      } else if (colors[0] !== "transparent" && colors[1] === "transparent") {
        // Common overlay gradient from color to transparent
        gradientStyle = {
          backgroundColor: "transparent",
          borderTopWidth: style?.height || "100%",
          borderTopColor: color1,
        };
      } else {
        // Direct overlay approach
        gradientStyle = {
          backgroundColor: color1,
        };
      }
      break;
  }

  return (
    <View style={[styles.container, style, gradientStyle]}>
      {direction === "diagonal" && (
        <View
          style={[
            styles.diagonal,
            {
              backgroundColor: color2,
            },
          ]}
        />
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  diagonal: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    bottom: 0,
    transform: [{ rotate: "45deg" }],
  },
});

export default Gradient;
