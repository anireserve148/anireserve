import api from './api';

export interface Reservation {
    id: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
    client: {
        name: string;
        email: string;
    };
    pro: {
        user: {
            name: string;
        };
    };
    service: {
        name: string;
    };
}

export const reservationService = {
    async getMyReservations() {
        const response = await api.get('/reservations/my');
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(`/reservations/${id}`);
        return response.data;
    },

    async create(data: {
        proId: string;
        serviceId: string;
        startDate: string;
        endDate: string;
    }) {
        const response = await api.post('/reservations', data);
        return response.data;
    },

    async updateStatus(id: string, status: 'CONFIRMED' | 'REJECTED') {
        const response = await api.patch(`/reservations/${id}/status`, { status });
        return response.data;
    },
};
