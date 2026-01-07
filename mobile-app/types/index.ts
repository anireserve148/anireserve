export interface User {
    id: string;
    name: string | null;
    email: string;
    role: 'CLIENT' | 'PRO' | 'ADMIN';
    image: string | null;
    phoneNumber: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface ProProfile {
    id: string;
    userId: string;
    slug: string | null;
    bio: string | null;
    hourlyRate: number;
    cityId: string;
    city: {
        id: string;
        name: string;
    };
    user: User;
    serviceCategories: ServiceCategory[];
    reviews: Review[];
    services?: { id: string; name: string; description: string | null; price: number; duration: number }[];
    gallery?: { id: string; imageUrl: string; caption: string | null }[];
}

export interface ServiceCategory {
    id: string;
    name: string;
}

export interface Review {
    id: string;
    rating: number;
    comment: string | null;
    clientId: string;
    client: {
        name: string | null;
    };
    createdAt: string;
}

export interface Reservation {
    id: string;
    clientId: string;
    proId: string;
    startDate: string;
    endDate: string;
    status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
    totalPrice: number;
    serviceId: string | null;
    serviceName: string | null;
    time: string | null;
    pro?: {
        id: string;
        user: {
            name: string | null;
        };
        city: {
            name: string;
        };
    };
    client?: {
        id: string;
        name: string | null;
        image: string | null;
    };
    service?: {
        id: string;
        name: string;
        duration: number;
    };
    review?: {
        id: string;
        rating: number;
        comment: string | null;
    } | null;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
