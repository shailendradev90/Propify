import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

interface Props {
  icon?: any;
  title: string;
  subtitle?: string;
}

export const EmptyState: React.FC<Props> = ({ icon = 'home-outline', title, subtitle }) => (
  <View style={styles.wrap}>
    <View style={styles.iconBox}>
      <Ionicons name={icon} size={56} color={colors.primary} />
    </View>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { marginTop: spacing.md, fontSize: 17, fontWeight: '700', color: colors.text },
  subtitle: { marginTop: spacing.sm, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.lg, lineHeight: 20 },
});
