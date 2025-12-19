import { API_URL } from '../constants';
import { LoginCredentials, User, ApiResponse, ProProfile, Reservation } from '../types';

class ApiService {
    private token: string | null = null;

    setToken(token: string) {
        this.token = token;
    }

    clearToken() {
        this.token = null;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                ...options.headers as Record<string, string>,
            };

            if (this.token) {
                headers['Authorization'] = `Bearer ${this.token}`;
            }

            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || 'Une erreur est survenue',
                };
            }

            return {
                success: true,
                data,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur de connexion',
            };
        }
    }

    // Auth
    async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
        return this.request('/api/mobile/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async register(data: {
        name: string;
        email: string;
        password: string;
    }): Promise<ApiResponse<{ user: User; token: string }>> {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Pros
    async getPros(filters?: {
        city?: string;
        category?: string;
        q?: string;
    }): Promise<ApiResponse<ProProfile[]>> {
        const params = new URLSearchParams(filters as any);
        return this.request(`/api/mobile/pros?${params}`);
    }

    async getProById(id: string): Promise<ApiResponse<ProProfile>> {
        return this.request(`/api/pros/${id}`);
    }

    // Reservations
    async getMyReservations(): Promise<ApiResponse<Reservation[]>> {
        return this.request('/api/reservations');
    }

    async createReservation(data: {
        proId: string;
        startDate: string;
        endDate: string;
        serviceType: string;
    }): Promise<ApiResponse<Reservation>> {
        return this.request('/api/reservations', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

export const api = new ApiService();
