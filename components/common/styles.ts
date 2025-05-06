import { StyleSheet } from "react-native";

export const makeHomeStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    listContainer: {
      paddingBottom: 30,
    },
    section: {
      backgroundColor: theme.background,
      marginBottom: 8,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 12,
      marginBottom: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: "Inter-Bold",
      color: theme.text,
    },
    viewAllButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4,
      paddingHorizontal: 8,
      minWidth: 44,
      minHeight: 44,
      justifyContent: "center",
    },
    viewAllText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.primary,
      marginRight: 2,
    },
    horizontalListContainer: {
      paddingHorizontal: 20,
      paddingVertical: 8,
    },
    horizontalSeparator: {
      width: 12,
    },

    // EmptyState Components
    emptyState: {
      height: 170,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      marginHorizontal: 20,
      backgroundColor: theme.cardAlt,
      marginTop: 10,
      ...theme.elevation1,
    },
    emptyStateText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      textAlign: "center",
      marginTop: 12,
      marginBottom: 16,
    },
    emptyStateButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      minWidth: 44,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyStateButtonText: {
      fontFamily: "Inter-SemiBold",
      fontSize: 14,
    },

    // Error Components
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    errorText: {
      fontSize: 16,
      fontFamily: "Inter-Medium",
      textAlign: "center",
      marginTop: 16,
      marginBottom: 24,
    },
    retryButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 24,
      minWidth: 44,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    retryButtonText: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
    },

    // Gardens Components
    addGardenCard: {
      width: 240,
      height: 260,
      borderRadius: 16,
      borderWidth: 1.5,
      borderStyle: "dashed",
      borderColor: theme.border,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.cardAlt,
      margin: 6,
    },
    addGardenContent: {
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    addIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.primaryLight,
      marginBottom: 16,
    },
    addGardenText: {
      fontFamily: "Inter-SemiBold",
      fontSize: 16,
      color: theme.primary,
      textAlign: "center",
    },

    // Empty Gardens
    emptyGardensContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      margin: 20,
      borderRadius: 16,
    },
    emptyGardenImageContainer: {
      width: 150,
      height: 150,
      borderRadius: 75,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    emptyGardenTitle: {
      fontSize: 22,
      fontFamily: "Inter-Bold",
      marginBottom: 12,
    },
    emptyGardenDescription: {
      fontSize: 16,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      marginBottom: 24,
    },
    createGardenButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 24,
      backgroundColor: theme.primary,
    },
    createGardenText: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      marginLeft: 8,
    },

    // Header Components
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 15,
      paddingBottom: 16,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    appTitle: {
      fontSize: 20,
      fontFamily: "Inter-Bold",
      color: theme.text,
      marginBottom: 15,
    },
    greeting: {
      fontSize: 16,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    userName: {
      fontSize: 24,
      fontFamily: "Inter-Bold",
      color: theme.text,
      marginTop: 4,
    },
    notificationButton: {
      padding: 8,
      position: "relative",
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    notificationBadge: {
      position: "absolute",
      top: 10,
      right: 10,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.error,
    },

    // Weather and Tips Components
    weatherTipsContainer: {
      padding: 10,
    },
    tipSeparator: {
      height: 16,
    },

    // Footer
    footer: {
      paddingVertical: 20,
      alignItems: "center",
    },
    footerText: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
    },
  });
