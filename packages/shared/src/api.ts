import axios, { AxiosInstance } from 'axios';
import { API_URL } from './constants';
import type {
    User,
    ProProfile,
    Reservation,
    Message,
    Conversation,
    Review,
    ApiResponse,
    PaginatedResponse,
} from './types';

class ApiClient {
    private client: AxiosInstance;
    private token: string | null = null;

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add token to requests
        this.client.interceptors.request.use((config) => {
            if (this.token) {
                config.headers.Authorization = `Bearer ${this.token}`;
            }
            return config;
        });
    }

    setToken(token: string | null) {
        this.token = token;
    }

    // Auth - Using existing mobile endpoints
    async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
        const response = await this.client.post('/mobile/login', { email, password });
        return response.data;
    }

    async register(data: { email: string; password: string; name: string }): Promise<ApiResponse<{ token: string; user: User }>> {
        const response = await this.client.post('/mobile/register', data);
        return response.data;
    }

    async appleLogin(identityToken: string, user?: any): Promise<ApiResponse<{ token: string; user: User }>> {
        const response = await this.client.post('/mobile/apple-login', { identityToken, user });
        return response.data;
    }

    async googleLogin(idToken: string): Promise<ApiResponse<{ token: string; user: User }>> {
        const response = await this.client.post('/mobile/google-login', { idToken });
        return response.data;
    }

    // User
    async getProfile(): Promise<ApiResponse<User>> {
        const response = await this.client.get('/mobile/profile');
        return response.data;
    }

    async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
        const response = await this.client.put('/mobile/profile', data);
        return response.data;
    }

    async deleteAccount(password: string): Promise<ApiResponse<{ success: boolean }>> {
        const response = await this.client.delete('/user/account', { data: { password } });
        return response.data;
    }

    // Professionals
    async getPros(params?: {
        city?: string;
        category?: string;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<ProProfile>> {
        const response = await this.client.get('/mobile/pros', { params });
        // Backend returns array directly, wrap for consistency
        return {
            data: response.data,
            total: response.data.length,
            page: params?.page || 1,
            limit: params?.limit || 20,
            hasMore: response.data.length === (params?.limit || 20),
        };
    }

    async getProById(id: string): Promise<ApiResponse<ProProfile>> {
        const response = await this.client.get(`/mobile/pros/${id}`);
        return { data: response.data };
    }

    async searchPros(query: string): Promise<ApiResponse<ProProfile[]>> {
        const response = await this.client.get('/mobile/pros', { params: { q: query } });
        return { data: response.data };
    }

    // Reservations
    async getReservations(): Promise<ApiResponse<Reservation[]>> {
        const response = await this.client.get('/mobile/reservations');
        return { data: response.data };
    }

    async createReservation(data: {
        proId: string;
        date: string;
        time: string;
        duration: number;
        price: number;
        notes?: string;
    }): Promise<ApiResponse<Reservation>> {
        // Convert to backend format
        const startDate = new Date(`${data.date}T${data.time}`);
        const endDate = new Date(startDate.getTime() + data.duration * 60000);

        const response = await this.client.post('/mobile/reservations', {
            proId: data.proId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            totalPrice: data.price,
        });
        return { data: response.data };
    }

    async updateReservation(id: string, data: Partial<Reservation>): Promise<ApiResponse<Reservation>> {
        const response = await this.client.patch('/mobile/reservations', {
            reservationId: id,
            status: data.status,
        });
        return { data: response.data };
    }

    async cancelReservation(id: string): Promise<ApiResponse<{ success: boolean }>> {
        const response = await this.client.patch('/mobile/reservations', {
            reservationId: id,
            status: 'CANCELLED',
        });
        return { data: { success: true } };
    }

    // Messages - Using conversations endpoint
    async getConversations(): Promise<ApiResponse<Conversation[]>> {
        const response = await this.client.get('/mobile/conversations');
        return { data: response.data };
    }

    async getMessages(conversationId: string): Promise<ApiResponse<Message[]>> {
        const response = await this.client.get(`/mobile/conversations/${conversationId}`);
        // Backend endpoint returns messages directly
        return { data: response.data };
    }

    async sendMessage(conversationId: string, content: string): Promise<ApiResponse<Message>> {
        const response = await this.client.post(`/mobile/conversations/${conversationId}`, { content });
        return { data: response.data };
    }

    // Reviews
    async createReview(data: {
        reservationId: string;
        rating: number;
        comment?: string;
    }): Promise<ApiResponse<Review>> {
        const response = await this.client.post('/mobile/reviews', data);
        return { data: response.data };
    }

    async getProReviews(proId: string): Promise<ApiResponse<Review[]>> {
        // Reviews are included in pro details, or fetch separately if needed
        const response = await this.client.get(`/mobile/pros/${proId}`);
        return { data: response.data.reviews || [] };
    }

    // Pro-specific endpoints
    async getProDashboard(): Promise<ApiResponse<any>> {
        const response = await this.client.get('/mobile/stats');
        return { data: response.data };
    }

    async updateProProfile(data: Partial<ProProfile>): Promise<ApiResponse<ProProfile>> {
        const response = await this.client.put('/mobile/pro-profile', data);
        return { data: response.data };
    }

    async updateAvailability(availability: any): Promise<ApiResponse<{ success: boolean }>> {
        const response = await this.client.post('/mobile/availability', { availability });
        return { data: { success: true } };
    }
}

export const api = new ApiClient();

