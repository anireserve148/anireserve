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
    services?: { id: string; name: string; description: string | null; price: number }[];
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
    startDate: string;
    endDate: string;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    serviceType: string;
    pro: {
        id: string;
        user: {
            name: string | null;
        };
        city: {
            name: string;
        };
    };
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
