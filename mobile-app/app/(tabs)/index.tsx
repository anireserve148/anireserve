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
    Image,
    Dimensions,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { cache } from '../../services/cache';
import { ProProfile, ServiceCategory } from '../../types';
import { Colors, Spacing, FontSizes, Shadows } from '../../constants';
import { Skeleton, ProCardSkeleton } from '../../components/Skeleton';
import { AnimatedHeart } from '../../components/AnimatedHeart';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 32;

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
    const [likedPros, setLikedPros] = useState<Set<string>>(new Set());
    const [page, setPage] = useState(1);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadData();
        loadFavorites();
    }, []);

    useEffect(() => {
        loadPros();
    }, [selectedCity, selectedCategory]);

    const loadFavorites = async () => {
        const result = await api.getFavorites();
        if (result.success && result.data) {
            setLikedPros(new Set(result.data.map(f => f.id)));
        }
    };

    const loadData = async () => {
        setIsLoading(true);
        setPage(1);
        setHasMore(true);

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
                api.getPros({ page: 1, limit: 12 }),
                api.getCities(),
                api.getCategories(),
            ]);

            if (prosResult.success && prosResult.data) {
                setPros(prosResult.data);
                setHasMore(prosResult.data.length === 12);
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
            setIsOffline(true);
        }

        setIsLoading(false);
    };

    const loadPros = async (reset = true) => {
        if (!reset && (!hasMore || isFetchingMore)) return;

        if (reset) {
            setIsLoading(true);
            setPage(1);
        } else {
            setIsFetchingMore(true);
        }

        const currentPage = reset ? 1 : page + 1;
        const filters: any = { page: currentPage, limit: 12 };
        if (selectedCity) filters.city = selectedCity;
        if (selectedCategory) filters.category = selectedCategory;
        if (searchQuery) filters.q = searchQuery;

        const result = await api.getPros(filters);
        if (result.success && result.data) {
            if (reset) {
                setPros(result.data);
            } else {
                setPros(prev => [...prev, ...result.data!]);
            }
            setHasMore(result.data.length === 12);
            setPage(currentPage);
        }

        setIsLoading(false);
        setIsFetchingMore(false);
    };

    const loadMore = () => {
        loadPros(false);
    };

    const toggleLike = async (proId: string) => {
        const newLiked = new Set(likedPros);
        if (likedPros.has(proId)) {
            newLiked.delete(proId);
            await api.removeFavorite(proId);
        } else {
            newLiked.add(proId);
            await api.addFavorite(proId);
        }
        setLikedPros(newLiked);
    };

    const handleMessage = async (proId: string, userId: string) => {
        const result = await api.createConversation(userId);
        if (result.success && result.data?.id) {
            router.push(`/chat/${result.data.id}`);
        }
    };

    const filteredPros = pros.filter((pro) => {
        const query = searchQuery.toLowerCase();
        return (
            pro.user.name?.toLowerCase().includes(query) ||
            pro.city.name.toLowerCase().includes(query) ||
            pro.services?.some(s => s.name.toLowerCase().includes(query)) ||
            pro.serviceCategories.some(c => c.name.toLowerCase().includes(query))
        );
    });

    // Category emoji mapping
    const getCategoryEmoji = (name: string) => {
        const emojiMap: Record<string, string> = {
            'Coiffure': '💇',
            'Massage': '💆',
            'Manucure': '💅',
            'Esthétique': '✨',
            'Barbier': '🧔',
            'Maquillage': '💄',
            'Soin': '🧖',
            'Bien-être': '🌸',
        };
        return emojiMap[name] || '✨';
    };

    const renderPro = ({ item }: { item: ProProfile }) => {
        const avgRating = item.reviews.length > 0
            ? item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviews.length
            : 0;
        const isLiked = likedPros.has(item.id);
        const coverImage = item.gallery?.[0]?.imageUrl;

        return (
            <View style={styles.card}>
                {/* Image Section */}
                <TouchableOpacity
                    onPress={() => router.push(`/pro/${item.id}`)}
                    activeOpacity={0.95}
                >
                    {coverImage ? (
                        <Image
                            source={{ uri: coverImage }}
                            style={styles.cardImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.cardImage, styles.placeholderImage]}>
                            <Ionicons name="person" size={60} color={Colors.gray.medium} />
                        </View>
                    )}

                    {/* Rating Badge */}
                    {avgRating > 0 && (
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={14} color="#FFD700" />
                            <Text style={styles.ratingText}>{avgRating.toFixed(1)}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Info Section */}
                <TouchableOpacity
                    style={styles.infoSection}
                    onPress={() => router.push(`/pro/${item.id}`)}
                >
                    <View style={styles.nameRow}>
                        <View>
                            <Text style={styles.proName}>{item.user.name}</Text>
                            <View style={styles.locationBadge}>
                                <Ionicons name="location" size={12} color={Colors.gray.medium} />
                                <Text style={styles.cityText}>{item.city.name}</Text>
                            </View>
                        </View>
                        <Text style={styles.priceTag}>{item.hourlyRate}₪/h</Text>
                    </View>

                    {/* Services Preview */}
                    {item.services && item.services.length > 0 && (
                        <View style={styles.servicesPreview}>
                            {item.services.slice(0, 2).map((service) => (
                                <View key={service.id} style={styles.serviceRow}>
                                    <Text style={styles.serviceName} numberOfLines={1}>{service.name}</Text>
                                    <Text style={styles.servicePrice}>{service.price}₪</Text>
                                </View>
                            ))}
                            {item.services.length > 2 && (
                                <Text style={styles.moreServices}>+{item.services.length - 2} autres services</Text>
                            )}
                        </View>
                    )}
                </TouchableOpacity>

                {/* Footer Actions */}
                <View style={styles.cardFooter}>
                    <View style={styles.footerAction}>
                        <AnimatedHeart
                            isLiked={isLiked}
                            onPress={() => toggleLike(item.id)}
                            size={24}
                        />
                        <Text style={[styles.footerActionText, isLiked && { color: '#FF3B5C' }]}>
                            {isLiked ? 'Favoris' : 'Enregistrer'}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.footerAction, styles.bookAction]}
                        onPress={() => router.push(`/pro/${item.id}`)}
                    >
                        <Text style={styles.bookActionText}>Voir les disponibilités</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // Simplified loading state handling to show Skeletons within the FlatList

    return (
        <View style={styles.container}>
            {/* Header with Logo */}
            <View style={styles.header}>
                <Text style={styles.logo}>AniReserve</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/messages')}>
                    <Ionicons name="paper-plane-outline" size={26} color={Colors.secondary} />
                </TouchableOpacity>
            </View>

            {/* Offline Banner */}
            {isOffline && (
                <View style={styles.offlineBanner}>
                    <Ionicons name="cloud-offline" size={16} color={Colors.white} />
                    <Text style={styles.offlineText}>Mode hors ligne</Text>
                </View>
            )}

            {/* Category Stories */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.storiesContainer}
                contentContainerStyle={styles.storiesContent}
            >
                {isLoading && categories.length === 0 ? (
                    // Stories Skeletons
                    [1, 2, 3, 4, 5].map((i) => (
                        <View key={i} style={styles.storyItem}>
                            <Skeleton width={64} height={64} borderRadius={32} />
                            <Skeleton width={50} height={12} style={{ marginTop: 8 }} />
                        </View>
                    ))
                ) : (
                    categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[
                                styles.storyItem,
                                selectedCategory === cat.id && styles.storyItemActive
                            ]}
                            onPress={() => setSelectedCategory(
                                selectedCategory === cat.id ? '' : cat.id
                            )}
                        >
                            <View style={[
                                styles.storyCircle,
                                selectedCategory === cat.id && styles.storyCircleActive
                            ]}>
                                <Text style={styles.storyEmoji}>{getCategoryEmoji(cat.name)}</Text>
                            </View>
                            <Text style={[
                                styles.storyLabel,
                                selectedCategory === cat.id && styles.storyLabelActive
                            ]} numberOfLines={1}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={Colors.gray.medium} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher..."
                    placeholderTextColor={Colors.gray.medium}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={() => loadPros(true)}
                />
                {selectedCity && (
                    <TouchableOpacity
                        style={styles.cityChip}
                        onPress={() => setShowCityModal(true)}
                    >
                        <Text style={styles.cityChipText}>
                            {cities.find(c => c.id === selectedCity)?.name}
                        </Text>
                        <TouchableOpacity onPress={() => setSelectedCity('')}>
                            <Ionicons name="close-circle" size={16} color={Colors.white} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
                {!selectedCity && (
                    <TouchableOpacity onPress={() => setShowCityModal(true)}>
                        <Ionicons name="location-outline" size={22} color={Colors.primary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Feed */}
            <FlatList
                data={isLoading && filteredPros.length === 0 ? [1, 2, 3] as any : filteredPros}
                renderItem={isLoading && filteredPros.length === 0 ? () => <ProCardSkeleton /> : renderPro}
                keyExtractor={(item, index) => isLoading ? `skeleton-${index}` : item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading && filteredPros.length > 0}
                        onRefresh={loadData}
                        colors={[Colors.primary]}
                        tintColor={Colors.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isFetchingMore ? (
                        <View style={{ paddingVertical: 20 }}>
                            <ActivityIndicator color={Colors.primary} />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconContainer}>
                                <Ionicons name="search" size={40} color={Colors.primary} />
                            </View>
                            <Text style={styles.emptyText}>Aucun pro à l'horizon</Text>
                            <Text style={styles.emptySubtext}>Désolé, nous n'avons trouvé aucun professionnel correspondant à vos critères.</Text>
                            <TouchableOpacity
                                style={styles.resetButton}
                                onPress={() => {
                                    setSearchQuery('');
                                    setSelectedCity('');
                                    setSelectedCategory('');
                                }}
                            >
                                <Text style={styles.resetButtonText}>Réinitialiser les filtres</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
            />

            {/* City Modal */}
            <Modal visible={showCityModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>📍 Choisir une ville</Text>
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
                                        <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
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
                            <Text style={styles.modalTitle}>✨ Catégories</Text>
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
                                        {getCategoryEmoji(category.name)} {category.name}
                                    </Text>
                                    {selectedCategory === category.id && (
                                        <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
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
        backgroundColor: '#FAFAFA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 0.5,
        borderBottomColor: '#DBDBDB',
    },
    logo: {
        fontSize: 26,
        fontWeight: '700',
        color: Colors.secondary,
        letterSpacing: -0.5,
    },
    offlineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.warning,
        padding: 8,
        gap: 6,
        justifyContent: 'center',
    },
    offlineText: {
        color: Colors.white,
        fontSize: 13,
        fontWeight: '600',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    // Category Stories
    storiesContainer: {
        backgroundColor: '#fff',
        maxHeight: 100,
        borderBottomWidth: 0.5,
        borderBottomColor: '#DBDBDB',
    },
    storiesContent: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        gap: 16,
    },
    storyItem: {
        alignItems: 'center',
        width: 72,
    },
    storyItemActive: {},
    storyCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#DBDBDB',
    },
    storyCircleActive: {
        borderColor: Colors.primary,
        borderWidth: 3,
    },
    storyEmoji: {
        fontSize: 28,
    },
    storyLabel: {
        fontSize: 11,
        color: Colors.gray.dark,
        marginTop: 4,
        textAlign: 'center',
    },
    storyLabelActive: {
        color: Colors.primary,
        fontWeight: '600',
    },
    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFEFEF',
        margin: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: Colors.secondary,
    },
    cityChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        gap: 4,
    },
    cityChipText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    // Feed Cards
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 0,
        marginBottom: 24,
        borderTopWidth: 0.5,
        borderTopColor: '#DBDBDB',
    },
    cardImage: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 0.75,
        backgroundColor: '#F0F0F0',
    },
    placeholderImage: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    ratingBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    ratingText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    // Services Preview
    servicesPreview: {
        marginTop: 4,
        paddingTop: 8,
        borderTopWidth: 0.5,
        borderTopColor: '#F0F0F0',
    },
    serviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primaryAlpha(0.1),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.secondary,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 15,
        color: Colors.gray.medium,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    resetButton: {
        backgroundColor: Colors.secondary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    resetButtonText: {
        color: Colors.white,
        fontSize: 15,
        fontWeight: '600',
    },
    serviceName: {
        fontSize: 13,
        color: Colors.gray.dark,
        flex: 1,
        marginRight: 8,
    },
    servicePrice: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.secondary,
    },
    moreServices: {
        fontSize: 11,
        color: Colors.gray.medium,
        fontStyle: 'italic',
        marginTop: 2,
    },
    // Footer
    cardFooter: {
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderTopColor: '#DBDBDB',
        paddingVertical: 8,
        paddingHorizontal: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerActionText: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.secondary,
    },
    bookAction: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    bookActionText: {
        color: Colors.white,
        fontSize: 13,
        fontWeight: '600',
    },
    priceTag: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.primary,
    },
    // Info Section
    infoSection: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 12,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    proName: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.secondary,
        marginBottom: 2,
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    cityText: {
        fontSize: 12,
        color: Colors.gray.medium,
    },
    categoriesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    categoryPill: {
        fontSize: 12,
        color: Colors.gray.dark,
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    // Modal
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
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.secondary,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: 0.5,
        borderBottomColor: '#EFEFEF',
    },
    modalItemActive: {
        backgroundColor: Colors.primary + '10',
    },
    modalItemText: {
        fontSize: 16,
        color: Colors.secondary,
    },
    modalItemTextActive: {
        fontWeight: '600',
        color: Colors.primary,
    },
});
