import React from "react";
import { Text, type TextProps, StyleSheet } from "react-native";
import { useAppTheme } from "@/hooks/ui/useAppTheme";

export type ThemedTextProps = TextProps & {
  type?:
    | "default"
    | "title"
    | "heading"
    | "subtitle"
    | "small"
    | "link"
    | "semibold"
    | "caption";
};

export function ThemedText({
  style,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const theme = useAppTheme();

  // Get text color based on type
  const getTextColor = () => {
    switch (type) {
      case "title":
      case "heading":
      case "default":
      case "semibold":
        return theme.text;
      case "subtitle":
        return theme.textSecondary;
      case "small":
      case "caption":
        return theme.textTertiary;
      case "link":
        return theme.textLink;
      default:
        return theme.text;
    }
  };

  return (
    <Text
      style={[
        { color: getTextColor() },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "heading" ? styles.heading : undefined,
        type === "semibold" ? styles.semibold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "small" ? styles.small : undefined,
        type === "caption" ? styles.caption : undefined,
        type === "link" ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    lineHeight: 34,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    lineHeight: 28,
  },
  semibold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    textDecorationLine: "underline",
  },
});
