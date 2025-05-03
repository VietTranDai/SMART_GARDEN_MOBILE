import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@/contexts/UserContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useTheme } from "@/contexts/ThemeContext";

export default function AuthScreen() {
  const theme = useAppTheme();
  const { isDarkMode } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const styles = useMemo(() => createStyles(theme), [theme]);
  const { signIn } = useUser();

  const handleSignIn = async () => {
    if (!username || !password) {
      setErrorMessage("Vui lòng nhập tên đăng nhập và mật khẩu");
      return;
    }
    setErrorMessage("");
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await signIn({ username, password });
    } catch (error) {
      setErrorMessage(
        "Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!isLoading}
        >
          <View
            style={styles.logoContainer}
            pointerEvents={isLoading ? "none" : "auto"}
          >
            <Image
              source={require("@/assets/images/hcmut.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Khu vườn thông minh</Text>
            <Text style={styles.subtitle}>Chào mừng bạn trở lại!</Text>
          </View>

          <View
            style={styles.formCard}
            pointerEvents={isLoading ? "none" : "auto"}
          >
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên đăng nhập</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={theme.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập tên đăng nhập"
                  placeholderTextColor={theme.inputPlaceholder}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  keyboardType="default"
                  textContentType="username"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={theme.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor={theme.inputPlaceholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.showPasswordButton}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.forgotPasswordButton,
                isLoading && styles.disabledButton,
              ]}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.signInButton,
                isLoading && styles.signInButtonDisabled,
              ]}
              onPress={handleSignIn}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.signInButtonText}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>

          <View
            style={styles.footerContainer}
            pointerEvents={isLoading ? "none" : "auto"}
          >
            <Text style={styles.footerText}>
              Bạn chưa có tài khoản? Liên hệ quản trị viên qua{" "}
              <Text
                style={styles.linkText}
                onPress={() => {
                  console.log("mailto:viet.trankhmtbk22@hcmut.edu.vn");
                }}
              >
                viet.trankhmtbk22@hcmut.edu.vn
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      position: "relative",
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.3)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 24,
      justifyContent: "center",
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: 32,
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: 16,
    },
    title: {
      fontSize: 32,
      fontFamily: "Inter-Bold",
      color: theme.primary,
    },
    subtitle: {
      fontSize: 18,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginTop: 4,
    },
    formCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 2,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      marginBottom: 24,
      elevation: 2,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.text,
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.inputBackground,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      height: 48,
      paddingHorizontal: 16,
    },
    inputIcon: {
      marginRight: 8,
    },
    input: {
      flex: 1,
      fontSize: 16,
      fontFamily: "Inter-Regular",
      color: theme.text,
    },
    showPasswordButton: {
      padding: 8,
    },
    forgotPasswordButton: {
      alignSelf: "flex-end",
      marginBottom: 16,
    },
    forgotPasswordText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.primary,
    },
    disabledButton: {
      opacity: 0.6,
    },
    signInButton: {
      backgroundColor: theme.primary,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    signInButtonDisabled: {
      backgroundColor: theme.disabled,
    },
    signInButtonText: {
      fontSize: 16,
      fontFamily: "Inter-Bold",
      color: "#FFF",
    },
    errorText: {
      color: "#D32F2F",
      textAlign: "center",
      marginBottom: 12,
      fontFamily: "Inter-Regular",
    },
    footerContainer: {
      alignItems: "center",
    },
    footerText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    linkText: {
      color: theme.primary,
      textDecorationLine: "underline",
    },
  });
