import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { colors, radius, spacing } from '../../theme';
import { ListingType, PropertyType } from '../../types';

// Price ranges in lakhs for Buy and in thousands for Rent
const PRICE_OPTIONS = {
  buy: [
    { label: '5 Lakh', value: 5 },
    { label: '10 Lakh', value: 10 },
    { label: '25 Lakh', value: 25 },
    { label: '50 Lakh', value: 50 },
    { label: '75 Lakh', value: 75 },
    { label: '1 Cr', value: 100 },
    { label: '1.5 Cr', value: 150 },
    { label: '2 Cr', value: 200 },
    { label: '3 Cr', value: 300 },
    { label: '5 Cr', value: 500 },
    { label: '7.5 Cr', value: 750 },
    { label: '10 Cr', value: 1000 },
  ],
  rent: [
    { label: '₹ 1K', value: 1 },
    { label: '₹ 5K', value: 5 },
    { label: '₹ 10K', value: 10 },
    { label: '₹ 25K', value: 25 },
    { label: '₹ 50K', value: 50 },
    { label: '₹ 1 Lakh', value: 100 },
    { label: '₹ 2 Lakh', value: 200 },
    { label: '₹ 5 Lakh', value: 500 },
    { label: '₹ 10 Lakh', value: 1000 },
    { label: '₹ 25 Lakh', value: 2500 },
    { label: '₹ 50 Lakh', value: 5000 },
    { label: '₹ 1 Cr', value: 10000 },
  ],
};

interface Props {
  navigation: any;
  route: any;
}

const FiltersScreen: React.FC<Props> = ({ navigation, route }) => {
  const listingType = (route.params?.listingType as ListingType) || 'buy';
  const [propertyType, setPropertyType] = useState<PropertyType>('all');
  const [minPrice, setMinPrice] = useState(listingType === 'buy' ? 5 : 1);
  const [maxPrice, setMaxPrice] = useState(listingType === 'buy' ? 1000 : 10000);
  const [bedrooms, setBedrooms] = useState<string>('any');
  const [sectors, setSectors] = useState<string[]>(['', '', '']);
  const [showMinPriceModal, setShowMinPriceModal] = useState(false);
  const [showMaxPriceModal, setShowMaxPriceModal] = useState(false);

  const priceOptions = PRICE_OPTIONS[listingType === 'rent' ? 'rent' : 'buy'];

  const handleReset = () => {
    setPropertyType('all');
    setMinPrice(listingType === 'buy' ? 5 : 1);
    setMaxPrice(listingType === 'buy' ? 1000 : 10000);
    setBedrooms('any');
    setSectors(['', '', '']);
  };

  const handleSectorChange = (index: number, value: string) => {
    const newSectors = [...sectors];
    newSectors[index] = value;
    setSectors(newSectors);
  };

  const handleApply = () => {
    // Filter out empty sectors
    const filledSectors = sectors.filter(s => s.trim().length > 0);
    
    // Update parent route params before navigating back
    navigation.navigate('PropertiesList', {
      filters: {
        sectors: filledSectors,
        minPrice,
        maxPrice,
        listingType,
      },
    });
  };

  const getMinPriceLabel = () => {
    const option = priceOptions.find(p => p.value === minPrice);
    return option ? option.label : 'Select';
  };

  const getMaxPriceLabel = () => {
    const option = priceOptions.find(p => p.value === maxPrice);
    return option ? option.label : 'Select';
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
        <Text style={styles.headerTitle}>Filters</Text>
        <Pressable onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Property Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Type</Text>
          <View style={styles.optionsGrid}>
            <PropertyTypeOption
              icon="home"
              label="All"
              selected={propertyType === 'all'}
              onPress={() => setPropertyType('all')}
            />
            <PropertyTypeOption
              icon="business"
              label="Apartment"
              selected={propertyType === 'apartment'}
              onPress={() => setPropertyType('apartment')}
            />
            <PropertyTypeOption
              icon="home-outline"
              label="Builder Floor"
              selected={propertyType === 'builder-floor'}
              onPress={() => setPropertyType('builder-floor')}
            />
            <PropertyTypeOption
              icon="business-outline"
              label="Villa"
              selected={propertyType === 'villa'}
              onPress={() => setPropertyType('villa')}
            />
            <PropertyTypeOption
              icon="location"
              label="Plot"
              selected={propertyType === 'plot'}
              onPress={() => setPropertyType('plot')}
            />
            <PropertyTypeOption
              icon="briefcase"
              label="Commercial"
              selected={propertyType === 'commercial'}
              onPress={() => setPropertyType('commercial')}
            />
          </View>
        </View>

        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>
          <View style={styles.priceInputs}>
            <Pressable 
              style={styles.priceDropdown}
              onPress={() => setShowMinPriceModal(true)}>
              <Text style={styles.priceDropdownLabel}>{getMinPriceLabel()}</Text>
              <Ionicons name="chevron-down" size={20} color={colors.primary} />
            </Pressable>
            <Text style={styles.priceSeparator}>-</Text>
            <Pressable 
              style={styles.priceDropdown}
              onPress={() => setShowMaxPriceModal(true)}>
              <Text style={styles.priceDropdownLabel}>{getMaxPriceLabel()}</Text>
              <Ionicons name="chevron-down" size={20} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Min Price Modal */}
        <Modal
          visible={showMinPriceModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMinPriceModal(false)}>
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setShowMinPriceModal(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Minimum Price</Text>
              <FlatList
                data={priceOptions}
                keyExtractor={(item) => item.value.toString()}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      styles.optionItem,
                      minPrice === item.value && styles.optionItemSelected,
                    ]}
                    onPress={() => {
                      setMinPrice(item.value);
                      setShowMinPriceModal(false);
                    }}>
                    <Text
                      style={[
                        styles.optionLabel,
                        minPrice === item.value && styles.optionLabelSelected,
                      ]}>
                      {item.label}
                    </Text>
                    {minPrice === item.value && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </Pressable>
                )}
              />
            </View>
          </Pressable>
        </Modal>

        {/* Max Price Modal */}
        <Modal
          visible={showMaxPriceModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMaxPriceModal(false)}>
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setShowMaxPriceModal(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Maximum Price</Text>
              <FlatList
                data={priceOptions}
                keyExtractor={(item) => item.value.toString()}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      styles.optionItem,
                      maxPrice === item.value && styles.optionItemSelected,
                    ]}
                    onPress={() => {
                      setMaxPrice(item.value);
                      setShowMaxPriceModal(false);
                    }}>
                    <Text
                      style={[
                        styles.optionLabel,
                        maxPrice === item.value && styles.optionLabelSelected,
                      ]}>
                      {item.label}
                    </Text>
                    {maxPrice === item.value && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </Pressable>
                )}
              />
            </View>
          </Pressable>
        </Modal>

        {/* Bedrooms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bedrooms</Text>
          <View style={styles.bedroomsRow}>
            <BedroomOption
              label="Any"
              selected={bedrooms === 'any'}
              onPress={() => setBedrooms('any')}
            />
            <BedroomOption
              label="1+"
              selected={bedrooms === '1'}
              onPress={() => setBedrooms('1')}
            />
            <BedroomOption
              label="2+"
              selected={bedrooms === '2'}
              onPress={() => setBedrooms('2')}
            />
            <BedroomOption
              label="3+"
              selected={bedrooms === '3'}
              onPress={() => setBedrooms('3')}
            />
            <BedroomOption
              label="4+"
              selected={bedrooms === '4'}
              onPress={() => setBedrooms('4')}
            />
          </View>
        </View>

        {/* Preferred Sectors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Sectors</Text>
          <Text style={styles.sectorSubtitle}>Add up to 3 preferred sectors (e.g., Sector 12, Sector 10)</Text>
          <View style={styles.sectorsContainer}>
            {sectors.map((sector, index) => (
              <View key={index} style={styles.sectorInputWrapper}>
                <TextInput
                  style={styles.sectorInput}
                  placeholder={`Sector ${index + 1}`}
                  placeholderTextColor={colors.textMuted}
                  value={sector}
                  onChangeText={(value) => handleSectorChange(index, value)}
                />
                {sector.length > 0 && (
                  <Pressable
                    onPress={() => handleSectorChange(index, '')}
                    style={styles.clearButton}>
                    <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* More Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Filters</Text>
          <View style={styles.moreFiltersPlaceholder}>
            <Text style={styles.placeholderText}>Additional filters coming soon...</Text>
          </View>
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.footer}>
        <Button
          title="Apply Filters"
          onPress={handleApply}
        />
      </View>
    </SafeAreaView>
  );
};

interface PropertyTypeOptionProps {
  icon: any;
  label: string;
  selected: boolean;
  onPress: () => void;
}

const PropertyTypeOption: React.FC<PropertyTypeOptionProps> = ({
  icon,
  label,
  selected,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.propertyTypeOption, selected && styles.propertyTypeOptionSelected]}>
    <Ionicons
      name={icon}
      size={24}
      color={selected ? colors.bgWhite : colors.text}
    />
    <Text style={[styles.propertyTypeLabel, selected && styles.propertyTypeLabelSelected]}>
      {label}
    </Text>
    {selected && (
      <View style={styles.checkmark}>
        <Ionicons name="checkmark" size={16} color={colors.bgWhite} />
      </View>
    )}
  </Pressable>
);

interface BedroomOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const BedroomOption: React.FC<BedroomOptionProps> = ({ label, selected, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[styles.bedroomOption, selected && styles.bedroomOptionSelected]}>
    <Text style={[styles.bedroomLabel, selected && styles.bedroomLabelSelected]}>
      {label}
    </Text>
  </Pressable>
);

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
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: spacing.lg,
    backgroundColor: colors.bgWhite,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  propertyTypeOption: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    position: 'relative',
  },
  propertyTypeOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  propertyTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  propertyTypeLabelSelected: {
    color: colors.bgWhite,
  },
  checkmark: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  priceDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  priceDropdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  priceSeparator: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.bgWhite,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '70%',
    paddingTop: spacing.lg,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionItemSelected: {
    backgroundColor: colors.bg,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  optionLabelSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
  sliderContainer: {
    paddingHorizontal: spacing.sm,
  },
  slider: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    position: 'relative',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  bedroomsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  bedroomOption: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  bedroomOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  bedroomLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  bedroomLabelSelected: {
    color: colors.bgWhite,
  },
  sectorsContainer: {
    gap: spacing.md,
  },
  sectorInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  sectorInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 14,
    color: colors.text,
  },
  clearButton: {
    padding: spacing.xs,
  },
  sectorSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  moreFiltersPlaceholder: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.bgWhite,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

export default FiltersScreen;

// Made with Bob
