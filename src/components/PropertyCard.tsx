import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { Property } from '../types';

interface Props {
  item: Property;
  onPress?: () => void;
  favorite?: boolean;
  onFavoritePress?: () => void;
}

const fallback = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800';

export const PropertyCard: React.FC<Props> = ({ item, onPress, favorite, onFavoritePress }) => {
  const priceLabel =
    item.listingType === 'rent'
      ? `₹${item.price.toLocaleString()}/mo`
      : `₹${item.price.toLocaleString()}`;
  return (
    <Pressable 
      onPress={onPress} 
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.95 }
      ]}>
      <Image
        source={{ uri: item.images?.[0] || fallback }}
        style={styles.image}
      />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {item.listingType === 'rent' ? 'For Rent' : 'For Sale'}
        </Text>
      </View>
      <Pressable
        onPress={onFavoritePress}
        style={({ pressed }) => [styles.favoriteBtn, pressed && { opacity: 0.8 }]}
      >
        <Ionicons
          name={favorite ? 'heart' : 'heart-outline'}
          size={20}
          color={favorite ? colors.danger : colors.primary}
        />
      </Pressable>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={styles.location} numberOfLines={1}>
            {[item.sector, item.city, item.pincode].filter(Boolean).join(', ')}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Meta icon="bed-outline" text={`${item.bedrooms} BHK`} />
          <Meta icon="resize-outline" text={`${item.areaSqft} sqft`} />
          <Meta icon="water-outline" text={`${item.bathrooms} Bath`} />
        </View>
        <Text style={styles.price}>{priceLabel}</Text>
      </View>
    </Pressable>
  );
};

const Meta: React.FC<{ icon: any; text: string }> = ({ icon, text }) => (
  <View style={styles.meta}>
    <Ionicons name={icon} size={13} color={colors.textMuted} />
    <Text style={styles.metaText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  image: { width: '100%', height: 200, backgroundColor: colors.border },
  badge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  favoriteBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: '#FFFFFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  body: { padding: spacing.lg },
  title: { fontSize: 17, fontWeight: '700', color: colors.text, lineHeight: 24 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  location: { color: colors.textMuted, fontSize: 13, marginLeft: spacing.sm, flex: 1 },
  metaRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    flexWrap: 'wrap',
  },
  meta: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.lg, marginBottom: spacing.sm },
  metaText: { color: colors.textMuted, fontSize: 12, marginLeft: spacing.xs, fontWeight: '500' },
  price: {
    marginTop: spacing.md,
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
});
