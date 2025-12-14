import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

export default function SearchScreen() {
    const [search, setSearch] = useState('');

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>🐾 AniReserve</Text>
                <Text style={styles.headerSubtitle}>Trouvez votre professionnel</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textLight} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher un service..."
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.sectionTitle}>Catégories Populaires</Text>

                <View style={styles.categoriesGrid}>
                    {['Toilettage', 'Promenade', 'Dressage', 'Vétérinaire', 'Garde', 'Autre'].map((cat) => (
                        <TouchableOpacity key={cat} style={styles.categoryCard}>
                            <Text style={styles.categoryEmoji}>
                                {cat === 'Toilettage' ? '✂️' : cat === 'Promenade' ? '🚶' : cat === 'Dressage' ? '🎓' : cat === 'Vétérinaire' ? '🏥' : cat === 'Garde' ? '🏠' : '🐾'}
                            </Text>
                            <Text style={styles.categoryText}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Professionnels Recommandés</Text>

                <View style={styles.prosList}>
                    {[1, 2, 3].map((i) => (
                        <TouchableOpacity key={i} style={styles.proCard}>
                            <View style={styles.proAvatar}>
                                <Text style={styles.proAvatarText}>👤</Text>
                            </View>
                            <View style={styles.proInfo}>
                                <Text style={styles.proName}>Professionnel {i}</Text>
                                <Text style={styles.proCategory}>Toilettage • Paris</Text>
                                <View style={styles.proRating}>
                                    <Ionicons name="star" size={16} color={COLORS.warning} />
                                    <Text style={styles.proRatingText}>4.8 (24 avis)</Text>
                                </View>
                            </View>
                            <Text style={styles.proPrice}>45€/h</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: 60,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.lg,
    },
    headerTitle: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: SPACING.xs,
    },
    headerSubtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.white,
        opacity: 0.9,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        margin: SPACING.lg,
        paddingHorizontal: SPACING.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchIcon: {
        marginRight: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        paddingVertical: SPACING.md,
        fontSize: FONT_SIZES.md,
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.md,
        marginTop: SPACING.md,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
        marginBottom: SPACING.lg,
    },
    categoryCard: {
        width: '30%',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    categoryEmoji: {
        fontSize: 32,
        marginBottom: SPACING.sm,
    },
    categoryText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text,
        fontWeight: '500',
    },
    prosList: {
        gap: SPACING.md,
        paddingBottom: SPACING.xxl,
    },
    proCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    proAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    proAvatarText: {
        fontSize: 24,
    },
    proInfo: {
        flex: 1,
    },
    proName: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 2,
    },
    proCategory: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
        marginBottom: 4,
    },
    proRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    proRatingText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
    },
    proPrice: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
});
