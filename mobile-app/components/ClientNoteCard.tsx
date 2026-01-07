import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProColors, Spacing, FontSizes } from '../constants';

interface ClientNoteCardProps {
    note: {
        id: string;
        content: string;
        createdAt: string;
        updatedAt: string;
    };
    onEdit: () => void;
    onDelete: () => void;
}

export function ClientNoteCard({ note, onEdit, onDelete }: ClientNoteCardProps) {
    const handleDelete = () => {
        Alert.alert(
            'Supprimer la note',
            'Êtes-vous sûr de vouloir supprimer cette note ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: onDelete,
                },
            ]
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons name="document-text" size={18} color={ProColors.accent} />
                </View>
                <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>{formatDate(note.updatedAt)}</Text>
                </View>
            </View>

            <Text style={styles.content}>{note.content}</Text>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
                    <Ionicons name="pencil" size={16} color={ProColors.text} />
                    <Text style={styles.actionText}>Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    <Text style={[styles.actionText, styles.deleteText]}>Supprimer</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: ProColors.card,
        borderRadius: 12,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: ProColors.border,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: ProColors.accent + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    dateContainer: {
        flex: 1,
    },
    dateText: {
        fontSize: FontSizes.xs,
        color: ProColors.textMuted,
    },
    content: {
        fontSize: FontSizes.md,
        color: ProColors.text,
        lineHeight: 22,
        marginBottom: Spacing.md,
    },
    actions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 8,
        backgroundColor: ProColors.backgroundLight,
        gap: 6,
    },
    deleteButton: {
        backgroundColor: '#FEE2E2',
    },
    actionText: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: ProColors.text,
    },
    deleteText: {
        color: '#EF4444',
    },
});
