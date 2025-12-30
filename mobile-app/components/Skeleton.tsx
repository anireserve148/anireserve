import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle, DimensionValue } from 'react-native';

interface SkeletonProps {
    width?: DimensionValue;
    height?: DimensionValue;
    borderRadius?: number;
    style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius = 8,
    style
}) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();

        return () => animation.stop();
    }, [animatedValue]);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                    opacity,
                },
                style,
            ]}
        />
    );
};

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: '#E1E9EE',
    },
});

export const ProCardSkeleton = () => {
    return (
        <View style={cardStyles.container}>
            <Skeleton height={200} borderRadius={16} style={{ marginBottom: 12 }} />
            <View style={{ padding: 8 }}>
                <Skeleton width="60%" height={24} style={{ marginBottom: 8 }} />
                <Skeleton width="40%" height={16} style={{ marginBottom: 12 }} />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Skeleton width={80} height={32} borderRadius={16} />
                    <Skeleton width={80} height={32} borderRadius={16} />
                </View>
            </View>
        </View>
    );
};

const cardStyles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 16,
        padding: 8,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
});
