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
import {
  leverageBottomSheetStyles as styles,
  LEVERAGE_SHEET_HEIGHT,
} from "../styles/components/leverageBottomSheetStyles";
import { spacing } from "@/constants/spacing";

interface LeverageBottomSheetProps {
  visible: boolean;
  currentLeverage: string;
  onClose: () => void;
  onSelectLeverage: (leverage: string) => void;
}

const { width } = Dimensions.get("window");
const SHEET_HEIGHT = LEVERAGE_SHEET_HEIGHT;

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

  // leverage options from 1x to 25x
  const leverageOptions = Array.from({ length: 25 }, (_, i) => `${i + 1}x`);

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
    ]).start(() => {
      onClose();
    });
  }, [translateY, backdropOpacity, onClose]);

  useEffect(() => {
    if (visible) {
      setSelectedLeverage(currentLeverage);
      showSheet();
      setTimeout(() => {
        const currentIndex = leverageOptions.findIndex(
          (opt) => opt === currentLeverage
        );
        if (currentIndex >= 0 && scrollViewRef.current) {
          const scrollPosition = Math.max(
            0,
            currentIndex * 40 - width / 2 + 20
          );
          scrollViewRef.current.scrollTo({ x: scrollPosition, animated: true });
        }
      }, 300);
    } else {
      translateY.setValue(SHEET_HEIGHT);
      backdropOpacity.setValue(0);
    }
  }, [
    visible,
    currentLeverage,
    leverageOptions,
    showSheet,
    translateY,
    backdropOpacity,
  ]);

  const handleScrollEnd = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const itemWidth = 40; // width of each item
    const paddingOffset = spacing.md; // left padding of content container

    // which item should be centered
    const centerPosition = scrollX + width / 2 - paddingOffset;
    const centerIndex = Math.round(centerPosition / itemWidth);
    const clampedIndex = Math.max(
      0,
      Math.min(centerIndex, leverageOptions.length - 1)
    );

    const newLeverage = leverageOptions[clampedIndex];
    if (newLeverage && newLeverage !== selectedLeverage) {
      Haptics.selectionAsync();
      setSelectedLeverage(newLeverage);
    }
  };

  const handleLeverageSelect = (leverage: string) => {
    Haptics.selectionAsync();
    setSelectedLeverage(leverage);

    // scroll to center the selected item
    if (scrollViewRef.current) {
      const leverageIndex = leverageOptions.findIndex(
        (opt) => opt === leverage
      );
      if (leverageIndex >= 0) {
        const itemWidth = 40;
        const scrollToX =
          leverageIndex * itemWidth - width / 2 + itemWidth / 2 + spacing.md;
        const clampedX = Math.max(
          0,
          Math.min(
            scrollToX,
            leverageOptions.length * itemWidth - width + spacing.md * 2
          )
        );
        scrollViewRef.current.scrollTo({ x: clampedX, animated: true });
      }
    }
  };

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectLeverage(selectedLeverage);
    hideSheet();
  };

  const renderLeverageItem = (leverage: string) => {
    const isSelected = leverage === selectedLeverage;
    const leverageNum = parseInt(leverage, 10);

    return (
      <TouchableOpacity
        key={leverage}
        style={[styles.leverageItem, isSelected && styles.selectedLeverageItem]}
        onPress={() => handleLeverageSelect(leverage)}
        activeOpacity={0.7}
      >
        <View style={styles.textContainer}>
          {!isSelected && (
            <Text style={styles.leverageText}>{leverageNum}</Text>
          )}
        </View>
        <View
          style={[
            styles.leverageIndicator,
            isSelected && styles.selectedIndicator,
          ]}
        />
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
          <Text style={styles.title}>Leverage</Text>
        </View>

        {/* Min/Max Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.minMaxButton}
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedLeverage("1x");
              // Scroll to position 1x - center the first item
              if (scrollViewRef.current) {
                const targetX = Math.max(0, -spacing.md);
                scrollViewRef.current.scrollTo({ x: targetX, animated: true });
              }
            }}
          >
            <Text style={styles.minMaxText}>Min</Text>
          </TouchableOpacity>

          <View style={styles.currentLeverageDisplay}>
            <Text style={styles.currentLeverageText}>
              {parseInt(selectedLeverage, 10)}x
            </Text>
          </View>

          <TouchableOpacity
            style={styles.minMaxButton}
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedLeverage("25x");
              if (scrollViewRef.current) {
                const itemWidth = 40;
                const totalWidth = leverageOptions.length * itemWidth;
                const maxScrollPosition = totalWidth - width / 2 - spacing.md;
                scrollViewRef.current.scrollTo({
                  x: maxScrollPosition,
                  animated: true,
                });
              }
            }}
          >
            <Text style={styles.minMaxText}>Max</Text>
          </TouchableOpacity>
        </View>

        {/* Leverage Slider */}
        <View style={styles.sliderContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sliderContent}
            snapToInterval={40}
            decelerationRate={0.98}
            snapToAlignment="center"
            scrollEventThrottle={16}
            onMomentumScrollEnd={handleScrollEnd}
            onScrollEndDrag={handleScrollEnd}
            bounces={false}
            directionalLockEnabled={true}
          >
            {leverageOptions.map(renderLeverageItem)}
          </ScrollView>
        </View>

        {/* Done Button */}
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};
