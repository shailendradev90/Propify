import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { colors, radius, spacing } from '../../theme';

interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  avatar: string;
}

interface Props {
  navigation: any;
}

const ChatScreen: React.FC<Props> = ({ navigation }) => {
  const chats: ChatItem[] = [
    {
      id: 'chat-1',
      name: 'Rahul Sharma',
      lastMessage: 'Hi, I’m interested in your property. Can we talk?',
      timestamp: '2h ago',
      unread: 3,
      avatar: 'RS',
    },
    {
      id: 'chat-2',
      name: 'Priya Verma',
      lastMessage: 'Please share the floor plan and price details.',
      timestamp: '1d ago',
      unread: 1,
      avatar: 'PV',
    },
    {
      id: 'chat-3',
      name: 'Amit Kumar',
      lastMessage: 'Thanks for the quick response.',
      timestamp: '3d ago',
      avatar: 'AK',
    },
  ];

  const ChatListItem: React.FC<{ item: ChatItem }> = ({ item }) => (
    <Pressable
      onPress={() => navigation.navigate('ChatThread', { chat: item })}
      style={({ pressed }) => [styles.chatItem, pressed && { backgroundColor: colors.primaryLight }]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.avatar}</Text>
      </View>
      <View style={styles.chatContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      <View style={styles.chatMeta}>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
        {item.unread ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Text style={styles.h1}>Messages</Text>
        <Pressable style={styles.searchBtn}>
          <Ionicons name="search-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {chats.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubbles-outline" size={56} color={colors.primary} />
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>Start a conversation with a dealer or buyer</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={i => i.id}
          renderItem={({ item }) => <ChatListItem item={item} />}
          scrollEnabled={false}
        />
      )}
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
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: spacing.lg },
  emptySubtitle: { fontSize: 14, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { color: colors.primary, fontWeight: '700', fontSize: 18 },
  chatContent: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  lastMessage: { fontSize: 13, color: colors.textMuted, marginTop: spacing.xs },
  chatMeta: { alignItems: 'flex-end' },
  timestamp: { fontSize: 12, color: colors.textMuted },
  unreadBadge: {
    marginTop: spacing.xs,
    backgroundColor: colors.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});

export default ChatScreen;
