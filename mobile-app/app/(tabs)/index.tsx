import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Modal,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { cache } from '../../services/cache';
import { ProProfile, ServiceCategory } from '../../types';
import { Colors, Spacing, FontSizes } from '../../constants';

export default function HomeScreen() {
    const router = useRouter();
    const [pros, setPros] = useState<ProProfile[]>([]);
    const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showCityModal, setShowCityModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadPros();
    }, [selectedCity, selectedCategory]);

    const loadData = async () => {
        setIsLoading(true);

        // Try to load from cache first
        const cachedPros = await cache.get<ProProfile[]>('pros');
        const cachedCities = await cache.get<{ id: string; name: string }[]>('cities');
        const cachedCategories = await cache.get<ServiceCategory[]>('categories');

        if (cachedPros) setPros(cachedPros);
        if (cachedCities) setCities(cachedCities);
        if (cachedCategories) setCategories(cachedCategories);

        // Try to fetch fresh data
        try {
            const [prosResult, citiesResult, categoriesResult] = await Promise.all([
                api.getPros(),
                api.getCities(),
                api.getCategories(),
            ]);

            if (prosResult.success && prosResult.data) {
                setPros(prosResult.data);
                await cache.set('pros', prosResult.data);
            }
            if (citiesResult.success && citiesResult.data) {
                setCities(citiesResult.data);
                await cache.set('cities', citiesResult.data);
            }
            if (categoriesResult.success && categoriesResult.data) {
                setCategories(categoriesResult.data);
                await cache.set('categories', categoriesResult.data);
            }
            setIsOffline(false);
        } catch (error) {
            // Network error - use cached data
            setIsOffline(true);
        }

        setIsLoading(false);
    };

    const loadPros = async () => {
        const filters: any = {};
        if (selectedCity) filters.city = selectedCity;
        if (selectedCategory) filters.category = selectedCategory;
        if (searchQuery) filters.q = searchQuery;

        const result = await api.getPros(filters);
        if (result.success && result.data) {
            setPros(result.data);
        }
    };

    const filteredPros = pros.filter((pro) =>
        pro.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pro.city.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderPro = ({ item }: { item: ProProfile }) => {
        const avgRating = item.reviews.length > 0
            ? item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviews.length
            : 0;

        return (
            <TouchableOpacity
                style={styles.proCard}
                onPress={() => router.push(`/pro/${item.id}`)}
            >
                <View style={styles.proAvatar}>
                    <Text style={styles.proAvatarText}>{item.user.name?.[0] || 'P'}</Text>
                </View>

                <View style={styles.proInfo}>
                    <Text style={styles.proName}>{item.user.name}</Text>
                    <View style={styles.proMeta}>
                        <Ionicons name="location" size={14} color={Colors.gray.medium} />
                        <Text style={styles.proCity}>{item.city.name}</Text>
                    </View>

                    {item.serviceCategories.length > 0 && (
                        <View style={styles.categories}>
                            {item.serviceCategories.slice(0, 2).map((cat) => (
                                <View key={cat.id} style={styles.categoryBadge}>
                                    <Text style={styles.categoryText}>{cat.name}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.proRight}>
                    {avgRating > 0 && (
                        <View style={styles.rating}>
                            <Ionicons name="star" size={16} color={Colors.accent} />
                            <Text style={styles.ratingText}>{avgRating.toFixed(1)}</Text>
                        </View>
                    )}
                    <Text style={styles.price}>{item.hourlyRate}₪/h</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const selectedCityName = cities.find(c => c.id === selectedCity)?.name;
    const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name;

    return (
        <View style={styles.container}>
            {/* Offline Banner */}
            {isOffline && (
                <View style={styles.offlineBanner}>
                    <Ionicons name="cloud-offline" size={16} color={Colors.white} />
                    <Text style={styles.offlineText}>Mode hors ligne - Données en cache</Text>
                </View>
            )}

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={Colors.gray.medium} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Chercher un professionnel..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, selectedCity && styles.filterButtonActive]}
                    onPress={() => setShowCityModal(true)}
                >
                    <Ionicons name="location-outline" size={18} color={selectedCity ? Colors.white : Colors.primary} />
                    <Text style={[styles.filterText, selectedCity && styles.filterTextActive]}>
                        {selectedCityName || 'Ville'}
                    </Text>
                    {selectedCity && (
                        <TouchableOpacity onPress={() => setSelectedCity('')}>
                            <Ionicons name="close-circle" size={18} color={Colors.white} />
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterButton, selectedCategory && styles.filterButtonActive]}
                    onPress={() => setShowCategoryModal(true)}
                >
                    <Ionicons name="grid-outline" size={18} color={selectedCategory ? Colors.white : Colors.primary} />
                    <Text style={[styles.filterText, selectedCategory && styles.filterTextActive]}>
                        {selectedCategoryName || 'Catégorie'}
                    </Text>
                    {selectedCategory && (
                        <TouchableOpacity onPress={() => setSelectedCategory('')}>
                            <Ionicons name="close-circle" size={18} color={Colors.white} />
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>
            </View>

            {/* Pros List */}
            <FlatList
                data={filteredPros}
                renderItem={renderPro}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshing={isLoading}
                onRefresh={loadData}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={64} color={Colors.gray.medium} />
                        <Text style={styles.emptyText}>Aucun professionnel trouvé</Text>
                    </View>
                }
            />

            {/* City Modal */}
            <Modal visible={showCityModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Choisir une ville</Text>
                            <TouchableOpacity onPress={() => setShowCityModal(false)}>
                                <Ionicons name="close" size={28} color={Colors.secondary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {cities.map((city) => (
                                <TouchableOpacity
                                    key={city.id}
                                    style={[
                                        styles.modalItem,
                                        selectedCity === city.id && styles.modalItemActive,
                                    ]}
                                    onPress={() => {
                                        setSelectedCity(city.id);
                                        setShowCityModal(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        selectedCity === city.id && styles.modalItemTextActive
                                    ]}>
                                        {city.name}
                                    </Text>
                                    {selectedCity === city.id && (
                                        <Ionicons name="checkmark" size={24} color={Colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Category Modal */}
            <Modal visible={showCategoryModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Choisir une catégorie</Text>
                            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                                <Ionicons name="close" size={28} color={Colors.secondary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.modalItem,
                                        selectedCategory === category.id && styles.modalItemActive,
                                    ]}
                                    onPress={() => {
                                        setSelectedCategory(category.id);
                                        setShowCategoryModal(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        selectedCategory === category.id && styles.modalItemTextActive
                                    ]}>
                                        {category.name}
                                    </Text>
                                    {selectedCategory === category.id && (
                                        <Ionicons name="checkmark" size={24} color={Colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    offlineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.warning,
        padding: Spacing.sm,
        gap: Spacing.xs,
        justifyContent: 'center',
    },
    offlineText: {
        color: Colors.white,
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.gray.light,
        margin: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderRadius: 12,
    },
    searchIcon: {
        marginRight: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        paddingVertical: Spacing.md,
        fontSize: FontSizes.md,
    },
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
        gap: Spacing.sm,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.primary,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 20,
        gap: Spacing.xs,
    },
    filterButtonActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    filterText: {
        fontSize: FontSizes.sm,
        color: Colors.primary,
        fontWeight: '600',
    },
    filterTextActive: {
        color: Colors.white,
    },
    listContent: {
        padding: Spacing.md,
    },
    proCard: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    proAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    proAvatarText: {
        color: Colors.white,
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
    },
    proInfo: {
        flex: 1,
    },
    proName: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.secondary,
        marginBottom: Spacing.xs,
    },
    proMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    proCity: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginLeft: Spacing.xs,
    },
    categories: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    categoryBadge: {
        backgroundColor: Colors.primary + '20',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: 8,
        marginRight: Spacing.xs,
    },
    categoryText: {
        fontSize: FontSizes.xs,
        color: Colors.primary,
        fontWeight: '600',
    },
    proRight: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.accent + '20',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: 8,
    },
    ratingText: {
        fontSize: FontSizes.sm,
        color: Colors.accent,
        marginLeft: Spacing.xs,
        fontWeight: 'bold',
    },
    price: {
        fontSize: FontSizes.md,
        fontWeight: 'bold',
        color: Colors.secondary,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: Spacing.xxl,
    },
    emptyText: {
        fontSize: FontSizes.md,
        color: Colors.gray.medium,
        marginTop: Spacing.md,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
        padding: Spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray.light,
    },
    modalTitle: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.secondary,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray.light,
    },
    modalItemActive: {
        backgroundColor: Colors.primary + '10',
    },
    modalItemText: {
        fontSize: FontSizes.md,
        color: Colors.secondary,
    },
    modalItemTextActive: {
        fontWeight: 'bold',
        color: Colors.primary,
    },
});
