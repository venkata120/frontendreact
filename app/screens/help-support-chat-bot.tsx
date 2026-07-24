import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';

const MESSAGES = [
  { id: 1, text: 'Hello! How can I help you today?', sender: 'bot' },
];

export default function HelpSupportChatBotScreen() {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(MESSAGES);

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages([...messages, { id: Date.now(), text: message, sender: 'user' }]);
    setMessage('');
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: 'Thanks for your message. Our team will get back to you soon.', sender: 'bot' }]);
    }, 1000);
  };

  return (
    <ScreenWrapper>
      <View
        style={{
          backgroundColor: '#FFF0F3',
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.lg,
          paddingHorizontal: theme.spacing.base,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="headline2">Chat Bot</Typography>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.white,
            borderRadius: theme.radius.full,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.success, marginRight: 6 }} />
          <Typography variant="bodyMedium" color={theme.colors.success} style={{ fontWeight: '600' }}>Active</Typography>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ padding: theme.spacing.base }}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={{
              flexDirection: 'row',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: theme.spacing.md,
            }}
          >
            {msg.sender === 'bot' && (
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: theme.colors.primarySurface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                }}
              >
                <Ionicons name="logo-android" size={18} color={theme.colors.primary} />
              </View>
            )}
            <Card
              shadow="sm"
              padding={theme.spacing.md}
              style={{
                maxWidth: '75%',
                backgroundColor: msg.sender === 'user' ? theme.colors.primary : theme.colors.white,
                borderBottomLeftRadius: msg.sender === 'user' ? theme.radius.md : 4,
                borderBottomRightRadius: msg.sender === 'user' ? 4 : theme.radius.md,
              }}
            >
              <Typography variant="body" color={msg.sender === 'user' ? theme.colors.white : theme.colors.text}>
                {msg.text}
              </Typography>
            </Card>
          </View>
        ))}
      </ScrollView>

      <View
        style={{
          backgroundColor: '#FFF0F3',
          padding: theme.spacing.base,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity activeOpacity={0.8} style={{ marginRight: theme.spacing.sm }}>
          <Ionicons name="refresh" size={24} color={theme.colors.textMuted} />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.white,
            borderRadius: theme.radius.full,
            borderWidth: 1,
            borderColor: theme.colors.border,
            paddingHorizontal: theme.spacing.md,
          }}
        >
          <TouchableOpacity activeOpacity={0.8} style={{ marginRight: 8 }}>
            <Ionicons name="mic" size={20} color={theme.colors.danger} />
          </TouchableOpacity>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Write message here"
            style={{ flex: 1, paddingVertical: 10, fontFamily: theme.fontFamilies.primary }}
            onSubmitEditing={sendMessage}
          />
        </View>
        <TouchableOpacity activeOpacity={0.8} onPress={sendMessage} style={{ marginLeft: theme.spacing.sm }}>
          <Ionicons name="send" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
