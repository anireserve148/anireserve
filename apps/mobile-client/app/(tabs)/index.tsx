import { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Image,
    RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
    api,
    Colors,
    Spacing,
    BorderRadius,
    Shadows,
    SERVICE_CATEGORIES,
    type ProProfile,
} from '../src/shared/src';

export default function HomeScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [pros, setPros] = useState<ProProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadPros = async () => {
        try {
            const response = await api.getPros({
                category: selectedCategory || undefined,
                limit: 20,
            });
            setPros(response.data || []);
        } catch (error) {
            console.error('Failed to load pros:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadPros();
    }, [selectedCategory]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadPros();
    };

    const renderProCard = ({ item }: { item: ProProfile }) => (
        <TouchableOpacity
            style={styles.proCard}
            onPress={() => router.push(`/pro/${item.id}`)}
        >
            <Image
                source={{ uri: item.photos[0] || 'https://via.placeholder.com/300' }}
                style={styles.proImage}
            />
            <View style={styles.proInfo}>
                <View style={styles.proHeader}>
                    <Text style={styles.proName} numberOfLines={1}>
                        {item.businessName}
                    </Text>
                    {item.verified && (
                        <Ionicons name="checkmark-circle" size={18} color={Colors.info} />
                    )}
                </View>
                <Text style={styles.proCategory}>
                    {SERVICE_CATEGORIES.find(c => c.value === item.category)?.label}
                </Text>
                <View style={styles.proFooter}>
                    <View style={styles.rating}>
                        <Ionicons name="star" size={14} color="#FFB800" />
                        <Text style={styles.ratingText}>
                            {item.rating.toFixed(1)} ({item.reviewCount})
                        </Text>
                    </View>
                    <Text style={styles.proCity}>{item.city}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>AniReserve</Text>
                <TouchableOpacity onPress={() => router.push('/profile')}>
                    <Ionicons name="person-circle-outline" size={32} color={Colors.text} />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={Colors.textSecondary} />
                <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Rechercher un service..."
                    placeholderTextColor={Colors.textTertiary}
                />
            </View>

            {/* Categories */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
            >
                <TouchableOpacity
                    style={[
                        styles.categoryChip,
                        !selectedCategory && styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedCategory(null)}
                >
                    <Text
                        style={[
                            styles.categoryText,
                            !selectedCategory && styles.categoryTextActive,
                        ]}
                    >
                        Tous
                    </Text>
                </TouchableOpacity>
                {SERVICE_CATEGORIES.map((category) => (
                    <TouchableOpacity
                        key={category.value}
                        style={[
                            styles.categoryChip,
                            selectedCategory === category.value && styles.categoryChipActive,
                        ]}
                        onPress={() => setSelectedCategory(category.value)}
                    >
                        <Text style={styles.categoryEmoji}>{category.icon}</Text>
                        <Text
                            style={[
                                styles.categoryText,
                                selectedCategory === category.value && styles.categoryTextActive,
                            ]}
                        >
                            {category.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Pros List */}
            <FlatList
                data={pros}
                renderItem={renderProCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.prosList}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Aucun professionnel trouvé</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundSecondary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: 60,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.white,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        marginHorizontal: Spacing.lg,
        marginVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        height: 48,
        ...Shadows.sm,
    },
    searchInput: {
        flex: 1,
        marginLeft: Spacing.sm,
        fontSize: 16,
        color: Colors.text,
    },
    categoriesContainer: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
        gap: Spacing.sm,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.white,
        gap: Spacing.xs,
    },
    categoryChipActive: {
        backgroundColor: Colors.accent,
    },
    categoryEmoji: {
        fontSize: 16,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text,
    },
    categoryTextActive: {
        color: Colors.white,
    },
    prosList: {
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    proCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Shadows.md,
    },
    proImage: {
        width: '100%',
        height: 180,
        backgroundColor: Colors.gray[200],
    },
    proInfo: {
        padding: Spacing.md,
    },
    proHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.xs,
    },
    proName: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        flex: 1,
    },
    proCategory: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
    },
    proFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    proCity: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    emptyState: {
        padding: Spacing.xxl,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
});
