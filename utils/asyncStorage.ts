import AsyncStorage from '@react-native-async-storage/async-storage';

export const getItem = async <T>(key: string): Promise<T | null> => {
    const item = await AsyncStorage.getItem(key);
    return item ? JSON.parse(item) : null;
};

export const removeItem = async (key: string) => {
    await AsyncStorage.removeItem(key);
};

export const setItem = async <T>(key: string, value: T): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
        console.error('Error saving data to AsyncStorage:', error);
        throw error;
    }
};

// Optional helper functions you might find useful

export const clearAll = async (): Promise<void> => {
    try {
        await AsyncStorage.clear();
    } catch (error) {
        console.error('Error clearing AsyncStorage:', error);
        throw error;
    }
};

export const getAllKeys = async (): Promise<readonly string[]> => {
    try {
        return await AsyncStorage.getAllKeys();
    } catch (error) {
        console.error('Error getting all keys from AsyncStorage:', error);
        throw error;
    }
};

export const multiGet = async <T>(keys: string[]): Promise<Map<string, T | null>> => {
    try {
        const pairs = await AsyncStorage.multiGet(keys);
        const result = new Map<string, T | null>();

        for (const [key, value] of pairs) {
            result.set(key, value ? JSON.parse(value) : null);
        }

        return result;
    } catch (error) {
        console.error('Error getting multiple items from AsyncStorage:', error);
        throw error;
    }
};