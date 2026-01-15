'use client';

import * as AppleAuthentication from 'expo-apple-authentication';
import { StyleSheet, Platform, Alert } from 'react-native';

interface AppleSignInButtonProps {
    onSuccess: (token: string, user: any) => void;
    onError?: (error: any) => void;
}

export function AppleSignInButton({ onSuccess, onError }: AppleSignInButtonProps) {
    const handleAppleSignIn = async () => {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            // Send to backend for verification and user creation/login
            const response = await fetch('https://anireserve.com/api/auth/apple', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identityToken: credential.identityToken,
                    user: credential.user,
                    email: credential.email,
                    fullName: credential.fullName ? {
                        givenName: credential.fullName.givenName,
                        familyName: credential.fullName.familyName
                    } : null
                })
            });

            const data = await response.json();

            if (data.token && data.user) {
                onSuccess(data.token, data.user);
            } else {
                throw new Error(data.error || 'Authentication failed');
            }
        } catch (error: any) {
            if (error.code === 'ERR_CANCELED') {
                // User canceled - silent
                return;
            }
            console.error('Apple Sign-In Error:', error);
            Alert.alert('Erreur', 'La connexion avec Apple a échoué. Veuillez réessayer.');
            if (onError) onError(error);
        }
    };

    // Only show on iOS
    if (Platform.OS !== 'ios') {
        return null;
    }

    return (
        <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={8}
            style={styles.button}
            onPress={handleAppleSignIn}
        />
    );
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        height: 50,
    },
});
