import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes } from '../constants';

export default function HelpScreen() {
    const router = useRouter();

    const openEmail = () => {
        Linking.openURL('mailto:support@anireserve.com?subject=Aide AniReserve');
    };

    const handleFAQ = (question: string) => {
        Alert.alert(question, 'Cette fonctionnalité sera bientôt disponible.');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Aide et Support</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.title}>Centre d'aide</Text>

                <Text style={styles.sectionTitle}>Questions fréquentes</Text>

                <TouchableOpacity style={styles.faqItem} onPress={() => handleFAQ('Comment réserver ?')}>
                    <Ionicons name="help-circle-outline" size={24} color={Colors.primary} />
                    <Text style={styles.faqText}>Comment réserver un service ?</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.faqItem} onPress={() => handleFAQ('Annulation')}>
                    <Ionicons name="help-circle-outline" size={24} color={Colors.primary} />
                    <Text style={styles.faqText}>Comment annuler une réservation ?</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.faqItem} onPress={() => handleFAQ('Paiement')}>
                    <Ionicons name="help-circle-outline" size={24} color={Colors.primary} />
                    <Text style={styles.faqText}>Comment fonctionne le paiement ?</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Nous contacter</Text>

                <TouchableOpacity style={styles.contactCard} onPress={openEmail}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="mail-outline" size={28} color={Colors.primary} />
                    </View>
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactTitle}>Email</Text>
                        <Text style={styles.contactValue}>support@anireserve.com</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
                </TouchableOpacity>

                <View style={styles.contactCard}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="time-outline" size={28} color={Colors.primary} />
                    </View>
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactTitle}>Horaires</Text>
                        <Text style={styles.contactValue}>Lun-Ven: 9h-18h</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingTop: 60,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray.light,
    },
    backButton: {
        padding: Spacing.sm,
    },
    headerTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.black,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: Spacing.xl,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.black,
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.black,
        marginTop: Spacing.lg,
        marginBottom: Spacing.md,
    },
    faqItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: Colors.background,
        borderRadius: 12,
        marginBottom: Spacing.sm,
    },
    faqText: {
        flex: 1,
        fontSize: FontSizes.md,
        color: Colors.black,
        marginLeft: Spacing.md,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        backgroundColor: Colors.background,
        borderRadius: 12,
        marginBottom: Spacing.sm,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    contactInfo: {
        flex: 1,
    },
    contactTitle: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginBottom: 4,
    },
    contactValue: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.black,
    },
});
