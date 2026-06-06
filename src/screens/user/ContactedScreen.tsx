import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { PropertyCard } from '../../components/PropertyCard';
import { Screen } from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { getContactedProperties, removeContactedProperty } from '../../services/properties';
import { Property } from '../../types';
import { colors, spacing } from '../../theme';

const ContactedScreen: React.FC = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsubscribe = getContactedProperties(user.uid, (props) => {
      setProperties(props);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleDelete = async (propertyId: string) => {
    if (!user) return;
    try {
      await removeContactedProperty(user.uid, propertyId);
      setProperties(props => props.filter(p => p.id !== propertyId));
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not remove property.');
    }
  };

  return (
    <Screen>
      <Text style={styles.h1}>Contacted Properties</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your contacted properties...</Text>
        </View>
      ) : properties.length === 0 ? (
        <EmptyState
          icon="chatbubbles-outline"
          title="No Contacted Properties"
          subtitle="Properties you've shown interest in will appear here"
        />
      ) : (
        <FlatList
          data={properties}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <PropertyCard item={item} />
              <Button
                title="Remove"
                onPress={() => handleDelete(item.id)}
                variant="danger"
                style={styles.deleteBtn}
              />
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.md
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textMuted,
    fontSize: 14,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  cardWrapper: {
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.sm,
  },
  deleteBtn: {
    alignSelf: 'flex-start',
  },
});

export default ContactedScreen;
