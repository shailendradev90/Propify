import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { getAppUser } from '../../services/auth';
import { createInquiry } from '../../services/properties';
import { colors, radius, spacing } from '../../theme';
import { Property } from '../../types';
import { checkRateLimit, formatBlockedTime } from '../../utils/rateLimiter';
import { sanitizeInput } from '../../utils/validation';

interface Props {
  navigation: any;
  route: { params: { property: Property } };
}

const { width } = Dimensions.get('window');
const fallback = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200';

const PropertyDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { property } = route.params;
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [ownerPhone, setOwnerPhone] = useState(property.ownerPhone ?? '');

  useEffect(() => {
    if (!property.ownerPhone) {
      getAppUser(property.ownerId)
        .then(appUser => {
          if (appUser?.phone) {
            setOwnerPhone(appUser.phone);
          }
        })
        .catch(() => null);
    }
  }, [property.ownerId, property.ownerPhone]);

  const images = property.images?.length ? property.images : [fallback];

  const price =
    property.listingType === 'rent'
      ? `₹${property.price.toLocaleString()}/month`
      : `₹${property.price.toLocaleString()}`;

  const contact = async () => {
    if (!user) return;

    // Check rate limit
    const rateLimit = checkRateLimit(user.uid, 'CREATE_INQUIRY');
    if (!rateLimit.allowed) {
      const blockedTime = rateLimit.blockedFor
        ? formatBlockedTime(rateLimit.blockedFor)
        : 'a while';
      Alert.alert(
        'Too Many Requests',
        `You've sent too many inquiries recently. Please try again in ${blockedTime}.\n\nRemaining attempts: ${rateLimit.remaining}`
      );
      return;
    }

    try {
      setSending(true);

      // Sanitize message
      const message = sanitizeInput(`I'm interested in "${property.title}". Please contact me.`);

      await createInquiry({
        propertyId: property.id,
        propertyTitle: sanitizeInput(property.title),
        propertyImage: images[0],
        dealerId: property.ownerId,
        userId: user.uid,
        userName: sanitizeInput(user.fullName),
        userEmail: sanitizeInput(user.email),
        userPhone: user.phone ? sanitizeInput(user.phone) : undefined,
        message,
        status: 'new',
      });
      Alert.alert('Sent', 'Your interest was shared with the dealer.');
    } catch (e: any) {
      if (e?.message?.includes('already shown interest')) {
        Alert.alert('Already Sent', 'You have already shown interest in this property.');
      } else {
        Alert.alert('Failed', e?.message ?? 'Could not send inquiry.');
      }
    } finally {
      setSending(false);
    }
  };

  const call = () => {
    if (ownerPhone) Linking.openURL(`tel:${ownerPhone}`);
    else Alert.alert('Phone unavailable');
  };

  const whatsapp = () => {
    if (ownerPhone) {
      const message = `Hi, I'm interested in your property "${property.title}" listed on Propify. Can you provide more details?`;
      const encodedMessage = encodeURIComponent(message);
      const phone = ownerPhone.replace(/\D/g, '');
      Linking.openURL(`https://wa.me/${phone}?text=${encodedMessage}`);
    } else {
      Alert.alert('Phone unavailable');
    }
  };

  return (
    <View style={styles.container}>
      {/* Image Gallery */}
      <View style={styles.imageGallery}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(index);
          }}
          scrollEventThrottle={16}>
          {images.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.galleryImage} />
          ))}
        </ScrollView>

        {/* Header Overlay */}
        <SafeAreaView style={styles.headerOverlay} edges={['top']}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable style={styles.headerButton}>
              <Ionicons name="share-outline" size={22} color={colors.text} />
            </Pressable>
            <Pressable style={styles.headerButton}>
              <Ionicons name="heart-outline" size={22} color={colors.text} />
            </Pressable>
          </View>
        </SafeAreaView>

        {/* Image Counter */}
        <View style={styles.imageCounter}>
          <Text style={styles.imageCounterText}>
            {currentImageIndex + 1}/{images.length}
          </Text>
        </View>

        {/* Thumbnail Preview */}
        <View style={styles.thumbnailContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.slice(0, 3).map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.thumbnail} />
            ))}
            {images.length > 3 && (
              <View style={styles.moreThumbnail}>
                <Text style={styles.moreThumbnailText}>+{images.length - 3}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Property Info */}
        <View style={styles.section}>
          <Text style={styles.title}>{property.title}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={styles.location}>
              Sector {property.sector}, {property.city}
            </Text>
          </View>
          <Text style={styles.price}>
            {price}
            {property.listingType === 'buy' && (
              <Text style={styles.priceNote}> Negotiable</Text>
            )}
          </Text>
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>Owner phone</Text>
            <Text style={styles.contactValue}>
              {ownerPhone || 'Not available'}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard icon="bed" value={property.bedrooms} label="Bedrooms" />
          <StatCard icon="water" value={property.bathrooms} label="Bathrooms" />
          <StatCard icon="resize" value={property.areaSqft} label="Area (sq ft)" />
          <StatCard icon="car" value={property.balcony || 2} label="Balcony" />
        </View>

        {/* About Property */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Property</Text>
          <Text style={styles.description}>
            {property.description || 'Spacious 3BHK apartment with modern amenities and premium finishes. Close to metro, schools, hospitals and markets.'}
          </Text>
          <Pressable style={styles.readMore}>
            <Text style={styles.readMoreText}>Read More</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <Button
          title="Show Interest"
          onPress={contact}
          loading={sending}
          style={styles.interestButton}
        />
        <View style={styles.contactButtonsRow}>
          <Pressable onPress={call} style={styles.actionButton}>
            <Ionicons name="call" size={20} color={colors.bgWhite} />
            <Text style={styles.actionLabel}>Call</Text>
          </Pressable>
          <Pressable onPress={whatsapp} style={styles.whatsappButton}>
            <Ionicons name="logo-whatsapp" size={20} color={colors.bgWhite} />
            <Text style={styles.actionLabel}>WhatsApp</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

interface StatCardProps {
  icon: string;
  value: number;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => (
  <View style={styles.statCard}>
    <View style={styles.statIcon}>
      <Ionicons name={icon as any} size={20} color={colors.primary} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgWhite,
  },
  imageGallery: {
    height: 400,
    position: 'relative',
  },
  galleryImage: {
    width,
    height: 400,
    backgroundColor: colors.border,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgWhite,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgWhite,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageCounter: {
    position: 'absolute',
    bottom: spacing.xl + 60,
    right: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  imageCounterText: {
    color: colors.bgWhite,
    fontSize: 12,
    fontWeight: '600',
  },
  thumbnailContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
  thumbnail: {
    width: 80,
    height: 60,
    borderRadius: radius.sm,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.bgWhite,
  },
  moreThumbnail: {
    width: 80,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.bgWhite,
  },
  moreThumbnailText: {
    color: colors.bgWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  location: {
    fontSize: 14,
    color: colors.textMuted,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  priceNote: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textMuted,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.bg,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  readMore: {
    marginTop: spacing.sm,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  contactRow: {
    marginTop: spacing.sm,
  },
  contactLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgWhite,
  },
  interestButton: {
    marginBottom: spacing.xs,
  },
  contactButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  whatsappButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#25D366',
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionLabel: {
    color: colors.bgWhite,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default PropertyDetailScreen;

// Made with Bob
