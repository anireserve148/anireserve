import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes } from '../constants';

interface ClientProfile {
    id: string;
    name: string;
    email: string;
    phone?: string;
    image?: string;
    totalBookings: number;
    totalSpent: number;
    lastVisit: string;
    firstVisit: string;
    bookings: {
        id: string;
        date: string;
        service: string;
        price: number;
        status: string;
    }[];
    notes?: string;
}

const MOCK_CLIENT: ClientProfile = {
    id: '1',
    name: 'David Cohen',
    email: 'david@email.com',
    phone: '+972 52 123 4567',
    totalBookings: 8,
    totalSpent: 1560,
    lastVisit: '2025-12-18',
    firstVisit: '2025-06-15',
    bookings: [
        { id: '1', date: '2025-12-18', service: 'Consultation standard', price: 120, status: 'COMPLETED' },
        { id: '2', date: '2025-12-10', service: 'Consultation longue', price: 180, status: 'COMPLETED' },
        { id: '3', date: '2025-11-25', service: 'Consultation standard', price: 120, status: 'COMPLETED' },
        { id: '4', date: '2025-11-08', service: 'Première consultation', price: 200, status: 'COMPLETED' },
    ],
    notes: 'Client régulier, préfère les RDV matinaux.',
};

export default function ClientProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [client, setClient] = useState<ClientProfile>(MOCK_CLIENT);
    const [showNotes, setShowNotes] = useState(false);

    const handleMessage = () => {
        router.push(`/chat/${id}`);
    };

    const handleCall = () => {
        if (client.phone && typeof window !== 'undefined') {
            window.open(`tel:${client.phone}`);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
            </View>

            {/* Profile Card */}
            <View style={styles.profileCard}>
                <View style={styles.avatar}>
                    {client.image ? (
                        <Image source={{ uri: client.image }} style={styles.avatarImage} />
                    ) : (
                        <Text style={styles.avatarText}>{client.name[0]}</Text>
                    )}
                </View>
                <Text style={styles.name}>{client.name}</Text>
                <Text style={styles.memberSince}>Client depuis {client.firstVisit}</Text>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={handleMessage}>
                        <Ionicons name="chatbubble" size={24} color={Colors.white} />
                        <Text style={styles.actionText}>Message</Text>
                    </TouchableOpacity>
                    {client.phone && (
                        <TouchableOpacity style={[styles.actionBtn, styles.callBtn]} onPress={handleCall}>
                            <Ionicons name="call" size={24} color={Colors.white} />
                            <Text style={styles.actionText}>Appeler</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Stats */}
            <View style={styles.statsCard}>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{client.totalBookings}</Text>
                    <Text style={styles.statLabel}>RDV totaux</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{client.totalSpent}₪</Text>
                    <Text style={styles.statLabel}>Dépensé</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{Math.round(client.totalSpent / client.totalBookings)}₪</Text>
                    <Text style={styles.statLabel}>Moy./RDV</Text>
                </View>
            </View>

            {/* Contact Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Coordonnées</Text>
                <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={20} color={Colors.gray.medium} />
                    <Text style={styles.infoText}>{client.email}</Text>
                </View>
                {client.phone && (
                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={20} color={Colors.gray.medium} />
                        <Text style={styles.infoText}>{client.phone}</Text>
                    </View>
                )}
            </View>

            {/* Notes */}
            <View style={styles.section}>
                <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => setShowNotes(!showNotes)}
                >
                    <Text style={styles.sectionTitle}>📝 Notes privées</Text>
                    <Ionicons name={showNotes ? "chevron-up" : "chevron-down"} size={20} color={Colors.gray.medium} />
                </TouchableOpacity>
                {showNotes && (
                    <View style={styles.notesBox}>
                        <Text style={styles.notesText}>{client.notes || 'Aucune note'}</Text>
                        <TouchableOpacity style={styles.editNotesBtn}>
                            <Ionicons name="pencil-outline" size={16} color={Colors.accent} />
                            <Text style={styles.editNotesText}>Modifier</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* History */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Historique des RDV</Text>
                {client.bookings.map((booking) => (
                    <View key={booking.id} style={styles.historyItem}>
                        <View style={styles.historyDate}>
                            <Text style={styles.historyDateText}>{booking.date}</Text>
                        </View>
                        <View style={styles.historyInfo}>
                            <Text style={styles.historyService}>{booking.service}</Text>
                            <Text style={styles.historyPrice}>{booking.price}₪</Text>
                        </View>
                        <View style={styles.completedBadge}>
                            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                        </View>
                    </View>
                ))}
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray.lightest,
    },
    header: {
        backgroundColor: Colors.primary,
        padding: Spacing.md,
        paddingTop: 50,
    },
    backBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileCard: {
        backgroundColor: Colors.primary,
        alignItems: 'center',
        paddingBottom: Spacing.xl,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: Colors.white,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: '700',
        color: Colors.white,
    },
    name: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.white,
        marginTop: Spacing.md,
    },
    memberSince: {
        fontSize: FontSizes.sm,
        color: Colors.white,
        opacity: 0.8,
        marginTop: Spacing.xs,
    },
    quickActions: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.lg,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.accent,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: 25,
    },
    callBtn: {
        backgroundColor: Colors.success,
    },
    actionText: {
        color: Colors.white,
        fontWeight: '600',
        fontSize: FontSizes.md,
    },
    statsCard: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        margin: Spacing.md,
        marginTop: -20,
        borderRadius: 16,
        padding: Spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    stat: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: Colors.primary,
    },
    statLabel: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginTop: Spacing.xs,
    },
    statDivider: {
        width: 1,
        backgroundColor: Colors.gray.light,
    },
    section: {
        backgroundColor: Colors.white,
        marginHorizontal: Spacing.md,
        marginTop: Spacing.md,
        borderRadius: 16,
        padding: Spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: Spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray.lightest,
    },
    infoText: {
        fontSize: FontSizes.md,
        color: Colors.primary,
    },
    notesBox: {
        backgroundColor: Colors.gray.lightest,
        borderRadius: 12,
        padding: Spacing.md,
        marginTop: Spacing.md,
    },
    notesText: {
        fontSize: FontSizes.md,
        color: Colors.gray.dark,
        lineHeight: 22,
    },
    editNotesBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginTop: Spacing.md,
    },
    editNotesText: {
        fontSize: FontSizes.sm,
        color: Colors.accent,
        fontWeight: '600',
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray.lightest,
    },
    historyDate: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: 8,
    },
    historyDateText: {
        fontSize: FontSizes.xs,
        color: Colors.white,
        fontWeight: '600',
    },
    historyInfo: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    historyService: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.primary,
    },
    historyPrice: {
        fontSize: FontSizes.sm,
        color: Colors.accent,
        marginTop: 2,
    },
    completedBadge: {},
});
