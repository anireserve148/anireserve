import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { ProProfile } from '../../types';
import { Colors, Spacing, FontSizes } from '../../constants';

export default function HomeScreen() {
    const router = useRouter();
    const [pros, setPros] = useState<ProProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadPros();
    }, []);

    const loadPros = async () => {
        setIsLoading(true);
        const result = await api.getPros();
        if (result.success && result.data) {
            setPros(result.data);
        }
        setIsLoading(false);
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

    return (
        <View style={styles.container}>
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

            {/* Pros List */}
            <FlatList
                data={filteredPros}
                renderItem={renderPro}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={64} color={Colors.gray.medium} />
                        <Text style={styles.emptyText}>Aucun professionnel trouvé</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
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
});
