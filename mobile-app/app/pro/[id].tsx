import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    Image,
    Dimensions,
    Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { ProProfile } from '../../types';
import { Colors, Spacing, FontSizes, Shadows } from '../../constants';
import { Skeleton } from '../../components/Skeleton';

const { width: screenWidth } = Dimensions.get('window');

export default function ProProfileScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [pro, setPro] = useState<ProProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadPro();
            checkFavorite();
        }
    }, [id]);

    const [activeTab, setActiveTab] = useState<'services' | 'portfolio' | 'reviews'>('services');

    const loadPro = async () => {
        setIsLoading(true);
        const result = await api.getProById(id as string);
        if (result.success && result.data) {
            setPro(result.data);
        } else {
            Alert.alert('Erreur', result.error || 'Professionnel non trouvé');
            router.back();
        }
        setIsLoading(false);
    };

    const checkFavorite = async () => {
        const result = await api.getFavorites();
        if (result.success && result.data) {
            setIsFavorite(result.data.some(f => f.id === id));
        }
    };

    const toggleFavorite = async () => {
        if (isFavorite) {
            const result = await api.removeFavorite(id as string);
            if (result.success) {
                setIsFavorite(false);
                Alert.alert('Supprimé', 'Retiré des favoris');
            }
        } else {
            const result = await api.addFavorite(id as string);
            if (result.success) {
                setIsFavorite(true);
                Alert.alert('Ajouté', 'Ajouté aux favoris');
            }
        }
    };

    const handleBook = (service?: { id: string; name: string; price: number; duration: number }) => {
        router.push({
            pathname: '/quick-book',
            params: {
                id: id as string,
                name: pro?.user?.name || 'Pro',
                rate: String(pro?.hourlyRate || 100),
                serviceId: service?.id || '',
                serviceName: service?.name || '',
                servicePrice: service ? String(service.price) : '',
                serviceDuration: service ? String(service.duration) : '',
            },
        });
    };

    const handleQuickBook = () => {
        handleBook();
    };

    const handleContact = async () => {
        if (!pro?.user?.id) {
            Alert.alert('Erreur', 'Professionnel non trouvé');
            return;
        }
        const result = await api.createConversation(pro.user.id);
        if (result.success && result.data?.id) {
            router.push(`/chat/${result.data.id}`);
        } else {
            Alert.alert('Erreur', 'Impossible de démarrer la conversation');
        }
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={[styles.navHeader, { borderBottomWidth: 0 }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.navIcon}>
                        <Ionicons name="chevron-back" size={28} color={Colors.secondary} />
                    </TouchableOpacity>
                </View>
                <View style={styles.instaHeader}>
                    <View style={styles.instaTopRow}>
                        <Skeleton width={90} height={90} borderRadius={45} />
                        <View style={styles.instaStatsContainer}>
                            <View style={styles.instaStatItem}><Skeleton width={40} height={20} /><Skeleton width={50} height={12} style={{ marginTop: 4 }} /></View>
                            <View style={styles.instaStatItem}><Skeleton width={40} height={20} /><Skeleton width={50} height={12} style={{ marginTop: 4 }} /></View>
                            <View style={styles.instaStatItem}><Skeleton width={40} height={20} /><Skeleton width={50} height={12} style={{ marginTop: 4 }} /></View>
                        </View>
                    </View>
                    <Skeleton width="50%" height={24} style={{ marginBottom: 12 }} />
                    <Skeleton width="100%" height={16} style={{ marginBottom: 8 }} />
                    <Skeleton width="80%" height={16} style={{ marginBottom: 20 }} />
                    <View style={styles.instaActionRow}>
                        <Skeleton height={40} borderRadius={8} style={{ flex: 1 }} />
                        <Skeleton height={40} borderRadius={8} style={{ flex: 1 }} />
                    </View>
                </View>
                <View style={styles.tabsContainer}>
                    <View style={styles.tab}><Skeleton width={30} height={30} /></View>
                    <View style={styles.tab}><Skeleton width={30} height={30} /></View>
                    <View style={styles.tab}><Skeleton width={30} height={30} /></View>
                </View>
                <View style={{ padding: 15 }}>
                    <Skeleton height={100} borderRadius={12} style={{ marginBottom: 16 }} />
                    <Skeleton height={100} borderRadius={12} style={{ marginBottom: 16 }} />
                </View>
            </View>
        );
    }

    if (!pro) {
        return null;
    }

    const avgRating = pro.reviews.length > 0
        ? pro.reviews.reduce((sum, r) => sum + r.rating, 0) / pro.reviews.length
        : 0;

    return (
        <View style={styles.container}>
            {/* Nav Header */}
            <View style={styles.navHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.navIcon}>
                    <Ionicons name="chevron-back" size={28} color={Colors.secondary} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>{pro.user.name}</Text>
                <TouchableOpacity onPress={toggleFavorite} style={styles.navIcon}>
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={26}
                        color={isFavorite ? Colors.error : Colors.secondary}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Instagram Style Header */}
                <View style={styles.instaHeader}>
                    <View style={styles.instaTopRow}>
                        <View style={styles.instaAvatarContainer}>
                            <View style={styles.instaAvatar}>
                                <Text style={styles.instaAvatarText}>{pro.user.name?.[0] || 'P'}</Text>
                            </View>
                            <TouchableOpacity style={styles.instaAddStory}>
                                <Ionicons name="add-circle" size={22} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.instaStatsContainer}>
                            <View style={styles.instaStatItem}>
                                <Text style={styles.instaStatValue}>{pro.services?.length || 0}</Text>
                                <Text style={styles.instaStatLabel}>Services</Text>
                            </View>
                            <View style={styles.instaStatItem}>
                                <Text style={styles.instaStatValue}>{avgRating > 0 ? avgRating.toFixed(1) : '5.0'}</Text>
                                <Text style={styles.instaStatLabel}>Rating</Text>
                            </View>
                            <View style={styles.instaStatItem}>
                                <Text style={styles.instaStatValue}>{pro.gallery?.length || 0}</Text>
                                <Text style={styles.instaStatLabel}>Photos</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.instaBioContainer}>
                        <Text style={styles.instaName}>{pro.user.name}</Text>
                        <View style={styles.instaCategoryContainer}>
                            <Text style={styles.instaCategory}>
                                {pro.serviceCategories.map(c => c.name).join(' • ')}
                            </Text>
                        </View>
                        <Text style={styles.instaBio}>{pro.bio || 'Professionnel passionné à votre service.'}</Text>
                        {pro.city && (
                            <View style={styles.instaLocation}>
                                <Ionicons name="location-outline" size={14} color={Colors.primary} />
                                <Text style={styles.instaLocationText}>{pro.city.name}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.instaActionRow}>
                        <TouchableOpacity style={styles.instaPrimaryBtn} onPress={handleQuickBook}>
                            <Text style={styles.instaPrimaryBtnText}>Réserver</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.instaSecondaryBtn} onPress={handleContact}>
                            <Text style={styles.instaSecondaryBtnText}>Message</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'services' && styles.activeTab]}
                        onPress={() => setActiveTab('services')}
                    >
                        <Ionicons
                            name={activeTab === 'services' ? "list" : "list-outline"}
                            size={24}
                            color={activeTab === 'services' ? Colors.secondary : Colors.gray.medium}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'portfolio' && styles.activeTab]}
                        onPress={() => setActiveTab('portfolio')}
                    >
                        <Ionicons
                            name={activeTab === 'portfolio' ? "grid" : "grid-outline"}
                            size={22}
                            color={activeTab === 'portfolio' ? Colors.secondary : Colors.gray.medium}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
                        onPress={() => setActiveTab('reviews')}
                    >
                        <Ionicons
                            name={activeTab === 'reviews' ? "star" : "star-outline"}
                            size={24}
                            color={activeTab === 'reviews' ? Colors.secondary : Colors.gray.medium}
                        />
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                <View style={styles.tabContent}>
                    {activeTab === 'services' && (
                        <View style={styles.servicesList}>
                            {pro.services && pro.services.map((service) => (
                                <TouchableOpacity
                                    key={service.id}
                                    style={styles.serviceCard}
                                    onPress={() => handleBook(service)}
                                >
                                    <View style={styles.serviceMain}>
                                        <Text style={styles.serviceTitle}>{service.name}</Text>
                                        <Text style={styles.serviceDesc} numberOfLines={1}>{service.description || 'Prestation de qualité'}</Text>
                                        <View style={styles.serviceMeta}>
                                            <Ionicons name="time-outline" size={12} color={Colors.gray.medium} />
                                            <Text style={styles.serviceMetaText}>{service.duration || 60} min</Text>
                                        </View>
                                    </View>
                                    <View style={styles.serviceSide}>
                                        <Text style={styles.servicePrice}>{service.price}₪</Text>
                                        <View style={styles.addBtn}>
                                            <Ionicons name="add" size={20} color={Colors.white} />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {activeTab === 'portfolio' && (
                        <View style={styles.portfolioGrid}>
                            {pro.gallery && pro.gallery.length > 0 ? (
                                pro.gallery.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        onPress={() => setSelectedImage(item.imageUrl)}
                                        style={styles.gridItem}
                                    >
                                        <Image
                                            source={{ uri: item.imageUrl }}
                                            style={styles.gridImage}
                                        />
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <View style={styles.emptyState}>
                                    <Ionicons name="images-outline" size={48} color={Colors.gray.light} />
                                    <Text style={styles.emptyText}>Aucune photo publiée</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {activeTab === 'reviews' && (
                        <View style={styles.reviewsView}>
                            {pro.reviews.length > 0 ? (
                                pro.reviews.map((review) => (
                                    <View key={review.id} style={styles.commentCard}>
                                        <View style={styles.commentHeader}>
                                            <Text style={styles.commentUser}>{review.client.name}</Text>
                                            <View style={styles.commentStars}>
                                                {[...Array(5)].map((_, i) => (
                                                    <Ionicons
                                                        key={i}
                                                        name="star"
                                                        size={12}
                                                        color={i < review.rating ? Colors.accent : Colors.gray.light}
                                                    />
                                                ))}
                                            </View>
                                        </View>
                                        <Text style={styles.commentText}>{review.comment || 'Sans commentaire'}</Text>
                                        <Text style={styles.commentDate}>
                                            {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                        </Text>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.emptyState}>
                                    <Ionicons name="star-outline" size={48} color={Colors.gray.light} />
                                    <Text style={styles.emptyText}>Aucun avis client</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Image Viewer Modal */}
            <Modal visible={!!selectedImage} transparent animationType="fade">
                <View style={styles.modalFull}>
                    <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedImage(null)}>
                        <Ionicons name="close" size={32} color={Colors.white} />
                    </TouchableOpacity>
                    {selectedImage && (
                        <Image source={{ uri: selectedImage }} style={styles.modalImg} resizeMode="contain" />
                    )}
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
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 15,
        paddingHorizontal: 20,
        backgroundColor: Colors.white,
        borderBottomWidth: 0.5,
        borderBottomColor: '#DBDBDB',
    },
    navIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.secondary,
    },
    instaHeader: {
        padding: 20,
    },
    instaTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    instaAvatarContainer: {
        position: 'relative',
    },
    instaAvatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 3,
        borderColor: '#E1306C', // Insta-gradient-like color
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
    },
    instaAvatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    instaAddStory: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.white,
        borderRadius: 12,
    },
    instaStatsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginLeft: 15,
    },
    instaStatItem: {
        alignItems: 'center',
    },
    instaStatValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.secondary,
    },
    instaStatLabel: {
        fontSize: 12,
        color: Colors.gray.medium,
        marginTop: 2,
    },
    instaBioContainer: {
        marginBottom: 20,
    },
    instaName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.secondary,
        marginBottom: 2,
    },
    instaCategoryContainer: {
        marginBottom: 4,
    },
    instaCategory: {
        fontSize: 14,
        color: Colors.gray.medium,
    },
    instaBio: {
        fontSize: 14,
        color: Colors.secondary,
        lineHeight: 20,
        marginBottom: 6,
    },
    instaLocation: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    instaLocationText: {
        fontSize: 12,
        color: Colors.primary,
        marginLeft: 4,
        fontWeight: '600',
    },
    instaActionRow: {
        flexDirection: 'row',
        gap: 10,
    },
    instaPrimaryBtn: {
        flex: 1,
        backgroundColor: Colors.primary,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    instaPrimaryBtnText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    instaSecondaryBtn: {
        flex: 1,
        backgroundColor: '#EFEFEF',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    instaSecondaryBtnText: {
        color: Colors.secondary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    tabsContainer: {
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderTopColor: '#DBDBDB',
    },
    tab: {
        flex: 1,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: Colors.secondary,
    },
    tabContent: {
        flex: 1,
    },
    servicesList: {
        padding: 15,
    },
    serviceCard: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    serviceMain: {
        flex: 1,
    },
    serviceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.secondary,
    },
    serviceDesc: {
        fontSize: 12,
        color: Colors.gray.medium,
        marginVertical: 4,
    },
    serviceMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    serviceMetaText: {
        fontSize: 11,
        color: Colors.gray.medium,
    },
    serviceSide: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginLeft: 10,
    },
    servicePrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    addBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    portfolioGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    gridItem: {
        width: screenWidth / 3,
        height: screenWidth / 3,
        padding: 1,
    },
    gridImage: {
        flex: 1,
        backgroundColor: '#F0F0F0',
    },
    reviewsView: {
        padding: 20,
    },
    commentCard: {
        marginBottom: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 15,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    commentUser: {
        fontWeight: 'bold',
        fontSize: 14,
        color: Colors.secondary,
    },
    commentStars: {
        flexDirection: 'row',
        gap: 2,
    },
    commentText: {
        fontSize: 14,
        color: Colors.secondary,
        lineHeight: 20,
    },
    commentDate: {
        fontSize: 11,
        color: Colors.gray.medium,
        marginTop: 6,
    },
    emptyState: {
        padding: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        marginTop: 10,
        color: Colors.gray.medium,
        fontSize: 14,
    },
    modalFull: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalClose: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
    },
    modalImg: {
        width: screenWidth,
        height: screenWidth,
    },
});
