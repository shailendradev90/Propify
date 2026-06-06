import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { subscribeDealerInquiries } from '../../services/properties';
import { colors, radius, spacing } from '../../theme';
import { Inquiry } from '../../types';

const InquiriesScreen: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Inquiry[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeDealerInquiries(user.uid, setItems);
    return unsub;
  }, [user]);

  return (
    <Screen padded={false}>
      <Text style={styles.h1}>Inquiries</Text>
      <FlatList
        data={items}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.propertyTitle}</Text>
            <Text style={styles.msg}>{item.message}</Text>

            <View style={styles.row}>
              <Ionicons name="person-outline" size={14} color={colors.textMuted} />
              <Text style={styles.meta}>{item.userName}</Text>
            </View>
            <View style={styles.row}>
              <Ionicons name="mail-outline" size={14} color={colors.textMuted} />
              <Text style={styles.meta}>{item.userEmail}</Text>
            </View>
            <View style={styles.row}>
              <Ionicons name="call-outline" size={14} color={colors.textMuted} />
              <Text style={styles.meta}>{item.userPhone || 'Phone not available'}</Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                style={[styles.actionBtn, !item.userPhone && styles.actionBtnDisabled]}
                disabled={!item.userPhone}
                onPress={() => item.userPhone && Linking.openURL(`tel:${item.userPhone}`)}>
                <Ionicons
                  name="call-outline"
                  size={16}
                  color={item.userPhone ? colors.primary : colors.textMuted}
                />
                <Text style={[styles.actionText, !item.userPhone && styles.actionTextDisabled]}>
                  {item.userPhone ? 'Call' : 'Call unavailable'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="No inquiries yet"
            subtitle="When users show interest in your listings, they appear here."
          />
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: 24, fontWeight: '700', color: colors.text,
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontWeight: '700', color: colors.text, fontSize: 15 },
  msg: { color: colors.text, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  meta: { marginLeft: 6, color: colors.textMuted, fontSize: 13 },
  actions: { flexDirection: 'row', marginTop: spacing.sm },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill, marginRight: spacing.sm,
  },
  actionBtnDisabled: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: { color: colors.primary, fontWeight: '600', marginLeft: 4 },
  actionTextDisabled: { color: colors.textMuted },
});

export default InquiriesScreen;
