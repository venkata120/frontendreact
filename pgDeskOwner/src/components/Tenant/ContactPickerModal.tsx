import React, { useEffect, useState, useMemo } from 'react';
import { View, Modal, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Contacts from 'expo-contacts/legacy';
import type { ExistingContact } from 'expo-contacts/legacy';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../Typography/Typography';
import { SearchBar } from '../SearchBar/SearchBar';
import { Avatar } from '../Avatar/Avatar';
import { useTheme } from '../../hooks/useTheme';

export interface ContactInfo {
  name: string;
  phone?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (contact: ContactInfo) => void;
}

export const ContactPickerModal: React.FC<Props> = ({ visible, onClose, onSelect }) => {
  const theme = useTheme();
  const [contacts, setContacts] = useState<ExistingContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!visible) return;
    loadContacts();
  }, [visible]);

  const loadContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Contact permission denied. Please enable it in settings.');
        setLoading(false);
        return;
      }
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });
      setContacts(data || []);
    } catch {
      setError('Failed to load contacts.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter((c) => (c.name || '').toLowerCase().includes(q));
  }, [contacts, search]);

  const pick = (contact: ExistingContact) => {
    const phone = contact.phoneNumbers?.[0]?.number || '';
    onSelect({ name: contact.name || '', phone: phone.replace(/\D/g, '').slice(-10) });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: theme.colors.overlay }}>
        <View
          style={{
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: theme.radius.xl,
            borderTopRightRadius: theme.radius.xl,
            paddingBottom: 24,
            maxHeight: '80%',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: theme.spacing.base,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.borderLight,
            }}
          >
            <Typography variant="title1">Select Contact</Typography>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <SearchBar
            placeholder="Type to search contact"
            value={search}
            onChangeText={setSearch}
            style={{ marginHorizontal: 0, marginVertical: 0 }}
          />

          {loading && (
            <View style={{ padding: theme.spacing.lg, alignItems: 'center' }}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          )}

          {error && (
            <View style={{ padding: theme.spacing.base, alignItems: 'center' }}>
              <Typography variant="body" color={theme.colors.danger}>
                {error}
              </Typography>
            </View>
          )}

          {!loading && !error && (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => pick(item)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: theme.spacing.base,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.borderLight,
                  }}
                >
                  <Avatar uri={item.image?.uri} name={item.name || ''} size={44} />
                  <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                    <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                      {item.name || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" color={theme.colors.textMuted}>
                      {item.phoneNumbers?.[0]?.number || 'No phone number'}
                    </Typography>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={(
                <View style={{ padding: theme.spacing.lg, alignItems: 'center' }}>
                  <Typography variant="body" color={theme.colors.textMuted}>
                    No contacts found.
                  </Typography>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};
