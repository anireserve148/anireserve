import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <View style={styles.container}>
                    <Ionicons name="warning-outline" size={64} color={Colors.error} />
                    <Text style={styles.title}>Oups ! Une erreur s'est produite</Text>
                    <Text style={styles.message}>{this.state.error?.message}</Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => this.setState({ hasError: false, error: null })}
                    >
                        <Text style={styles.buttonText}>Réessayer</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
        backgroundColor: Colors.backgroundSecondary,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    button: {
        backgroundColor: Colors.accent,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.white,
    },
});
