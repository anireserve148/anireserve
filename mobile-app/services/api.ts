import { API_URL } from '../constants';
import { LoginCredentials, User, ApiResponse, ProProfile, Reservation, ServiceCategory } from '../types';

class ApiService {
    private token: string | null = null;
    public baseUrl: string = API_URL;

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
        return this.request('/api/mobile/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async googleLogin(data: {
        email: string;
        name: string;
        image?: string;
        googleId: string;
    }): Promise<ApiResponse<{ user: User; token: string }>> {
        return this.request('/api/mobile/google-login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async registerPro(data: {
        name: string;
        email: string;
        password: string;
        phoneNumber: string;
        cityId: string;
        categoryId: string;
        bio?: string;
        hourlyRate?: number;
    }): Promise<ApiResponse<{ message: string }>> {
        return this.request('/api/mobile/register-pro', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async submitProApplication(data: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        password: string;
        cityIds: string[];
        categoryIds: string[];
        idPhotoUrl: string;
    }): Promise<ApiResponse<{ success: boolean }>> {
        return this.request('/api/pro-application', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async uploadPhoto(imageBase64: string): Promise<ApiResponse<{ user: User }>> {
        return this.request('/api/mobile/upload-photo', {
            method: 'POST',
            body: JSON.stringify({ imageBase64 }),
        });
    }

    async savePushToken(pushToken: string): Promise<ApiResponse<{ success: boolean }>> {
        return this.request('/api/mobile/push-token', {
            method: 'POST',
            body: JSON.stringify({ pushToken }),
        });
    }

    async updateProfile(data: {
        name?: string;
        phoneNumber?: string;
    }): Promise<ApiResponse<User>> {
        return this.request('/api/mobile/profile', {
            method: 'PATCH',
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
        return this.request(`/api/mobile/pros/${id}`);
    }

    // Filters
    async getCities(): Promise<ApiResponse<{ id: string; name: string }[]>> {
        return this.request('/api/mobile/cities');
    }

    async getCategories(): Promise<ApiResponse<ServiceCategory[]>> {
        return this.request('/api/mobile/categories');
    }

    // Reservations
    async getMyReservations(): Promise<ApiResponse<Reservation[]>> {
        return this.request('/api/mobile/reservations');
    }

    async createReservation(data: {
        proId: string;
        startDate: string;
        endDate: string;
        totalPrice: number;
    }): Promise<ApiResponse<Reservation>> {
        return this.request('/api/mobile/reservations', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async cancelReservation(reservationId: string): Promise<ApiResponse<Reservation>> {
        return this.request('/api/mobile/reservations', {
            method: 'PATCH',
            body: JSON.stringify({ reservationId, status: 'CANCELLED' }),
        });
    }

    // Favorites
    async getFavorites(): Promise<ApiResponse<ProProfile[]>> {
        return this.request('/api/mobile/favorites');
    }

    async addFavorite(proId: string): Promise<ApiResponse<{ success: boolean }>> {
        return this.request('/api/mobile/favorites', {
            method: 'POST',
            body: JSON.stringify({ proId }),
        });
    }

    async removeFavorite(proId: string): Promise<ApiResponse<{ success: boolean }>> {
        return this.request(`/api/mobile/favorites?proId=${proId}`, {
            method: 'DELETE',
        });
    }

    // Conversations & Messages
    async getConversations(): Promise<ApiResponse<any[]>> {
        return this.request('/api/mobile/conversations');
    }

    async createConversation(otherUserId: string): Promise<ApiResponse<{ id: string }>> {
        return this.request('/api/mobile/conversations', {
            method: 'POST',
            body: JSON.stringify({ otherUserId }),
        });
    }

    async getMessages(conversationId: string): Promise<ApiResponse<any[]>> {
        return this.request(`/api/mobile/conversations/${conversationId}`);
    }

    async sendMessage(conversationId: string, content: string): Promise<ApiResponse<any>> {
        return this.request(`/api/mobile/conversations/${conversationId}`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
    }
}

export const api = new ApiService();
