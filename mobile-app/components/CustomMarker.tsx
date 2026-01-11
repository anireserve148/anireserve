import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Colors } from '../constants';

interface CustomMarkerProps {
    coordinate: {
        latitude: number;
        longitude: number;
    };
    photoUrl?: string | null;
    onPress?: () => void;
    isSelected?: boolean;
}

export const CustomMarker: React.FC<CustomMarkerProps> = ({
    coordinate,
    photoUrl,
    onPress,
    isSelected = false,
}) => {
    return (
        <Marker
            coordinate={coordinate}
            onPress={onPress}
            anchor={{ x: 0.5, y: 0.5 }}
        >
            <View style={[
                styles.markerContainer,
                isSelected && styles.markerSelected
            ]}>
                {photoUrl ? (
                    <Image
                        source={{ uri: photoUrl }}
                        style={styles.markerImage}
                    />
                ) : (
                    <View style={styles.markerPlaceholder}>
                        <View style={styles.markerDot} />
                    </View>
                )}
            </View>
        </Marker>
    );
};

const MARKER_SIZE = 44;
const IMAGE_SIZE = 36;

const styles = StyleSheet.create({
    markerContainer: {
        width: MARKER_SIZE,
        height: MARKER_SIZE,
        borderRadius: MARKER_SIZE / 2,
        backgroundColor: Colors.white,
        borderWidth: 3,
        borderColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    markerSelected: {
        borderColor: Colors.accent,
        borderWidth: 4,
        transform: [{ scale: 1.2 }],
    },
    markerImage: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderRadius: IMAGE_SIZE / 2,
    },
    markerPlaceholder: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderRadius: IMAGE_SIZE / 2,
        backgroundColor: Colors.gray.light,
        justifyContent: 'center',
        alignItems: 'center',
    },
    markerDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.primary,
    },
});
