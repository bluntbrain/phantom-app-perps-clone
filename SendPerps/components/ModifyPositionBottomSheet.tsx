import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import * as Haptics from "expo-haptics";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ModifyPositionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onAddToPosition: () => void;
  onReducePosition: () => void;
}

export function ModifyPositionBottomSheet({
  visible,
  onClose,
  onAddToPosition,
  onReducePosition,
}: ModifyPositionBottomSheetProps) {
  const handleAddToPosition = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddToPosition();
  };

  const handleReducePosition = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onReducePosition();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.container} onPress={() => {}}>
          {/* Handle Bar */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Modify Position</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleAddToPosition}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <Ionicons name="add" size={24} color={colors.text.secondary} />
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Add to Position</Text>
                  <Text style={styles.optionDescription}>
                    Increase your position size
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.text.primary}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleReducePosition}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <Ionicons
                  name="remove"
                  size={24}
                  color={colors.text.secondary}
                />
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Reduce Position</Text>
                  <Text style={styles.optionDescription}>
                    Decrease your position size
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.text.primary}
              />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = {
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end" as const,
  },
  container: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    minHeight: SCREEN_HEIGHT * 0.35,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.text.secondary,
    borderRadius: 2,
    alignSelf: "center" as const,
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: "600" as const,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    marginHorizontal: 8,
    paddingVertical: 2,
  },
  optionButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 16,
  },
  optionContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  optionTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  optionTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "500" as const,
    marginBottom: 4,
  },
  optionDescription: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.primary,
    marginVertical: 8,
  },
};
