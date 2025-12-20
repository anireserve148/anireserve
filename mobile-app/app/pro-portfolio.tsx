import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Modal,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes } from '../constants';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - Spacing.md * 4) / 3;

interface PortfolioPhoto {
    id: string;
    url: string;
    caption?: string;
    likes: number;
    createdAt: string;
}

const MOCK_PHOTOS: PortfolioPhoto[] = [
    { id: '1', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400', caption: 'Coupe tendance été', likes: 24, createdAt: '2025-12-15' },
    { id: '2', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400', caption: 'Coloration naturelle', likes: 18, createdAt: '2025-12-10' },
    { id: '3', url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', caption: 'Brushing élégant', likes: 32, createdAt: '2025-12-05' },
    { id: '4', url: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400', caption: 'Maquillage mariée', likes: 45, createdAt: '2025-12-01' },
    { id: '5', url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400', caption: 'Coiffure mariage', likes: 38, createdAt: '2025-11-28' },
    { id: '6', url: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=400', caption: 'Soin capillaire', likes: 15, createdAt: '2025-11-25' },
];

export default function ProPortfolioScreen() {
    const router = useRouter();
    const [photos, setPhotos] = useState<PortfolioPhoto[]>(MOCK_PHOTOS);
    const [selectedPhoto, setSelectedPhoto] = useState<PortfolioPhoto | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const handleAddPhoto = () => {
        // TODO: Implement image picker
        if (typeof window !== 'undefined') {
            window.alert('📷 Fonctionnalité en cours de développement\n\nBientôt vous pourrez ajouter des photos depuis votre galerie ou appareil photo.');
        }
    };

    const handleDeletePhoto = (id: string) => {
        if (typeof window !== 'undefined') {
            if (window.confirm('Supprimer cette photo ?')) {
                setPhotos(prev => prev.filter(p => p.id !== id));
                setSelectedPhoto(null);
            }
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Mon Portfolio</Text>
                <TouchableOpacity onPress={handleAddPhoto} style={styles.addBtn}>
                    <Ionicons name="add" size={28} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Stats - simplified */}
            <View style={styles.statsBar}>
                <Text style={styles.statsText}>📸 {photos.length} photos</Text>
                <Text style={styles.statsHint}>Montrez votre travail aux clients !</Text>
            </View>

            {/* Grid */}
            <ScrollView contentContainerStyle={styles.grid}>
                {/* Add Photo Card */}
                <TouchableOpacity style={styles.addPhotoCard} onPress={handleAddPhoto}>
                    <Ionicons name="camera-outline" size={32} color={Colors.primary} />
                    <Text style={styles.addPhotoText}>Ajouter</Text>
                </TouchableOpacity>

                {/* Photos */}
                {photos.map((photo) => (
                    <TouchableOpacity
                        key={photo.id}
                        style={styles.photoCard}
                        onPress={() => setSelectedPhoto(photo)}
                    >
                        <Image source={{ uri: photo.url }} style={styles.photo} />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Photo Detail Modal */}
            <Modal
                visible={selectedPhoto !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedPhoto(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedPhoto && (
                            <>
                                <Image source={{ uri: selectedPhoto.url }} style={styles.modalImage} />
                                <View style={styles.modalInfo}>
                                    <Text style={styles.modalCaption}>{selectedPhoto.caption}</Text>
                                    <Text style={styles.modalDate}>Ajouté le {selectedPhoto.createdAt}</Text>
                                </View>
                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={styles.modalBtn}
                                        onPress={() => setSelectedPhoto(null)}
                                    >
                                        <Text style={styles.modalBtnText}>Fermer</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalBtn, styles.deleteBtn]}
                                        onPress={() => handleDeletePhoto(selectedPhoto.id)}
                                    >
                                        <Ionicons name="trash-outline" size={20} color={Colors.white} />
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
        padding: Spacing.md,
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray.light,
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
    statsBar: {
        backgroundColor: Colors.card,
        padding: Spacing.md,
        alignItems: 'center',
    },
    statsText: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.primary,
    },
    statsHint: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginTop: Spacing.xs,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.accent + '10',
        margin: Spacing.md,
        padding: Spacing.md,
        borderRadius: 12,
    },
    infoText: {
        flex: 1,
        fontSize: FontSizes.sm,
        color: Colors.accent,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: Spacing.md,
        gap: Spacing.xs,
    },
    addPhotoCard: {
        width: PHOTO_SIZE,
        height: PHOTO_SIZE,
        backgroundColor: Colors.gray.lightest,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: Colors.gray.light,
    },
    addPhotoText: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginTop: Spacing.xs,
    },
    photoCard: {
        width: PHOTO_SIZE,
        height: PHOTO_SIZE,
        borderRadius: 8,
        overflow: 'hidden',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    photoOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: Spacing.xs,
    },
    photoLikes: {
        fontSize: FontSizes.xs,
        color: Colors.white,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: width - Spacing.xl * 2,
        backgroundColor: Colors.white,
        borderRadius: 16,
        overflow: 'hidden',
    },
    modalImage: {
        width: '100%',
        height: 300,
    },
    modalInfo: {
        padding: Spacing.md,
    },
    modalCaption: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.primary,
    },
    modalStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
    },
    modalLikes: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.primary,
    },
    modalDate: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginLeft: 'auto',
    },
    modalActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: Colors.gray.light,
    },
    modalBtn: {
        flex: 1,
        padding: Spacing.lg,
        alignItems: 'center',
    },
    modalBtnText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.primary,
    },
    deleteBtn: {
        backgroundColor: Colors.error,
    },
});
