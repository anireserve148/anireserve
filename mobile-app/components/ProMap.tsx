import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, Alert } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { ProProfile } from '../types';
import { Colors } from '../constants';
import { CustomMarker } from './CustomMarker';

const { width, height } = Dimensions.get('window');

interface ProMapProps {
    pros: ProProfile[];
    onMarkerPress?: (pro: ProProfile) => void;
}

export const ProMap: React.FC<ProMapProps> = ({ pros, onMarkerPress }) => {
    const mapRef = useRef<MapView>(null);
    const [selectedProId, setSelectedProId] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<Region | null>(null);

    // Filtrer seulement les pros avec coordonnées
    const prosWithCoords = pros.filter(p => p.latitude && p.longitude);

    // Region initiale centrée sur Paris
    const initialRegion = {
        latitude: 48.8566,
        longitude: 2.3522,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
    };

    useEffect(() => {
        requestLocationPermission();
    }, []);

    const requestLocationPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({});
                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
            }
        } catch (error) {
            console.log('Error getting location:', error);
        }
    };

    const centerOnUser = async () => {
        if (userLocation) {
            mapRef.current?.animateToRegion(userLocation, 1000);
        } else {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({});
                const region = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                };
                setUserLocation(region);
                mapRef.current?.animateToRegion(region, 1000);
            } else {
                Alert.alert(
                    'Permission requise',
                    'Autorisez la localisation pour centrer la carte sur votre position'
                );
            }
        }
    };

    const handleMarkerPress = (pro: ProProfile) => {
        setSelectedProId(pro.id);
        onMarkerPress?.(pro);
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={userLocation || initialRegion}
                showsUserLocation
                showsMyLocationButton={false}
                showsCompass
                toolbarEnabled={false}
            >
                {prosWithCoords.map((pro) => (
                    <CustomMarker
                        key={pro.id}
                        coordinate={{
                            latitude: pro.latitude!,
                            longitude: pro.longitude!,
                        }}
                        photoUrl={pro.gallery?.[0]?.imageUrl || pro.user.image}
                        onPress={() => handleMarkerPress(pro)}
                        isSelected={selectedProId === pro.id}
                    />
                ))}
            </MapView>

            {/* Me localiser button */}
            <TouchableOpacity
                style={styles.locationButton}
                onPress={centerOnUser}
                activeOpacity={0.8}
            >
                <Ionicons name="locate" size={24} color={Colors.primary} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width,
        height,
    },
    locationButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
});
