import { ZodError } from 'zod';

export class AppError extends Error {
    constructor(
        message: string,
        public code: string = 'INTERNAL_ERROR',
        public statusCode: number = 500
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class ValidationError extends AppError {
    constructor(message: string, public errors?: Record<string, string[]>) {
        super(message, 'VALIDATION_ERROR', 400);
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Non autorisé') {
        super(message, 'AUTHENTICATION_ERROR', 401);
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Accès refusé') {
        super(message, 'AUTHORIZATION_ERROR', 403);
        this.name = 'AuthorizationError';
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Ressource non trouvée') {
        super(message, 'NOT_FOUND', 404);
        this.name = 'NotFoundError';
    }
}

export type ActionResponse<T = void> =
    | { success: true; data: T }
    | { success: false; error: string; errors?: Record<string, string[]> };

export function handleActionError(error: unknown): ActionResponse<never> {
    console.error('Action error:', error);

    if (error instanceof ValidationError) {
        return {
            success: false,
            error: error.message,
            errors: error.errors,
        };
    }

    if (error instanceof ZodError) {
        const fieldErrors: Record<string, string[]> = {};
        error.issues.forEach((issue) => {
            const path = issue.path.join('.');
            if (!fieldErrors[path]) {
                fieldErrors[path] = [];
            }
            fieldErrors[path].push(issue.message);
        });

        return {
            success: false,
            error: 'Erreur de validation',
            errors: fieldErrors,
        };
    }

    if (error instanceof AppError) {
        return {
            success: false,
            error: error.message,
        };
    }

    if (error instanceof Error) {
        return {
            success: false,
            error: error.message,
        };
    }

    return {
        success: false,
        error: 'Une erreur inattendue s\'est produite',
    };
}

export function createSuccessResponse<T>(data: T): ActionResponse<T> {
    return { success: true, data };
}
