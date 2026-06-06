import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { PropertyCard } from '../../components/PropertyCard';
import { Screen } from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { subscribeAvailable } from '../../services/properties';
import { colors, spacing } from '../../theme';
import { Property } from '../../types';

interface Props {
  navigation: any;
}

const WishlistScreen: React.FC<Props> = ({ navigation }) => {
  const { favorites, toggleFavorite } = useAuth();
  const [items, setItems] = useState<Property[]>([]);

  useEffect(() => {
    const unsub = subscribeAvailable('all', setItems);
    return unsub;
  }, []);

  const wishlistItems = items.filter(item => favorites.includes(item.id));

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Text style={styles.h1}>Wishlist</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{items.length}</Text>
        </View>
      </View>

      <FlatList
        data={wishlistItems}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
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
            icon="heart-outline"
            title="No saved properties"
            subtitle="Tap the heart icon to add properties to your wishlist."
          />
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  h1: { fontSize: 28, fontWeight: '700', color: colors.text },
  badge: {
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
});

export default WishlistScreen;
