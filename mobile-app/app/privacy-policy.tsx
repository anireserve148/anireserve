import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, ProColors, Spacing, FontSizes } from '../constants';

export default function PrivacyPolicyScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Politique de confidentialité</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.title}>Politique de Confidentialité</Text>
                <Text style={styles.date}>Dernière mise à jour : 15 janvier 2026</Text>

                <Text style={styles.sectionTitle}>1. Collecte des données</Text>
                <Text style={styles.paragraph}>
                    Nous collectons uniquement les informations nécessaires au bon fonctionnement de l'application :
                    nom, email, numéro de téléphone et informations de profil professionnel.
                </Text>

                <Text style={styles.sectionTitle}>2. Utilisation des données</Text>
                <Text style={styles.paragraph}>
                    Vos données sont utilisées pour faciliter la mise en relation entre clients et professionnels,
                    gérer les réservations et améliorer nos services.
                </Text>

                <Text style={styles.sectionTitle}>3. Protection des données</Text>
                <Text style={styles.paragraph}>
                    Nous utilisons des protocoles de sécurité standards de l'industrie pour protéger vos informations
                    personnelles contre tout accès non autorisé.
                </Text>

                <Text style={styles.sectionTitle}>4. Partage des données</Text>
                <Text style={styles.paragraph}>
                    Nous ne vendons ni ne partageons vos données personnelles avec des tiers sans votre consentement explicite,
                    sauf obligation légale.
                </Text>

                <Text style={styles.sectionTitle}>5. Vos droits</Text>
                <Text style={styles.paragraph}>
                    Vous avez le droit d'accéder, de modifier ou de supprimer vos données personnelles à tout moment
                    depuis les paramètres de votre compte.
                </Text>

                <Text style={styles.sectionTitle}>6. Contact</Text>
                <Text style={styles.paragraph}>
                    Pour toute question concernant cette politique, contactez-nous à : privacy@anireserve.com
                </Text>
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
        marginBottom: Spacing.xs,
    },
    date: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.black,
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    paragraph: {
        fontSize: FontSizes.md,
        color: Colors.gray.darker,
        lineHeight: 24,
    },
});
