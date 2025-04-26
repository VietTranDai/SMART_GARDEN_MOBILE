import { View, type ViewProps } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";

export type ThemedViewProps = ViewProps & {
  variant?:
    | "default"
    | "secondary"
    | "tertiary"
    | "card"
    | "cardAlt"
    | "elevated";
};

export function ThemedView({
  style,
  variant = "default",
  ...otherProps
}: ThemedViewProps) {
  const theme = useAppTheme();

  // Get background color based on variant
  const getBackgroundColor = () => {
    switch (variant) {
      case "default":
        return theme.background;
      case "secondary":
        return theme.backgroundSecondary;
      case "tertiary":
        return theme.backgroundTertiary;
      case "card":
        return theme.card;
      case "cardAlt":
        return theme.cardAlt;
      case "elevated":
        return theme.backgroundElevated;
      default:
        return theme.background;
    }
  };

  // Get shadow styles for elevated variant
  const getShadowStyles = () => {
    if (variant === "elevated") {
      return {
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      };
    }
    return {};
  };

  return (
    <View
      style={[
        { backgroundColor: getBackgroundColor() },
        getShadowStyles(),
        style,
      ]}
      {...otherProps}
    />
  );
}
