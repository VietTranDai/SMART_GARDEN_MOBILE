import React, { ReactNode, Component, ErrorInfo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/ui/useAppTheme";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isNetworkError: boolean;
}

class NetworkErrorBoundaryClass extends Component<
  Props & { theme: any },
  State
> {
  constructor(props: Props & { theme: any }) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isNetworkError: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true,
      error,
      isNetworkError:
        error.message.includes("network") ||
        error.message.includes("connection") ||
        error.message.includes("internet") ||
        error.message.includes("offline") ||
        error.message.includes("kết nối mạng"),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.log("Network Error Boundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, isNetworkError: false });
  };

  render() {
    const { hasError, error, isNetworkError } = this.state;
    const { children, fallback, theme } = this.props;

    if (hasError) {
      // If it's a network-related error, show our custom UI
      if (isNetworkError) {
        return (
          <View
            style={[styles.container, { backgroundColor: theme.background }]}
          >
            <View style={styles.content}>
              <Ionicons
                name="cloud-offline-outline"
                size={80}
                color={theme.primary}
                style={styles.icon}
              />
              <Text style={[styles.title, { color: theme.text }]}>
                Không có kết nối mạng
              </Text>
              <Text style={[styles.message, { color: theme.textSecondary }]}>
                Vui lòng kiểm tra kết nối internet của bạn và thử lại
              </Text>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary }]}
                onPress={this.handleRetry}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="refresh-outline"
                  size={20}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }

      // If it's not network-related, use the provided fallback or default error
      return (
        fallback || (
          <View
            style={[styles.container, { backgroundColor: theme.background }]}
          >
            <Text style={[styles.message, { color: theme.text }]}>
              Có lỗi xảy ra. Vui lòng thử lại sau.
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={this.handleRetry}
            >
              <Text style={styles.buttonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )
      );
    }

    return children;
  }
}

// Use function component as a wrapper to get access to theme
export default function NetworkErrorBoundary(props: Props) {
  const theme = useAppTheme();
  return <NetworkErrorBoundaryClass {...props} theme={theme} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
    maxWidth: "100%",
    padding: 16,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
