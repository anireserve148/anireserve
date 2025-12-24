import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { Colors, Spacing, FontSizes } from '../constants';

interface Service {
    id: string;
    name: string;
    description: string;
    duration: number; // in minutes
    price: number;
    isActive: boolean;
}

const MOCK_SERVICES: Service[] = [
    { id: '1', name: 'Consultation standard', description: 'Rendez-vous classique', duration: 60, price: 120, isActive: true },
    { id: '2', name: 'Consultation longue', description: 'Séance approfondie', duration: 90, price: 180, isActive: true },
    { id: '3', name: 'Première consultation', description: 'Découverte et bilan', duration: 120, price: 200, isActive: false },
];

export default function ProServicesScreen() {
    const router = useRouter();
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newService, setNewService] = useState({ name: '', description: '', duration: '60', price: '' });

    React.useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        setIsLoading(true);
        const result = await api.getProServicesList();
        if (result.success && result.data) {
            // Map customPrice to price for component compatibility
            const mapped = result.data.map((s: any) => ({
                id: s.id,
                name: s.name,
                description: s.description || '',
                duration: s.duration,
                price: s.customPrice,
                isActive: s.isActive
            }));
            setServices(mapped);
        } else {
            Alert.alert('Erreur', 'Impossible de charger les services');
        }
        setIsLoading(false);
    };

    const toggleService = (id: string) => {
        // Feature for backend later, for now just local toggle
        setServices(prev => prev.map(s =>
            s.id === id ? { ...s, isActive: !s.isActive } : s
        ));
    };

    const deleteService = async (id: string) => {
        Alert.alert(
            'Supprimer ce service ?',
            'Cette action est irréversible.',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await api.deleteProService(id);
                        if (result.success) {
                            setServices(prev => prev.filter(s => s.id !== id));
                        } else {
                            Alert.alert('Erreur', 'Impossible de supprimer le service');
                        }
                    }
                }
            ]
        );
    };

    const addService = async () => {
        if (!newService.name || !newService.price) {
            Alert.alert('Erreur', 'Veuillez remplir le nom et le prix');
            return;
        }

        const result = await api.createProService({
            name: newService.name,
            description: newService.description,
            price: parseFloat(newService.price),
            duration: parseInt(newService.duration) || 60
        });

        if (result.success && result.data) {
            const s = result.data;
            const service: Service = {
                id: s.id,
                name: s.name,
                description: s.description || '',
                duration: s.duration,
                price: s.customPrice,
                isActive: s.isActive,
            };

            setServices(prev => [...prev, service]);
            setNewService({ name: '', description: '', duration: '60', price: '' });
            setShowAddForm(false);
            Alert.alert('Succès', 'Service ajouté !');
        } else {
            Alert.alert('Erreur', 'Impossible d\'ajouter le service');
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Mes Services</Text>
                <TouchableOpacity onPress={() => setShowAddForm(!showAddForm)} style={styles.addBtn}>
                    <Ionicons name={showAddForm ? "close" : "add"} size={24} color={Colors.white} />
                </TouchableOpacity>
            </View>

            {/* Add Service Form */}
            {showAddForm && (
                <View style={styles.addForm}>
                    <Text style={styles.formTitle}>Nouveau service</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nom du service"
                        value={newService.name}
                        onChangeText={(text) => setNewService(prev => ({ ...prev, name: text }))}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Description"
                        value={newService.description}
                        onChangeText={(text) => setNewService(prev => ({ ...prev, description: text }))}
                    />
                    <View style={styles.row}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Durée (min)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="60"
                                keyboardType="numeric"
                                value={newService.duration}
                                onChangeText={(text) => setNewService(prev => ({ ...prev, duration: text }))}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Prix (₪)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="120"
                                keyboardType="numeric"
                                value={newService.price}
                                onChangeText={(text) => setNewService(prev => ({ ...prev, price: text }))}
                            />
                        </View>
                    </View>
                    <TouchableOpacity style={styles.saveBtn} onPress={addService}>
                        <Text style={styles.saveBtnText}>Ajouter le service</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Services List */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Services actifs ({services.filter(s => s.isActive).length})</Text>

                {services.filter(s => s.isActive).map((service) => (
                    <View key={service.id} style={styles.serviceCard}>
                        <View style={styles.serviceInfo}>
                            <Text style={styles.serviceName}>{service.name}</Text>
                            <Text style={styles.serviceDesc}>{service.description}</Text>
                            <View style={styles.serviceMeta}>
                                <Ionicons name="time-outline" size={14} color={Colors.gray.medium} />
                                <Text style={styles.metaText}>{service.duration} min</Text>
                                <Text style={styles.servicePrice}>{service.price}₪</Text>
                            </View>
                        </View>
                        <View style={styles.serviceActions}>
                            <TouchableOpacity
                                style={styles.toggleBtn}
                                onPress={() => toggleService(service.id)}
                            >
                                <Ionicons name="eye-off-outline" size={20} color={Colors.warning} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteBtn}
                                onPress={() => deleteService(service.id)}
                            >
                                <Ionicons name="trash-outline" size={20} color={Colors.error} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>

            {/* Inactive Services */}
            {services.filter(s => !s.isActive).length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Services désactivés</Text>

                    {services.filter(s => !s.isActive).map((service) => (
                        <View key={service.id} style={[styles.serviceCard, styles.serviceCardInactive]}>
                            <View style={styles.serviceInfo}>
                                <Text style={[styles.serviceName, styles.textInactive]}>{service.name}</Text>
                                <Text style={styles.serviceDesc}>{service.description}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.activateBtn}
                                onPress={() => toggleService(service.id)}
                            >
                                <Ionicons name="eye-outline" size={20} color={Colors.success} />
                                <Text style={styles.activateBtnText}>Activer</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
        padding: Spacing.md,
        paddingTop: 50,
    },
    backBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: Colors.primary,
    },
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addForm: {
        backgroundColor: Colors.white,
        margin: Spacing.md,
        padding: Spacing.lg,
        borderRadius: 16,
    },
    formTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: Spacing.md,
    },
    input: {
        backgroundColor: Colors.gray.lightest,
        borderRadius: 12,
        padding: Spacing.md,
        fontSize: FontSizes.md,
        marginBottom: Spacing.sm,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    inputGroup: {
        flex: 1,
    },
    inputLabel: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginBottom: Spacing.xs,
    },
    saveBtn: {
        backgroundColor: Colors.success,
        borderRadius: 12,
        padding: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    saveBtnText: {
        color: Colors.white,
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    section: {
        padding: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: Spacing.md,
    },
    serviceCard: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderLeftWidth: 4,
        borderLeftColor: Colors.success,
    },
    serviceCardInactive: {
        borderLeftColor: Colors.gray.light,
        opacity: 0.7,
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: Colors.primary,
    },
    textInactive: {
        color: Colors.gray.medium,
    },
    serviceDesc: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginTop: Spacing.xs,
    },
    serviceMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginTop: Spacing.sm,
    },
    metaText: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginRight: Spacing.md,
    },
    servicePrice: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: Colors.accent,
    },
    serviceActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    toggleBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.warning + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.error + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        backgroundColor: Colors.success + '20',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 20,
    },
    activateBtnText: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: Colors.success,
    },
});
