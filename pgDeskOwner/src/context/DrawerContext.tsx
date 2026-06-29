import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Animated, Pressable, Dimensions } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SideBarContent } from '../components/SideBarContent/SideBarContent';

interface DrawerContextType {
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);

export const DrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const translateX = useState(new Animated.Value(-DRAWER_WIDTH))[0];

  const animate = useCallback(
    (toValue: number, callback?: () => void) => {
      Animated.timing(translateX, {
        toValue,
        duration: 250,
        useNativeDriver: true,
      }).start(callback);
    },
    [translateX]
  );

  const openDrawer = useCallback(() => {
    setVisible(true);
    animate(0);
  }, [animate]);

  const closeDrawer = useCallback(() => {
    animate(-DRAWER_WIDTH, () => setVisible(false));
  }, [animate]);

  const toggleDrawer = useCallback(() => {
    if (visible) closeDrawer();
    else openDrawer();
  }, [visible, closeDrawer, openDrawer]);

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer, toggleDrawer }}>
      {children}
      {visible && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            flexDirection: 'row',
          }}
          pointerEvents="box-none"
        >
          <Pressable
            style={{ flex: 1, backgroundColor: theme.colors.overlay }}
            onPress={closeDrawer}
          />
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: DRAWER_WIDTH,
              height: '100%',
              backgroundColor: theme.colors.background,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              transform: [{ translateX }],
              shadowColor: '#000',
              shadowOffset: { width: 2, height: 0 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            <SideBarContent onClose={closeDrawer} />
          </Animated.View>
        </View>
      )}
    </DrawerContext.Provider>
  );
};

export const useDrawer = () => {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('useDrawer must be used within DrawerProvider');
  return ctx;
};
