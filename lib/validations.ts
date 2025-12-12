import { z } from 'zod';

// User validation schemas
export const loginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export const registerSchema = z.object({
    email: z.string().email('Email invalide'),
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    password: z.string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
        .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
    role: z.enum(['CLIENT', 'PRO']),
});

// Reservation validation schemas
export const createReservationSchema = z.object({
    proId: z.string().cuid('ID professionnel invalide'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    notes: z.string().max(500, 'Les notes ne peuvent pas dépasser 500 caractères').optional(),
}).refine((data) => data.endDate > data.startDate, {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate'],
});

export const updateReservationStatusSchema = z.object({
    reservationId: z.string().cuid('ID de réservation invalide'),
    status: z.enum(['CONFIRMED', 'REJECTED', 'CANCELLED']),
});

// Availability validation schemas
export const availabilitySlotSchema = z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:MM)'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:MM)'),
}).refine((data) => data.endTime > data.startTime, {
    message: 'L\'heure de fin doit être après l\'heure de début',
    path: ['endTime'],
});

export const updateAvailabilitySchema = z.array(availabilitySlotSchema);

// Pro Profile validation schemas
export const updateProProfileSchema = z.object({
    bio: z.string().max(1000, 'La bio ne peut pas dépasser 1000 caractères').optional(),
    hourlyRate: z.number().min(0, 'Le tarif horaire doit être positif').max(10000, 'Tarif horaire trop élevé'),
    cityId: z.string().cuid('ID de ville invalide').optional(),
    serviceCategories: z.array(z.string().cuid()).min(1, 'Au moins une catégorie de service est requise').optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationStatusInput = z.infer<typeof updateReservationStatusSchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
export type UpdateProProfileInput = z.infer<typeof updateProProfileSchema>;
