import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { EmptyState } from '../../components/EmptyState';
import { Input } from '../../components/Input';
import { PropertyCard } from '../../components/PropertyCard';
import { Screen } from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { subscribeAvailable } from '../../services/properties';
import { colors, spacing } from '../../theme';
import { ListingType, Property, PropertyType } from '../../types';

const PROPERTY_TYPES: PropertyType[] = ['apartment', 'builder-floor', 'villa', 'plot', 'commercial'];
const BEDROOM_OPTIONS = ['1', '2', '3', '4'];

interface Props {
  navigation: any;
}

const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const { favorites, toggleFavorite } = useAuth();
  const [listingType, setListingType] = useState<ListingType | 'all'>('all');
  const [propType, setPropType] = useState<PropertyType | undefined>();
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [applied, setApplied] = useState(false);
  const [items, setItems] = useState<Property[]>([]);

  const shouldShowBedrooms =
    propType === 'apartment' || propType === 'builder-floor' || propType === 'villa';

  useEffect(() => {
    const unsub = subscribeAvailable(listingType, setItems);
    return unsub;
  }, [listingType]);

  useEffect(() => {
    if (!shouldShowBedrooms && bedrooms) {
      setBedrooms('');
    }
  }, [shouldShowBedrooms, bedrooms]);

  const filtered = useMemo(() => {
    return items.filter(p => {
      if (propType && p.propertyType !== propType) return false;
      if (minPrice && p.price < Number(minPrice)) return false;
      if (maxPrice && p.price > Number(maxPrice)) return false;
      if (shouldShowBedrooms && bedrooms && p.bedrooms !== Number(bedrooms)) return false;
      if (city && !p.city.toLowerCase().includes(city.toLowerCase())) return false;
      if (pincode && !p.pincode.includes(pincode)) return false;
      return true;
    });
  }, [items, propType, minPrice, maxPrice, shouldShowBedrooms, bedrooms, city, pincode]);

  const reset = () => {
    setListingType('all');
    setPropType(undefined);
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setCity('');
    setPincode('');
    setApplied(false);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={styles.headerSpacer} />
      </View>
      {!applied ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.h1}>Filters</Text>

          <Text style={styles.label}>Listing</Text>
          <View style={styles.chipRow}>
            <Chip label="All" selected={listingType === 'all'} onPress={() => setListingType('all')} />
            <Chip label="Buy" selected={listingType === 'buy'} onPress={() => setListingType('buy')} />
            <Chip label="Rent" selected={listingType === 'rent'} onPress={() => setListingType('rent')} />
          </View>

          <Text style={styles.label}>Property type</Text>
          <View style={styles.chipRow}>
            {PROPERTY_TYPES.map(t => (
              <Chip
                key={t}
                label={t[0].toUpperCase() + t.slice(1)}
                selected={propType === t}
                onPress={() => setPropType(propType === t ? undefined : t)}
              />
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Input
                label="Min price"
                placeholder="0"
                keyboardType="numeric"
                value={minPrice}
                onChangeText={setMinPrice}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Max price"
                placeholder="Any"
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={setMaxPrice}
              />
            </View>
          </View>

          {shouldShowBedrooms ? (
            <>
              <Text style={styles.label}>Bedrooms (BHK)</Text>
              <View style={styles.chipRow}>
                {BEDROOM_OPTIONS.map(option => (
                  <Chip
                    key={option}
                    label={`${option} BHK`}
                    selected={bedrooms === option}
                    onPress={() => setBedrooms(bedrooms === option ? '' : option)}
                  />
                ))}
              </View>
            </>
          ) : null}

          <Input label="City" placeholder="e.g. Pune" value={city} onChangeText={setCity} />
          <Input
            label="Pincode"
            placeholder="e.g. 411001"
            keyboardType="numeric"
            value={pincode}
            onChangeText={setPincode}
          />

          <Button title="Apply filters" onPress={() => setApplied(true)} />
          <Button title="Reset" variant="outline" onPress={reset} style={{ marginTop: spacing.sm }} />
        </ScrollView>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          ListHeaderComponent={
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>{filtered.length} results</Text>
              <Text style={styles.link} onPress={() => setApplied(false)}>
                Edit filters
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <PropertyCard
              item={item}
              favorite={favorites.includes(item.id)}
              onFavoritePress={() => toggleFavorite(item.id)}
              onPress={() => navigation.navigate('PropertyDetail', { id: item.id, property: item })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="No matches"
              subtitle="Try widening your filters to see more results."
            />
          }
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: '700', color: colors.text, marginTop: spacing.sm, marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: 13, marginTop: spacing.sm, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  resultsCount: { color: colors.text, fontWeight: '600' },
  link: { color: colors.primary, fontWeight: '600' },
});

export default SearchScreen;
