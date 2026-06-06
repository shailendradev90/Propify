import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PropertyCard } from '../../components/PropertyCard';
import { useAuth } from '../../context/AuthContext';
import { subscribeAvailable } from '../../services/properties';
import { colors, radius, spacing } from '../../theme';
import { ListingType, Property, PropertyType } from '../../types';

interface Props {
  navigation: any;
  route: any;
}

const PAGE_SIZE = 10;

const PropertiesListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { favorites, toggleFavorite } = useAuth();
  const category = route.params?.category as
    | {
        label: string;
        listingType?: ListingType;
        propertyType?: PropertyType;
      }
    | undefined;
  const [items, setItems] = useState<Property[]>([]);
  const [filters, setFilters] = useState({ 
    sectors: [],
    minPrice: 0,
    maxPrice: Number.MAX_VALUE,
    listingType: category?.listingType ?? 'all',
  });
  const [activeTab, setActiveTab] = useState<'all' | ListingType>(
    category?.listingType ?? 'all',
  );
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [page, setPage] = useState(1);

  // Listen for filter updates when returning from FiltersScreen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.filters) {
        setFilters(route.params.filters);
      }
    });
    return unsubscribe;
  }, [navigation, route.params?.filters]);

  useEffect(() => {
    setSelectedCategory(category);
    setActiveTab(category?.listingType ?? 'all');
    setPage(1);
  }, [category]);

  useEffect(() => {
    const unsub = subscribeAvailable(
      activeTab,
      setItems,
      selectedCategory?.propertyType,
    );
    return unsub;
  }, [activeTab, selectedCategory?.propertyType]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (selectedCategory?.propertyType && item.propertyType !== selectedCategory.propertyType) {
        return false;
      }
      
      // Filter by sectors if any are selected
      if (filters?.sectors && filters.sectors.length > 0) {
        if (!item.sector) return false;
        const itemSectorLower = item.sector.toLowerCase().trim();
        const matchesSector = filters.sectors.some(
          sector => itemSectorLower.includes(sector.toLowerCase().trim())
        );
        if (!matchesSector) return false;
      }

      // Filter by price range
      const isRent = item.listingType === 'rent';
      const priceToCheck = isRent ? item.pricePerMonth || item.price : item.price;
      
      if (filters?.minPrice && filters?.maxPrice) {
        // Convert filter values to actual rupees for comparison
        const minPriceInRupees = isRent ? (filters.minPrice * 1000) : (filters.minPrice * 100000);
        const maxPriceInRupees = isRent ? (filters.maxPrice * 1000) : (filters.maxPrice * 100000);
        
        if (priceToCheck < minPriceInRupees || priceToCheck > maxPriceInRupees) {
          return false;
        }
      }
      
      return true;
    });
  }, [items, selectedCategory?.propertyType, filters?.sectors, filters?.minPrice, filters?.maxPrice]);

  useEffect(() => {
    setPage(1);
  }, [filteredItems]);

  const pagedItems = filteredItems.slice(0, page * PAGE_SIZE);

  const loadMore = () => {
    if (page * PAGE_SIZE < filteredItems.length) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Properties</Text>
        <Pressable 
          onPress={() => navigation.navigate('Filters', { listingType: activeTab })}
          style={styles.iconButton}>
          <Ionicons name="options-outline" size={24} color={colors.text} />
        </Pressable>
        <Pressable style={styles.iconButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TabButton 
          label="All" 
          active={activeTab === 'all'} 
          onPress={() => {
            setSelectedCategory(undefined);
            setActiveTab('all');
          }} 
        />
        <TabButton 
          label="Buy" 
          active={activeTab === 'buy'} 
          onPress={() => {
            setSelectedCategory(undefined);
            setActiveTab('buy');
          }} 
        />
        <TabButton 
          label="Rent" 
          active={activeTab === 'rent'} 
          onPress={() => {
            setSelectedCategory(undefined);
            setActiveTab('rent');
          }} 
        />
        <TabButton 
          label="PG/Hostel" 
          active={activeTab === 'pg/hostel'} 
          onPress={() => {
            setSelectedCategory(undefined);
            setActiveTab('pg/hostel');
          }} 
        />
        <Pressable 
          style={styles.filterChip}
          onPress={() => navigation.navigate('Filters', { listingType: activeTab })}>
          <Text style={styles.filterChipText}>Filters</Text>
        </Pressable>
      </View>

      {/* Property List */}
      <FlatList
        data={pagedItems}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <PropertyListCard
            item={item}
            favorite={favorites.includes(item.id)}
            onFavoritePress={() => toggleFavorite(item.id)}
            onPress={() => navigation.navigate('PropertyDetail', { id: item.id, property: item })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="home-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No properties found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
          </View>
        }
        ListFooterComponent={() => {
          if (filteredItems.length === 0) return null;
          if (pagedItems.length < filteredItems.length) {
            return (
              <View style={styles.footerTextWrap}>
                <Text style={styles.footerText}>Loading more properties...</Text>
              </View>
            );
          }
          return (
            <View style={styles.footerTextWrap}>
              <Text style={styles.footerText}>End of results</Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

interface TabButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, active, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[styles.tab, active && styles.tabActive]}>
    <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
  </Pressable>
);

interface PropertyListCardProps {
  item: Property;
  onPress: () => void;
  favorite?: boolean;
  onFavoritePress?: () => void;
}

const PropertyListCard: React.FC<PropertyListCardProps> = ({ item, onPress, favorite, onFavoritePress }) => {
  return (
    <PropertyCard
      item={item}
      onPress={onPress}
      favorite={favorite}
      onFavoritePress={onFavoritePress}
    />
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgWhite,
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.bgWhite,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  propertyCard: {
    backgroundColor: colors.bgWhite,
    borderRadius: radius.md,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  cardBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  cardFavorite: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardLocationText: {
    fontSize: 13,
    color: colors.textMuted,
    flex: 1,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  footerTextWrap: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 13,
  },
});

export default PropertiesListScreen;

// Made with Bob
