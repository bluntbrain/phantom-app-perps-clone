import HapticFeedback from 'react-native-haptic-feedback';

// Configure haptic options
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const haptics = {
  light: () => {
    HapticFeedback.trigger('impactLight', hapticOptions);
  },
  medium: () => {
    HapticFeedback.trigger('impactMedium', hapticOptions);
  },
  heavy: () => {
    HapticFeedback.trigger('impactHeavy', hapticOptions);
  },
  selection: () => {
    HapticFeedback.trigger('selection', hapticOptions);
  },
  success: () => {
    HapticFeedback.trigger('notificationSuccess', hapticOptions);
  },
  warning: () => {
    HapticFeedback.trigger('notificationWarning', hapticOptions);
  },
  error: () => {
    HapticFeedback.trigger('notificationError', hapticOptions);
  },
};
