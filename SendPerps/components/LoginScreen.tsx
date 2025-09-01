import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { useLogin } from "@privy-io/expo/ui";

const { width } = Dimensions.get("window");

const colors = {
  background: {
    primary: "#000000",
    secondary: "#1a1a1a",
    tertiary: "#2a2a2a",
    card: "#1e1e1e",
  },
  text: {
    primary: "#ffffff",
    secondary: "#a0a0a0",
    tertiary: "#666666",
    accent: "#8b5cf6",
  },
  accent: {
    purple: "#8b5cf6",
    green: "#10b981",
    red: "#ef4444",
  },
  border: {
    primary: "#333333",
    secondary: "#444444",
  },
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useLogin();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Pulse animation for logo
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Initial entrance animation
    const entranceAnimation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    entranceAnimation.start(() => {
      pulseAnimation.start();
    });

    return () => {
      pulseAnimation.stop();
    };
  }, [fadeAnim, scaleAnim, pulseAnim, slideAnim]);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError("");
      await login({ loginMethods: ["email"] });
    } catch (err: any) {
      setError("Login failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Title Section */}
        <View style={styles.headerSection}>
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: Animated.multiply(scaleAnim, pulseAnim) },
                  { translateY: slideAnim },
                ],
              },
            ]}
          >
            <View style={styles.logoWrapper}>
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </Animated.View>
        </View>

        {/* Login Button */}
        <View style={styles.loginSection}>
          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              {isLoading ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color={colors.text.primary}
                    style={styles.loadingSpinner}
                  />
                  <Text style={styles.loginButtonText}>Connecting...</Text>
                </>
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </View>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Secure wallet authentication powered by Privy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  headerSection: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  logoWrapper: {
    padding: spacing.lg,
    borderRadius: width * 0.15,
    backgroundColor: colors.background.secondary,
    shadowColor: colors.accent.purple,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  logo: {
    width: width * 0.6,
    height: width * 0.6,
    maxWidth: 240,
    maxHeight: 240,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: spacing.md,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
  loginSection: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  loginButton: {
    backgroundColor: colors.accent.purple,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    minWidth: 280,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.accent.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  loadingSpinner: {
    marginRight: spacing.sm,
  },
  errorText: {
    color: colors.accent.red,
    fontSize: 14,
    marginTop: spacing.md,
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    paddingBottom: spacing.lg,
  },
  footerText: {
    color: colors.text.tertiary,
    fontSize: 14,
    textAlign: "center",
  },
});
