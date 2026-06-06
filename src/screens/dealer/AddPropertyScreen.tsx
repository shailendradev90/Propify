import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Input } from '../../components/Input';
import { Screen } from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { createProperty } from '../../services/properties';
import { colors, spacing } from '../../theme';
import { ListingType, PropertyType } from '../../types';
import { validateAndSanitizeProperty, formatValidationErrors } from '../../utils/validation';
import { checkRateLimit, formatBlockedTime } from '../../utils/rateLimiter';

const PROPERTY_TYPES: PropertyType[] = ['apartment', 'builder-floor', 'villa', 'plot', 'commercial'];

interface Props {
  navigation: any;
}

const AddPropertyScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [listingType, setListingType] = useState<ListingType>('buy');
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [areaSqft, setAreaSqft] = useState('');
  const [city, setCity] = useState('');
  const [sector, setSector] = useState('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.phone) {
      setOwnerPhone(user.phone);
    }
  }, [user?.phone]);

  const submit = async () => {
    if (!user) return;

    // Check rate limit
    const rateLimit = checkRateLimit(user.uid, 'CREATE_PROPERTY');
    if (!rateLimit.allowed) {
      const blockedTime = rateLimit.blockedFor
        ? formatBlockedTime(rateLimit.blockedFor)
        : 'a while';
      Alert.alert(
        'Too Many Requests',
        `You've created too many properties recently. Please try again in ${blockedTime}.`
      );
      return;
    }

    try {
      setSaving(true);

      // Validate and sanitize input
      const validatedData = await validateAndSanitizeProperty({
        title,
        description,
        price,
        bedrooms,
        bathrooms,
        areaSqft,
        city,
        sector,
        pincode,
        address,
        ownerPhone,
        imageUrl,
      });

      await createProperty({
        ownerId: user.uid,
        ownerName: user.fullName,
        ownerPhone: validatedData.ownerPhone,
        title: validatedData.title,
        description: validatedData.description,
        listingType,
        propertyType,
        price: Number(validatedData.price),
        bedrooms: Number(validatedData.bedrooms) || 0,
        bathrooms: Number(validatedData.bathrooms) || 0,
        areaSqft: Number(validatedData.areaSqft) || 0,
        city: validatedData.city,
        sector: validatedData.sector || undefined,
        pincode: validatedData.pincode,
        address: validatedData.address,
        images: validatedData.imageUrl ? [validatedData.imageUrl] : [],
      });

      Alert.alert('Posted', 'Your property is now live.');
      navigation.goBack();
    } catch (e: any) {
      // Handle validation errors
      if (e.name === 'ValidationError') {
        Alert.alert('Validation Error', formatValidationErrors(e));
      } else {
        Alert.alert('Failed', e?.message ?? 'Could not save property.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>Post a property</Text>

        <Text style={styles.label}>Listing</Text>
        <View style={styles.chipRow}>
          <Chip label="For Sale" selected={listingType === 'buy'} onPress={() => setListingType('buy')} />
          <Chip label="For Rent" selected={listingType === 'rent'} onPress={() => setListingType('rent')} />
        </View>

        <Text style={styles.label}>Type</Text>
        <View style={styles.chipRow}>
          {PROPERTY_TYPES.map(t => (
            <Chip
              key={t}
              label={t[0].toUpperCase() + t.slice(1)}
              selected={propertyType === t}
              onPress={() => setPropertyType(t)}
            />
          ))}
        </View>

        <Input label="Title" placeholder="e.g. 2BHK near city center" value={title} onChangeText={setTitle} />
        <Input
          label="Description"
          placeholder="Highlights, amenities, etc."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{ minHeight: 96, textAlignVertical: 'top' }}
        />
        <Input
          label={listingType === 'rent' ? 'Monthly rent (₹)' : 'Price (₹)'}
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Input label="Bedrooms" keyboardType="numeric" value={bedrooms} onChangeText={setBedrooms} />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Bathrooms" keyboardType="numeric" value={bathrooms} onChangeText={setBathrooms} />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Area (sqft)" keyboardType="numeric" value={areaSqft} onChangeText={setAreaSqft} />
          </View>
        </View>

        <Input label="City" value={city} onChangeText={setCity} />
        <Input label="Sector / Area" value={sector} onChangeText={setSector} />
        <Input label="Pincode" keyboardType="numeric" value={pincode} onChangeText={setPincode} />
        <Input label="Address" value={address} onChangeText={setAddress} />
        <Input
          label="Dealer phone"
          placeholder="+91 98765 43210"
          keyboardType="phone-pad"
          value={ownerPhone}
          onChangeText={setOwnerPhone}
        />
        <Input
          label="Image URL"
          placeholder="https://..."
          autoCapitalize="none"
          value={imageUrl}
          onChangeText={setImageUrl}
        />

        <Button title="Post property" onPress={submit} loading={saving} />
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: '700', color: colors.text, marginTop: spacing.sm, marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: 13, marginTop: spacing.sm, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
});

export default AddPropertyScreen;
