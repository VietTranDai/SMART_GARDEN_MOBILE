import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  SharedValue,
} from "react-native-reanimated";
import PropTypes from 'prop-types';

interface SkeletonPlaceholderProps {
  children?: React.ReactNode;
  backgroundColor?: string;
  highlightColor?: string;
  speed?: number;
}

interface ItemProps {
  width?: number | string;
  height?: number | string;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  margin?: number;
  borderRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  flexDirection?: "row" | "column";
  padding?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  position?: "absolute" | "relative";
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  children?: React.ReactNode;
}

// Define the context type properly
interface SkeletonContextType {
  backgroundColor: string;
  highlightColor: string;
  animatedStyle: {
    opacity?: SharedValue<number> | number;
  };
}

const SkeletonItem: React.FC<ItemProps> = ({ children, ...restProps }) => {
  // Create a context to get the parent's background and highlight colors
  const context = React.useContext(SkeletonContext);

  if (!children) {
    // This is an actual skeleton item that should animate
    return (
      <Animated.View
        style={[
          restProps as ViewStyle,
          styles.skeletonItem,
          { backgroundColor: context.backgroundColor },
          context.animatedStyle,
        ]}
      />
    );
  }

  // This is a container, pass down the context
  return <View style={restProps as ViewStyle}>{children}</View>;
};

// Create a context to share animation and colors
const SkeletonContext = React.createContext<SkeletonContextType>({
  backgroundColor: "#E1E9EE",
  highlightColor: "#F2F8FC",
  animatedStyle: {},
});

const SkeletonPlaceholder: React.FC<SkeletonPlaceholderProps> & {
  Item: typeof SkeletonItem;
} = ({
  children,
  backgroundColor = "#E1E9EE",
  highlightColor = "#F2F8FC",
  speed = 1000,
}) => {
  // Animation setup
  const opacity = useSharedValue(0.5);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: speed }),
        withTiming(0.5, { duration: speed })
      ),
      -1,
      true
    );
  }, [speed, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  // Create the context value
  const contextValue = React.useMemo(
    () => ({
      backgroundColor,
      highlightColor,
      animatedStyle,
    }),
    [backgroundColor, highlightColor, animatedStyle]
  );

  return (
    <SkeletonContext.Provider value={contextValue}>
      {children}
    </SkeletonContext.Provider>
  );
};

// Add PropTypes validation
SkeletonPlaceholder.propTypes = {
  children: PropTypes.node,
  backgroundColor: PropTypes.string,
  highlightColor: PropTypes.string,
  speed: PropTypes.number,
};

// Attach Item component to SkeletonPlaceholder
SkeletonPlaceholder.Item = SkeletonItem;

const styles = StyleSheet.create({
  skeletonItem: {
    overflow: "hidden",
  },
});

export default SkeletonPlaceholder;