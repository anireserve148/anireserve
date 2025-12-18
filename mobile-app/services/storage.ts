import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const TOKEN_KEY = '@anireserve_token';
const USER_KEY = '@anireserve_user';

export const storage = {
    // Token
    async saveToken(token: string): Promise<void> {
        await AsyncStorage.setItem(TOKEN_KEY, token);
    },

    async getToken(): Promise<string | null> {
        return await AsyncStorage.getItem(TOKEN_KEY);
    },

    async removeToken(): Promise<void> {
        await AsyncStorage.removeItem(TOKEN_KEY);
    },

    // User
    async saveUser(user: User): Promise<void> {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    async getUser(): Promise<User | null> {
        const userData = await AsyncStorage.getItem(USER_KEY);
        return userData ? JSON.parse(userData) : null;
    },

    async removeUser(): Promise<void> {
        await AsyncStorage.removeItem(USER_KEY);
    },

    // Clear all
    async clearAll(): Promise<void> {
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    },
};
