import React, { useState, useMemo, useRef, useEffect } from "react";
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
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "@/contexts/UserContext";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { useTheme } from "@/contexts/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function AuthScreen() {
  const theme = useAppTheme();
  const { isDarkMode } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animate loading overlay
  useEffect(() => {
    if (isLoading) {
      Animated.timing(loadingOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(loadingOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading]);

  const styles = useMemo(() => createStyles(), []);
  const { signIn } = useUser();

  const handleSignIn = async () => {
    if (!username || !password) {
      setErrorMessage("Vui lòng nhập tên và mật khẩu");
      return;
    }
    setErrorMessage("");
    setIsLoading(true);
    
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await signIn({ username, password });
    } catch {
      setErrorMessage("Sai thông tin đăng nhập. Vui lòng kiểm tra lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#E8F5E9", "#FFFFFF"]}
      style={styles.gradientContainer}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <Animated.View 
        style={[
          styles.loadingOverlay,
          {
            opacity: loadingOpacity,
            pointerEvents: isLoading ? 'auto' : 'none'
          }
        ]}
      >
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Đang đăng nhập...</Text>
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{
              ...styles.logoContainer,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Image
              source={require("@/assets/images/hcmut.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Khu vườn thông minh</Text>
            <Text style={styles.subtitle}>Chào mừng bạn quay trở lại!</Text>
          </Animated.View>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View style={styles.formCard}>
              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tên đăng nhập</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#4CAF50"
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập tên đăng nhập"
                    placeholderTextColor="#A5D6A7"
                    value={username}
                    onChangeText={setUsername}
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
                    color="#4CAF50"
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor="#A5D6A7"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#4CAF50"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  onPress={handleSignIn}
                  style={[
                    styles.signInButton,
                    isLoading && styles.signInButtonLoading
                  ]}
                  disabled={isLoading}
                >
                  <View style={styles.signInButtonContent}>
                    {isLoading && (
                      <ActivityIndicator 
                        size="small" 
                        color="#FFF" 
                        style={styles.buttonSpinner}
                      />
                    )}
                    <Text style={[
                      styles.signInText,
                      isLoading && styles.signInTextLoading
                    ]}>
                      {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                Chưa có tài khoản? Liên hệ:{" "}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  /* handle contact action */
                }}
              >
                <Text style={styles.linkText}>
                  viet.trankhmtbk22@hcmut.edu.vn
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const createStyles = () =>
  StyleSheet.create({
    gradientContainer: { flex: 1 },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(232, 245, 233, 0.95)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    loadingContent: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFFFFF",
      paddingHorizontal: 32,
      paddingVertical: 24,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: "#2E7D32",
      fontWeight: "500",
    },
    flex: { flex: 1 },
    scrollContainer: {
      flexGrow: 1,
      padding: 24,
      justifyContent: "center",
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: 32,
    },
    logo: { width: 100, height: 100, marginBottom: 16 },
    title: { fontSize: 28, fontWeight: "700", color: "#2E7D32" },
    subtitle: { fontSize: 16, color: "#558B2F", marginTop: 4 },
    formCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, color: "#33691E", marginBottom: 6 },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F1F8E9",
      borderRadius: 8,
      paddingHorizontal: 12,
      height: 44,
      borderWidth: 1,
      borderColor: "#C5E1A5",
    },
    input: { flex: 1, fontSize: 16, color: "#2E7D32" },
    signInButton: {
      backgroundColor: "#4CAF50",
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
      marginTop: 8,
      minHeight: 44,
      justifyContent: "center",
    },
    signInButtonLoading: {
      backgroundColor: "#81C784",
    },
    signInButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    buttonSpinner: {
      marginRight: 8,
    },
    signInText: { 
      color: "#FFF", 
      fontSize: 16, 
      fontWeight: "600" 
    },
    signInTextLoading: {
      opacity: 0.8,
    },
    footerContainer: {
      alignItems: "center",
      marginTop: 20,
    },
    footerText: { fontSize: 14, color: "#558B2F", marginBottom: 4 },
    linkText: {
      fontSize: 14,
      color: "#33691E",
      textDecorationLine: "underline",
    },
    errorText: { color: "#D32F2F", textAlign: "center", marginBottom: 12 },
  });
