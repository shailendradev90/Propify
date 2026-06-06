import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { PropertyCard } from '../../components/PropertyCard';
import { Screen } from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import {
  deleteProperty,
  markAsSoldOrRented,
  subscribeDealerProperties,
} from '../../services/properties';
import { colors, radius, spacing } from '../../theme';
import { Property } from '../../types';

interface Props {
  navigation: any;
}

const MyPropertiesScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Property[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeDealerProperties(user.uid, setItems);
    return unsub;
  }, [user]);

  const confirmSold = (p: Property) =>
    Alert.alert(
      p.listingType === 'rent' ? 'Mark as rented?' : 'Mark as sold?',
      'This will remove the listing so users no longer see it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: () => markAsSoldOrRented(p.id),
        },
      ],
    );

  const confirmDelete = (p: Property) =>
    Alert.alert('Delete listing?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteProperty(p.id) },
    ]);

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.h1}>My listings</Text>
          <Text style={styles.subtitle}>{items.length} active properties</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.9 }]}
          onPress={() => navigation.navigate('AddProperty')}>
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.addText}>New</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
        renderItem={({ item }) => (
          <View>
            <PropertyCard
              item={item}
              onPress={() => navigation.navigate('PropertyDetail', { id: item.id, property: item })}
            />
            <View style={styles.actions}>
              <Pressable 
                style={({ pressed }) => [styles.actionBtn, styles.soldBtn, pressed && { opacity: 0.8 }]} 
                onPress={() => confirmSold(item)}>
                <Ionicons
                  name="checkmark-done-outline"
                  size={16}
                  color={colors.success}
                />
                <Text style={[styles.actionText, { color: colors.success }]}>
                  {item.listingType === 'rent' ? 'Mark rented' : 'Mark sold'}
                </Text>
              </Pressable>
              <Pressable 
                style={({ pressed }) => [styles.actionBtn, styles.delBtn, pressed && { opacity: 0.8 }]} 
                onPress={() => confirmDelete(item)}>
                <Ionicons name="trash-outline" size={16} color={colors.danger} />
                <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="business-outline"
            title="No listings yet"
            subtitle="Tap New to post your first property."
          />
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  h1: { fontSize: 28, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: spacing.xs, fontWeight: '500' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.pill,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  addText: { color: '#fff', fontWeight: '700', marginLeft: spacing.xs, fontSize: 15 },
  actions: { flexDirection: 'row', marginTop: -8, marginBottom: spacing.lg },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  soldBtn: { borderColor: colors.success, backgroundColor: '#ECFDF5' },
  delBtn: { borderColor: colors.danger, backgroundColor: '#FEF2F2', marginRight: 0 },
  actionText: { marginLeft: spacing.sm, fontWeight: '700', fontSize: 13 },
});

export default MyPropertiesScreen;
