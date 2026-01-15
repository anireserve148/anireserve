import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes } from '../constants';

export default function TermsScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Conditions d'utilisation</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.title}>Conditions d'Utilisation</Text>
                <Text style={styles.date}>Dernière mise à jour : 15 janvier 2026</Text>

                <Text style={styles.sectionTitle}>1. Acceptation des conditions</Text>
                <Text style={styles.paragraph}>
                    En utilisant AniReserve, vous acceptez les présentes conditions d'utilisation.
                    Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.
                </Text>

                <Text style={styles.sectionTitle}>2. Description du service</Text>
                <Text style={styles.paragraph}>
                    AniReserve est une plateforme de mise en relation entre clients et professionnels de services
                    en Israël. Nous facilitons la prise de rendez-vous mais ne sommes pas responsables de la qualité
                    des services fournis.
                </Text>

                <Text style={styles.sectionTitle}>3. Compte utilisateur</Text>
                <Text style={styles.paragraph}>
                    Vous êtes responsable de la sécurité de votre compte et de toutes les activités effectuées
                    sous votre compte. Vous devez nous informer immédiatement de toute utilisation non autorisée.
                </Text>

                <Text style={styles.sectionTitle}>4. Obligations des utilisateurs</Text>
                <Text style={styles.paragraph}>
                    Vous vous engagez à fournir des informations exactes et à jour, à ne pas utiliser l'application
                    à des fins illégales, et à respecter les autres utilisateurs.
                </Text>

                <Text style={styles.sectionTitle}>5. Annulations et remboursements</Text>
                <Text style={styles.paragraph}>
                    Les politiques d'annulation sont définies par chaque professionnel. Les remboursements sont
                    traités conformément à la politique d'annulation applicable.
                </Text>

                <Text style={styles.sectionTitle}>6. Limitation de responsabilité</Text>
                <Text style={styles.paragraph}>
                    AniReserve n'est pas responsable des dommages indirects, accessoires ou consécutifs résultant
                    de l'utilisation ou de l'impossibilité d'utiliser le service.
                </Text>

                <Text style={styles.sectionTitle}>7. Modifications</Text>
                <Text style={styles.paragraph}>
                    Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications
                    prendront effet dès leur publication sur l'application.
                </Text>

                <Text style={styles.sectionTitle}>8. Contact</Text>
                <Text style={styles.paragraph}>
                    Pour toute question concernant ces conditions, contactez-nous à : legal@anireserve.com
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
