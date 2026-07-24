import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store, persistor } from '../../redux/store';
import { ThemeProvider } from './ThemeProvider';
import { SelectedPgProvider } from '../../context/SelectedPgContext';
import { DrawerProvider } from '../../context/DrawerContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

interface Props {
  children: React.ReactNode;
}

export const AppProviders: React.FC<Props> = ({ children }) => {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <ThemeProvider>
            <PaperProvider theme={MD3LightTheme}>
              <QueryClientProvider client={queryClient}>
                <SelectedPgProvider>
                      <DrawerProvider>{children}</DrawerProvider>
                    </SelectedPgProvider>
              </QueryClientProvider>
            </PaperProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </PersistGate>
    </ReduxProvider>
  );
};
