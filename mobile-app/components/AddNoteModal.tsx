import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProColors, Spacing, FontSizes } from '../constants';

interface AddNoteModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (content: string) => Promise<void>;
    initialContent?: string;
    title?: string;
}

export function AddNoteModal({ visible, onClose, onSave, initialContent = '', title = 'Ajouter une note' }: AddNoteModalProps) {
    const [content, setContent] = useState(initialContent);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (content.trim().length === 0) return;

        setIsSaving(true);
        try {
            await onSave(content.trim());
            setContent('');
            onClose();
        } catch (error) {
            console.error('Error saving note:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setContent(initialContent);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <TouchableOpacity onPress={handleClose} disabled={isSaving}>
                            <Ionicons name="close" size={28} color={ProColors.text} />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={styles.textArea}
                        placeholder="Écrivez votre note ici..."
                        placeholderTextColor={ProColors.textMuted}
                        value={content}
                        onChangeText={setContent}
                        multiline
                        numberOfLines={8}
                        textAlignVertical="top"
                        autoFocus
                        editable={!isSaving}
                    />

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleClose}
                            disabled={isSaving}
                        >
                            <Text style={styles.cancelButtonText}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.saveButton,
                                (content.trim().length === 0 || isSaving) && styles.disabledButton
                            ]}
                            onPress={handleSave}
                            disabled={content.trim().length === 0 || isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Enregistrer</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: ProColors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: Spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.lg,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: ProColors.text,
    },
    textArea: {
        backgroundColor: ProColors.card,
        borderRadius: 12,
        padding: Spacing.md,
        fontSize: FontSizes.md,
        color: ProColors.text,
        minHeight: 150,
        borderWidth: 1,
        borderColor: ProColors.border,
        marginBottom: Spacing.lg,
    },
    footer: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    button: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: ProColors.card,
        borderWidth: 1,
        borderColor: ProColors.border,
    },
    cancelButtonText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: ProColors.text,
    },
    saveButton: {
        backgroundColor: ProColors.accent,
    },
    saveButtonText: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: '#fff',
    },
    disabledButton: {
        opacity: 0.5,
    },
});
