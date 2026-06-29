import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../Typography/Typography';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useSelectedPg } from '../../context/SelectedPgContext';
import { useProperties, usePropertiesByManager } from '../../hooks/queries';
import type { Property } from '../../types';

interface PgSelectorProps {
  showCount?: boolean;
}

export function PgSelector({ showCount = true }: PgSelectorProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const { selectedPg, setSelectedPg } = useSelectedPg();
  const [modalVisible, setModalVisible] = useState(false);

  const isManager = user?.role === 'manager';
  const userId = user?.id;

  const ownerQuery = useProperties(isManager ? undefined : userId);
  const managerQuery = usePropertiesByManager(isManager ? userId : undefined);

  const properties = isManager ? managerQuery.data : ownerQuery.data;
  const isLoading = isManager ? managerQuery.isLoading : ownerQuery.isLoading;

  useEffect(() => {
    if (properties && properties.length > 0 && !selectedPg?.name) {
      setSelectedPg(properties[0]);
    }
  }, [properties, selectedPg, setSelectedPg]);

  const handleSelect = (pg: Property) => {
    setSelectedPg(pg);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => properties && properties.length > 0 && setModalVisible(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.white,
          borderRadius: theme.radius.full,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: 8,
        }}
      >
        <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
          {isLoading ? 'Loading...' : selectedPg?.name || 'Select PG'}
        </Typography>
        <Ionicons name="chevron-down" size={16} color={theme.colors.text} style={{ marginLeft: 4 }} />
        {showCount && (
          <View
            style={{
              backgroundColor: theme.colors.danger,
              borderRadius: theme.radius.full,
              minWidth: 18,
              height: 18,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 6,
              paddingHorizontal: 4,
            }}
          >
            <Typography variant="caption" color={theme.colors.white} style={{ fontSize: 10, lineHeight: 14 }}>
              {properties?.length ?? 0}
            </Typography>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View
            style={{
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
              padding: theme.spacing.lg,
              maxHeight: '70%',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <Typography variant="title3" color={theme.colors.text} style={{ fontWeight: '600' }}>
                Select Property
              </Typography>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={properties || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }: { item: Property }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleSelect(item)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: theme.spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                  }}
                >
                  <Ionicons
                    name={item.id === selectedPg?.id ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={theme.colors.primary}
                  />
                  <View style={{ marginLeft: theme.spacing.sm, flex: 1 }}>
                    <Typography variant="bodyMedium" color={theme.colors.text} style={{ fontWeight: '500' }}>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color={theme.colors.textMuted} numberOfLines={1}>
                      {item.address}, {item.city}
                    </Typography>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
