// User Types
export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    avatar?: string;
    createdAt: string;
}

// Professional Profile
export interface ProProfile {
    id: string;
    userId: string;
    businessName: string;
    category: ServiceCategory;
    description: string;
    city: string;
    address?: string;
    location?: {
        lat: number;
        lng: number;
    };
    rating: number;
    reviewCount: number;
    photos: string[];
    verified: boolean;
    availability?: Availability;
}

// Service Categories
export type ServiceCategory =
    | 'coiffure'
    | 'esthetique'
    | 'massage'
    | 'coaching'
    | 'nutrition'
    | 'psychologie'
    | 'veterinaire'
    | 'autre';

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string; icon: string }[] = [
    { value: 'coiffure', label: 'Coiffure', icon: '✂️' },
    { value: 'esthetique', label: 'Esthétique', icon: '💅' },
    { value: 'massage', label: 'Massage', icon: '💆' },
    { value: 'coaching', label: 'Coaching sportif', icon: '🏋️' },
    { value: 'nutrition', label: 'Nutrition', icon: '🥗' },
    { value: 'psychologie', label: 'Psychologie', icon: '🧠' },
    { value: 'veterinaire', label: 'Vétérinaire', icon: '🐾' },
    { value: 'autre', label: 'Autre', icon: '📋' },
];

// Reservation
export interface Reservation {
    id: string;
    clientId: string;
    proId: string;
    serviceId?: string;
    date: string;
    time: string;
    duration: number; // minutes
    price: number;
    status: ReservationStatus;
    notes?: string;
    client?: User;
    pro?: ProProfile;
    createdAt: string;
}

export type ReservationStatus =
    | 'pending'
    | 'confirmed'
    | 'cancelled'
    | 'completed';

// Availability
export interface Availability {
    monday?: TimeSlot[];
    tuesday?: TimeSlot[];
    wednesday?: TimeSlot[];
    thursday?: TimeSlot[];
    friday?: TimeSlot[];
    saturday?: TimeSlot[];
    sunday?: TimeSlot[];
}

export interface TimeSlot {
    start: string; // HH:MM
    end: string; // HH:MM
}

// Message
export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
    read: boolean;
    createdAt: string;
}

export interface Conversation {
    id: string;
    participants: User[];
    lastMessage?: Message;
    unreadCount: number;
    updatedAt: string;
}

// Review
export interface Review {
    id: string;
    reservationId: string;
    clientId: string;
    proId: string;
    rating: number;
    comment?: string;
    createdAt: string;
    client?: User;
}

// API Response Types
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
