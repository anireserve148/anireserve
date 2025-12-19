import AsyncStorage from '@react-native-async-storage/async-storage';

class CacheService {
    private CACHE_PREFIX = '@cache_';
    private CACHE_EXPIRY = 1000 * 60 * 30; // 30 minutes

    async set(key: string, data: any): Promise<void> {
        try {
            const cacheData = {
                data,
                timestamp: Date.now(),
            };
            await AsyncStorage.setItem(
                this.CACHE_PREFIX + key,
                JSON.stringify(cacheData)
            );
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    async get<T = any>(key: string): Promise<T | null> {
        try {
            const cached = await AsyncStorage.getItem(this.CACHE_PREFIX + key);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);

            // Check if expired
            if (Date.now() - timestamp > this.CACHE_EXPIRY) {
                await this.remove(key);
                return null;
            }

            return data as T;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    async remove(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(this.CACHE_PREFIX + key);
        } catch (error) {
            console.error('Cache remove error:', error);
        }
    }

    async clear(): Promise<void> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter(k => k.startsWith(this.CACHE_PREFIX));
            await AsyncStorage.multiRemove(cacheKeys);
        } catch (error) {
            console.error('Cache clear error:', error);
        }
    }
}

export const cache = new CacheService();
