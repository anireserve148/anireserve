import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

interface UseQueryOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    enabled?: boolean;
}

export function useQuery<T>(
    queryFn: () => Promise<{ data?: T }>,
    options: UseQueryOptions<T> = {}
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const { onSuccess, onError, enabled = true } = options;

    const refetch = useCallback(async () => {
        if (!enabled) return;

        setLoading(true);
        setError(null);

        try {
            const response = await queryFn();
            if (response.data) {
                setData(response.data);
                onSuccess?.(response.data);
            }
        } catch (err) {
            const error = err as Error;
            setError(error);
            onError?.(error);
        } finally {
            setLoading(false);
        }
    }, [enabled, queryFn, onSuccess, onError]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, loading, error, refetch };
}

// Custom hooks for common queries
export function usePros(params?: {
    city?: string;
    category?: string;
    page?: number;
    limit?: number;
}) {
    return useQuery(() => api.getPros(params));
}

export function useReservations() {
    return useQuery(() => api.getReservations());
}

export function useConversations() {
    return useQuery(() => api.getConversations());
}

export function useProDashboard() {
    return useQuery(() => api.getProDashboard());
}
