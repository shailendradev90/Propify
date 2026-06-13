import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { subscribeAvailable } from '../../services/properties';
import { colors, radius, spacing } from '../../theme';
import { ListingType, Property, PropertyType } from '../../types';

interface Props {
  navigation: any;
}

const CITIES = ['Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Pune', 'Gurugram', 'Noida'];

interface CategoryItem {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  listingType?: ListingType;
  propertyType?: PropertyType;
}

const CATEGORIES: CategoryItem[] = [
  { label: 'Buy', icon: 'home', color: '#0D5C3F', listingType: 'buy' },
  { label: 'Rent', icon: 'key', color: '#10B981', listingType: 'rent' },
  { label: 'PG/Hostel', icon: 'business', color: '#3B82F6', listingType: 'pg/hostel' },
  { label: 'Commercial', icon: 'briefcase', color: '#F59E0B', propertyType: 'commercial' },
  { label: 'Land', icon: 'map', color: '#8B5CF6', propertyType: 'plot' },
];

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Property[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('Gurugram');
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = subscribeAvailable('all', setItems);
    return unsub;
  }, []);

  const { favorites, toggleFavorite } = useAuth();

  useEffect(() => {
    const profileCity = (user as any)?.city;
    if (profileCity) {
      setSelectedCity(profileCity);
    }
  }, [user]);

  const filteredItems = useMemo(() => {
    return items.filter(item => item.city === selectedCity);
  }, [items, selectedCity]);

  const recentlyAddedProperties = useMemo(() => {
    return filteredItems
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
  }, [filteredItems]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Ionicons name="home" size={20} color={colors.bgWhite} />
              </View>
              <Text style={styles.logoText}>Propify</Text>
            </View>
            <View style={styles.headerIcons}>
              <Pressable
                style={styles.locationBadge}
                onPress={() => setCityModalVisible(true)}>
                <Ionicons name="location-outline" size={20} color={colors.text} />
                <Text style={styles.locationText}>{selectedCity}</Text>
                <Ionicons name="chevron-down" size={16} color={colors.text} />
              </Pressable>
              <Pressable 
                style={styles.iconButton}
                onPress={() => {}}>
                <Ionicons name="notifications-outline" size={22} color={colors.text} />
              </Pressable>
            </View>
          </View>

          {/* Search Bar */}
          <Pressable 
            style={styles.searchBar}
            onPress={() => navigation.navigate('Search')}>
            <Ionicons name="search-outline" size={20} color={colors.textMuted} />
            <Text style={styles.searchPlaceholder}>Search by location, area, sector...</Text>
          </Pressable>
        </View>

        {/* City selector */}
        <View style={styles.cityRowWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cityList}
            keyboardShouldPersistTaps="handled">
            {CITIES.map(city => (
              <Pressable
                key={city}
                style={[
                  styles.cityChip,
                  city === selectedCity && styles.cityChipActive,
                ]}
                onPress={() => setSelectedCity(city)}>
                <Text style={[
                  styles.cityChipText,
                  city === selectedCity && styles.cityChipTextActive,
                ]}>
                  {city}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Find Your{'\n'}Dream Home</Text>
              <Text style={styles.heroSubtitle}>Buy, Rent and PG/Hostels Properties</Text>
              <Pressable style={styles.exploreButton} onPress={() => navigation.navigate('PropertiesList', { city: selectedCity })}>
                <Text style={styles.exploreButtonText}>Explore Now →</Text>
              </Pressable>
            </View>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400' }}
              style={styles.heroImage}
            />
          </LinearGradient>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Pressable onPress={() => {}}>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categories}>
            {CATEGORIES.map(category => (
              <CategoryCard
                key={category.label}
                icon={category.icon}
                label={category.label}
                color={category.color}
                onPress={() => navigation.navigate('PropertiesList', { category, city: selectedCity })}
              />
            ))}
          </ScrollView>
        </View>

        {/* Recently Added */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Added</Text>
            <Pressable onPress={() => navigation.navigate('PropertiesList', { city: selectedCity })}>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.propertiesScroll}>
            {recentlyAddedProperties.map((item) => (
              <View key={item.id} style={styles.propertyCardWrapper}>
                <Pressable 
                  onPress={() => navigation.navigate('PropertyDetail', { id: item.id, property: item })}
                  style={styles.horizontalCard}>
                  <Image
                    source={{ uri: item.images?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800' }}
                    style={styles.horizontalCardImage}
                  />
                  <Pressable
                    onPress={() => toggleFavorite(item.id)}
                    style={styles.favoriteIcon}>
                    <Ionicons
                      name={favorites.includes(item.id) ? 'heart' : 'heart-outline'}
                      size={18}
                      color={favorites.includes(item.id) ? colors.danger : colors.primary}
                    />
                  </Pressable>
                  <View style={styles.horizontalCardContent}>
                    <Text style={styles.horizontalCardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={styles.horizontalCardLocation}>
                      <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                      <Text style={styles.horizontalCardLocationText} numberOfLines={1}>
                        {item.sector}, {item.city}
                      </Text>
                    </View>
                    <Text style={styles.horizontalCardPrice}>
                      ₹{item.price.toLocaleString()}
                      {item.listingType === 'rent' ? '/month' : ''}
                    </Text>
                  </View>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <Modal
        visible={cityModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCityModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose a city</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {CITIES.map(city => (
                <Pressable
                  key={city}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedCity(city);
                    setCityModalVisible(false);
                  }}>
                  <Text style={styles.modalOptionText}>{city}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              style={styles.modalClose}
              onPress={() => setCityModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

interface CategoryCardProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  color: string;
  onPress?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ icon, label, color, onPress }) => (
  <Pressable onPress={onPress} style={styles.categoryCard}>
    <View style={[styles.categoryIcon, { backgroundColor: color }]}> 
      <Ionicons name={icon} size={24} color={colors.bgWhite} />
    </View>
    <Text style={styles.categoryLabel}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.bgWhite,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  cityRowWrap: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgWhite,
  },
  cityList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  cityChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cityChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cityChipText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  cityChipTextActive: {
    color: colors.bgWhite,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.bgWhite,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalOption: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalOptionText: {
    fontSize: 15,
    color: colors.text,
  },
  modalClose: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: colors.textMuted,
  },
  heroBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    height: 180,
  },
  heroGradient: {
    flex: 1,
    flexDirection: 'row',
    padding: spacing.lg,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.bgWhite,
    lineHeight: 32,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.lg,
  },
  exploreButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgWhite,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  exploreButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  heroImage: {
    width: 120,
    height: 140,
    borderRadius: radius.md,
    alignSelf: 'center',
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  categories: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  categoryCard: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  propertiesScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  propertyCardWrapper: {
    width: 200,
  },
  horizontalCard: {
    backgroundColor: colors.bgWhite,
    borderRadius: radius.md,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  horizontalCardImage: {
    width: '100%',
    height: 120,
    backgroundColor: colors.border,
  },
  favoriteIcon: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgWhite,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  horizontalCardContent: {
    padding: spacing.md,
  },
  horizontalCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  horizontalCardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  horizontalCardLocationText: {
    fontSize: 12,
    color: colors.textMuted,
    flex: 1,
  },
  horizontalCardPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default HomeScreen;

// Made with Bob
