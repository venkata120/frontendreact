import React, { useEffect, useState, useCallback } from 'react';
import { View, TouchableOpacity, Modal, FlatList, TouchableWithoutFeedback } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
  const isQueryLoading = isManager ? managerQuery.isLoading : ownerQuery.isLoading;
  const isReady = !!userId;
  const isLoading = !isReady || isQueryLoading;

  useFocusEffect(
    useCallback(() => {
      if (!isReady) return;
      if (isManager) {
        managerQuery.refetch();
      } else {
        ownerQuery.refetch();
      }
    }, [isReady, isManager, ownerQuery.refetch, managerQuery.refetch])
  );

  useEffect(() => {
    if (!properties) return;
    if (properties.length === 0) {
      if (selectedPg) setSelectedPg(null);
      return;
    }
    const match = selectedPg?.id ? properties.find((p) => p.id === selectedPg.id) : undefined;
    if (match) {
      // Refresh stored data (e.g. name changed) while keeping selection
      if (selectedPg?.id !== match.id || selectedPg?.name !== match.name) {
        setSelectedPg(match);
      }
    } else {
      // Current selection is not in the user's property list (role switch / logout / unassignment)
      setSelectedPg(properties[0]);
    }
  }, [properties, selectedPg, setSelectedPg]);

  const displayPg = selectedPg && properties?.some((p) => p.id === selectedPg.id)
    ? selectedPg
    : properties?.[0] ?? null;

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
          {isLoading ? 'Loading...' : displayPg?.name || 'Select PG'}
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
        statusBarTranslucent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: theme.colors.background,
                  borderTopLeftRadius: theme.radius.xl,
                  borderTopRightRadius: theme.radius.xl,
                  padding: theme.spacing.lg,
                  paddingBottom: theme.spacing.xl,
                  maxHeight: '80%',
                  minHeight: 220,
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
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: theme.spacing.md }}
              renderItem={({ item }: { item: Property }) => {
                const subtitle = [item.address, item.city].filter(Boolean).join(', ') || `ID: ${item.id.slice(-8).toUpperCase()}`;
                return (
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
                      name={item.id === displayPg?.id ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={theme.colors.primary}
                    />
                    <View style={{ marginLeft: theme.spacing.sm, flex: 1 }}>
                      <Typography variant="bodyMedium" color={theme.colors.text} style={{ fontWeight: '500' }}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color={theme.colors.textMuted} numberOfLines={1}>
                        {subtitle}
                      </Typography>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
