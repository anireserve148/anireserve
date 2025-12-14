import api from './api';

export interface Professional {
    id: string;
    userId: string;
    bio: string;
    hourlyRate: number;
    city: {
        name: string;
    };
    user: {
        name: string;
        email: string;
        image: string | null;
    };
    serviceCategories: Array<{
        id: string;
        name: string;
    }>;
    _count: {
        reservations: number;
    };
}

export interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
    category: {
        name: string;
    };
}

export const professionalService = {
    async getAll(params?: { category?: string; city?: string; search?: string }) {
        const response = await api.get('/professionals', { params });
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(`/professionals/${id}`);
        return response.data;
    },

    async getServices(proId: string) {
        const response = await api.get(`/professionals/${proId}/services`);
        return response.data;
    },
};
