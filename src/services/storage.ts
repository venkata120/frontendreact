import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const isSecureAvailable = SecureStore.isAvailableAsync;

export const Storage = {
  async getString(key: string): Promise<string | null> {
    try {
      if (await isSecureAvailable()) {
        return await SecureStore.getItemAsync(key);
      }
      return await AsyncStorage.getItem(key);
    } catch {
      return AsyncStorage.getItem(key);
    }
  },

  async setString(key: string, value: string): Promise<void> {
    try {
      if (await isSecureAvailable()) {
        await SecureStore.setItemAsync(key, value);
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch {
      await AsyncStorage.setItem(key, value);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      if (await isSecureAvailable()) {
        await SecureStore.deleteItemAsync(key);
      }
      await AsyncStorage.removeItem(key);
    } catch {
      await AsyncStorage.removeItem(key);
    }
  },

  async getObject<T>(key: string): Promise<T | null> {
    const value = await this.getString(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  async setObject<T>(key: string, value: T): Promise<void> {
    await this.setString(key, JSON.stringify(value));
  },
};
