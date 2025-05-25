import React, { PropsWithChildren, useState } from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/ui/useAppTheme";

interface CollapsibleProps {
  title: string;
  initialOpen?: boolean;
  titleStyle?: object;
  contentStyle?: object;
}

export function Collapsible({
  children,
  title,
  initialOpen = false,
  titleStyle,
  contentStyle,
}: PropsWithChildren<CollapsibleProps>) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const theme = useAppTheme();

  return (
    <View>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isOpen ? "chevron-down" : "chevron-forward"}
          size={18}
          color={theme.primary}
          style={styles.icon}
        />

        <Text style={[styles.title, { color: theme.text }, titleStyle]}>
          {title}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View
          style={[
            styles.content,
            { borderLeftColor: theme.borderLight },
            contentStyle,
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    marginTop: 4,
    marginLeft: 26,
    paddingLeft: 12,
    borderLeftWidth: 1,
  },
});
