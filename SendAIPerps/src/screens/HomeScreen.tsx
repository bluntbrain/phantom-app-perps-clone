import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../constants/colors';
import { spacing, fontSize, borderRadius } from '../constants/spacing';
import { haptics } from '../utils/haptics';
import { PerpsCard } from '../components/PerpsCard';
import { BottomNavigation } from '../components/BottomNavigation';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface PerpsData {
  id: string;
  rank: number;
  symbol: string;
  name: string;
  leverage: string;
  volume: string;
}

const mockPerpsData: PerpsData[] = [
  {
    id: '1',
    rank: 1,
    symbol: 'ETH-USD',
    name: 'Ethereum',
    leverage: '25x',
    volume: '$2B',
  },
  {
    id: '2',
    rank: 2,
    symbol: 'BTC-USD',
    name: 'Bitcoin',
    leverage: '40x',
    volume: '$1.7B',
  },
  {
    id: '3',
    rank: 3,
    symbol: 'SOL-USD',
    name: 'Solana',
    leverage: '20x',
    volume: '$670M',
  },
  {
    id: '4',
    rank: 4,
    symbol: 'HYPE-USD',
    name: 'Hyperliquid',
    leverage: '10x',
    volume: '$227M',
  },
  {
    id: '5',
    rank: 5,
    symbol: 'XRP-USD',
    name: 'Ripple',
    leverage: '20x',
    volume: '$94M',
  },
  {
    id: '6',
    rank: 6,
    symbol: 'IP-USD',
    name: 'Internet Protocol',
    leverage: '3x',
    volume: '$68M',
  },
  {
    id: '7',
    rank: 7,
    symbol: 'PUMP-USD',
    name: 'Pump',
    leverage: '5x',
    volume: '$60M',
  },
  {
    id: '8',
    rank: 8,
    symbol: 'DOGE-USD',
    name: 'Dogecoin',
    leverage: '10x',
    volume: '$48M',
  },
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState<'Volume' | '24h'>(
    'Volume',
  );

  const handleFilterPress = (filter: 'Volume' | '24h') => {
    haptics.selection();
    setSelectedFilter(filter);
  };

  const handlePerpsPress = (item: PerpsData) => {
    haptics.medium();
    navigation.navigate('Trading', {
      symbol: item.symbol,
      name: item.name,
    });
  };

  const renderPerpsItem = ({ item }: { item: PerpsData }) => (
    <PerpsCard
      rank={item.rank}
      symbol={item.symbol}
      leverage={item.leverage}
      volume={item.volume}
      onPress={() => handlePerpsPress(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Perps</Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'Volume' && styles.filterButtonActive,
          ]}
          onPress={() => handleFilterPress('Volume')}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === 'Volume' && styles.filterTextActive,
            ]}
          >
            Volume
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === '24h' && styles.filterButtonActive,
          ]}
          onPress={() => handleFilterPress('24h')}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === '24h' && styles.filterTextActive,
            ]}
          >
            24h
          </Text>
        </TouchableOpacity>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <View style={styles.tableHeaderLeft}>
          <Text style={styles.tableHeaderText}>#</Text>
          <Text style={[styles.tableHeaderText, { marginLeft: spacing.xl }]}>
            Perps
          </Text>
        </View>
        <Text style={styles.tableHeaderText}>
          Volume <Text style={styles.sortIcon}>↓</Text>
        </Text>
      </View>

      {/* Perps List */}
      <FlatList
        data={mockPerpsData}
        renderItem={renderPerpsItem}
        keyExtractor={item => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="home" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  title: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
  },
  filterButtonActive: {
    backgroundColor: colors.background.tertiary,
  },
  filterText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.text.primary,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  tableHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableHeaderText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  sortIcon: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
  },
  list: {
    flex: 1,
  },
});
