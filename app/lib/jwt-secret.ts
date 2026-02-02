/**
 * Récupère le secret JWT de manière sécurisée
 * Lance une erreur si le secret n'est pas défini
 */
export function getJWTSecret(): string {
    const secret = process.env.NEXTAUTH_SECRET;

    if (!secret) {
        throw new Error('NEXTAUTH_SECRET environment variable is not defined');
    }

    return secret;
}

/**
 * Récupère le secret JWT pour Apple Auth
 */
export function getAppleJWTSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not defined');
    }

    return secret;
}
