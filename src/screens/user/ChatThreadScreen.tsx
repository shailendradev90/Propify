import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
  route: { params: { chat: ChatItem } };
}

const ChatThreadScreen: React.FC<Props> = ({ navigation, route }) => {
  const { chat } = route.params;
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; text: string; fromMe: boolean; time: string }>>([
    { id: 'm1', text: `Hi ${chat.name.split(' ')[0]}, how can I help you today?`, fromMe: false, time: '10:54 AM' },
    { id: 'm2', text: chat.lastMessage, fromMe: true, time: '10:56 AM' },
  ]);

  const handleSend = () => {
    if (!text.trim()) return;
    setMessages(prev => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        text: text.trim(),
        fromMe: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setText('');
  };

  const threadTitle = useMemo(() => `${chat.name}`, [chat.name]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.threadTitle}>
          <Text style={styles.name}>{threadTitle}</Text>
          <Text style={styles.subtitle}>{chat.lastMessage}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false}>
          {messages.map(message => (
            <View
              key={message.id}
              style={[styles.messageBubble, message.fromMe ? styles.messageRight : styles.messageLeft]}>
              <Text style={styles.messageText}>{message.text}</Text>
              <Text style={styles.messageTime}>{message.time}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
            multiline
          />
          <Button title="Send" onPress={handleSend} style={styles.sendBtn} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgWhite,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadTitle: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: spacing.xs },
  container: { flex: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  messages: { paddingBottom: spacing.xl },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  messageLeft: {
    backgroundColor: colors.bgWhite,
    alignSelf: 'flex-start',
  },
  messageRight: {
    backgroundColor: colors.primaryLight,
    alignSelf: 'flex-end',
  },
  messageText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  messageTime: {
    marginTop: spacing.xs,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'right',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bgWhite,
    color: colors.text,
  },
  sendBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.lg,
  },
});

export default ChatThreadScreen;
