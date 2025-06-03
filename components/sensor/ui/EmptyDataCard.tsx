import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getEnhancedTheme } from "../utils";

interface EmptyDataCardProps {
  theme: ReturnType<typeof getEnhancedTheme>;
  message?: string;
}

export const EmptyDataCard: React.FC<EmptyDataCardProps> = ({
  theme,
  message = "Không có dữ liệu để hiển thị.",
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  return (
    <View style={styles.cardContentPlaceholder}>
      <Ionicons
        name="information-circle-outline"
        size={32}
        color={theme.textSecondary}
      />
      <Text style={[styles.infoText, { marginTop: 10, fontSize: 14 }]}>
        {message}
      </Text>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof getEnhancedTheme>) =>
  StyleSheet.create({
    cardContentPlaceholder: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 30,
      minHeight: 150,
    },
    infoText: {
      marginTop: 15,
      fontSize: 16,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
      textAlign: "center",
    },
  }); 