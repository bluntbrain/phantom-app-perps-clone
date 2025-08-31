import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { haptics } from '../utils/haptics';

interface BottomNavigationProps {
  activeTab?: 'home' | 'refresh' | 'history' | 'search';
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab = 'home',
}) => {
  const handleTabPress = (tab: string) => {
    haptics.light();
    console.log(`Pressed ${tab} tab`);
  };

  const getIconColor = (tab: string) => {
    return activeTab === tab ? colors.text.primary : colors.text.secondary;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handleTabPress('home')}
      >
        <Icon name="home" size={24} color={getIconColor('home')} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handleTabPress('refresh')}
      >
        <Icon name="refresh-cw" size={24} color={getIconColor('refresh')} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handleTabPress('history')}
      >
        <Icon name="clock" size={24} color={getIconColor('history')} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handleTabPress('search')}
      >
        <Icon name="search" size={24} color={getIconColor('search')} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    backgroundColor: colors.background.primary,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});
