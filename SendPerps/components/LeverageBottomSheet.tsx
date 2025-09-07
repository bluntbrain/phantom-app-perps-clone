import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  ScrollView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "../constants/colors";
import { spacing, fontSize, borderRadius } from "../constants/spacing";

interface LeverageBottomSheetProps {
  visible: boolean;
  currentLeverage: string;
  onClose: () => void;
  onSelectLeverage: (leverage: string) => void;
}

const { width, height } = Dimensions.get("window");
const SHEET_HEIGHT = height * 0.55; // Increased height to ensure button visibility
const ITEM_WIDTH = 50;
const SIDE_PADDING = width / 2 - ITEM_WIDTH / 2;

export const LeverageBottomSheet: React.FC<LeverageBottomSheetProps> = ({
  visible,
  currentLeverage,
  onClose,
  onSelectLeverage,
}) => {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedLeverage, setSelectedLeverage] = useState(currentLeverage);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Leverage options from 1x to 100x with popular increments
  const leverageOptions = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30, 40, 50, 75, 100,
  ];

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > SHEET_HEIGHT * 0.3) {
          hideSheet();
        } else {
          showSheet();
        }
      },
    })
  ).current;

  const showSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, backdropOpacity]);

  const hideSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start((finished) => {
      // only call onClose if animation completed successfully
      if (finished) {
        onClose();
      }
    });
  }, [translateY, backdropOpacity, onClose]);

  useEffect(() => {
    if (visible) {
      const currentNum = parseInt(currentLeverage.replace("x", ""));
      setSelectedLeverage(`${currentNum}x`);
      showSheet();

      // scroll to current position after animation
      setTimeout(() => {
        const currentIndex = leverageOptions.findIndex(
          (opt) => opt === currentNum
        );
        if (currentIndex >= 0 && scrollViewRef.current) {
          const scrollPosition = currentIndex * ITEM_WIDTH;
          scrollViewRef.current.scrollTo({ x: scrollPosition, animated: true });
        }
      }, 350);
    }
  }, [visible, currentLeverage, showSheet]);

  // initialize animation values only once
  useEffect(() => {
    // set initial hidden state
    translateY.setValue(SHEET_HEIGHT);
    backdropOpacity.setValue(0);
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const onScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_WIDTH);
    const clampedIndex = Math.max(
      0,
      Math.min(index, leverageOptions.length - 1)
    );
    const newLeverage = leverageOptions[clampedIndex];

    if (newLeverage && `${newLeverage}x` !== selectedLeverage) {
      Haptics.selectionAsync();
      setSelectedLeverage(`${newLeverage}x`);
    }

    // snap to exact position
    const snapX = clampedIndex * ITEM_WIDTH;
    scrollViewRef.current?.scrollTo({ x: snapX, animated: true });
  };

  const scrollToLeverage = (leverage: number) => {
    const index = leverageOptions.findIndex((opt) => opt === leverage);
    if (index >= 0 && scrollViewRef.current) {
      const scrollPosition = index * ITEM_WIDTH;
      scrollViewRef.current.scrollTo({ x: scrollPosition, animated: true });
      setSelectedLeverage(`${leverage}x`);
      Haptics.selectionAsync();
    }
  };

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectLeverage(selectedLeverage);
    hideSheet();
  };

  const renderLeverageItem = (leverage: number, index: number) => {
    // calculate scale and opacity based on scroll position
    const inputRange = [
      (index - 2) * ITEM_WIDTH,
      (index - 1) * ITEM_WIDTH,
      index * ITEM_WIDTH,
      (index + 1) * ITEM_WIDTH,
      (index + 2) * ITEM_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 0.85, 1, 0.85, 0.7],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 0.6, 1, 0.6, 0.3],
      extrapolate: "clamp",
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [20, 10, 0, 10, 20],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity
        key={leverage}
        style={styles.leverageItem}
        onPress={() => scrollToLeverage(leverage)}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.leverageContent,
            {
              transform: [{ scale }, { translateY }],
              opacity,
            },
          ]}
        >
          <Text style={styles.leverageNumber}>{leverage}</Text>
          <Text style={styles.leverageX}>x</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={hideSheet}
      animationType="none"
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity
          style={styles.backdropTouch}
          onPress={hideSheet}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Select Leverage</Text>
          <Text style={styles.subtitle}>Slide to adjust leverage amount</Text>
        </View>

        {/* Current Selection Display */}
        <View style={styles.currentDisplay}>
          <Text style={styles.currentValue}>
            {parseInt(selectedLeverage.replace("x", ""))}
          </Text>
          <Text style={styles.currentX}>x</Text>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => scrollToLeverage(1)}
          >
            <Text style={styles.quickButtonText}>1x</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => scrollToLeverage(5)}
          >
            <Text style={styles.quickButtonText}>5x</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => scrollToLeverage(10)}
          >
            <Text style={styles.quickButtonText}>10x</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => scrollToLeverage(25)}
          >
            <Text style={styles.quickButtonText}>25x</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => scrollToLeverage(100)}
          >
            <Text style={styles.quickButtonText}>100x</Text>
          </TouchableOpacity>
        </View>

        {/* Leverage Slider */}
        <View style={styles.sliderContainer}>
          {/* Center indicator line */}
          <View style={styles.centerLine} />

          <Animated.ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: SIDE_PADDING,
            }}
            snapToInterval={ITEM_WIDTH}
            decelerationRate="fast"
            snapToAlignment="center"
            scrollEventThrottle={16}
            onScroll={handleScroll}
            onMomentumScrollEnd={onScrollEnd}
            onScrollEndDrag={onScrollEnd}
            bounces={false}
          >
            {leverageOptions.map(renderLeverageItem)}
          </Animated.ScrollView>
        </View>

        {/* Done Button - Fixed position */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Set Leverage</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = {
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  backdropTouch: {
    flex: 1,
  },
  container: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    flexDirection: "column" as const,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.text.secondary,
    borderRadius: 2,
    alignSelf: "center" as const,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: "center" as const,
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  currentDisplay: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    justifyContent: "center" as const,
    marginBottom: spacing.lg,
  },
  currentValue: {
    color: colors.text.primary,
    fontSize: 52,
    fontWeight: "200" as const,
    fontFamily: "monospace",
  },
  currentX: {
    color: colors.text.secondary,
    fontSize: fontSize.xl,
    fontWeight: "400" as const,
    marginLeft: 4,
  },
  quickActions: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  quickButton: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    minWidth: 40,
    alignItems: "center" as const,
  },
  quickButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.sm,
    fontWeight: "500" as const,
  },
  sliderContainer: {
    height: 80,
    flex: 1,
    justifyContent: "center" as const,
    position: "relative" as const,
    marginBottom: spacing.sm,
  },
  centerLine: {
    position: "absolute" as const,
    left: width / 2 - 1,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.accent.purple,
    zIndex: 1,
    borderRadius: 1,
  },
  leverageItem: {
    width: ITEM_WIDTH,
    height: 80,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  leverageContent: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  leverageNumber: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: "600" as const,
    fontFamily: "monospace",
  },
  leverageX: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: "400" as const,
    marginTop: 2,
  },
  buttonContainer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  doneButton: {
    backgroundColor: colors.accent.purple,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center" as const,
    minHeight: 50,
  },
  doneButtonText: {
    color: colors.text.black,
    fontSize: fontSize.lg,
    fontWeight: "600" as const,
  },
};
