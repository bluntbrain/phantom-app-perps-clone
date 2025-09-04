import React, { useEffect, useRef } from "react";
import { View, Image, Animated } from "react-native";
import { router } from "expo-router";
import { splashStyles as styles } from "../styles/screens/splashStyles";

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const entranceAnimation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]);

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    entranceAnimation.start(() => {
      pulseAnimation.start();
    });

    const timer = setTimeout(() => {
      router.replace("/home");
    }, 2000);

    return () => {
      clearTimeout(timer);
      pulseAnimation.stop();
    };
  }, [fadeAnim, scaleAnim, pulseAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
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
  );
}
