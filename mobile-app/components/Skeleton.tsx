import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing } from '../constants';

export const ProCardSkeleton = () => {
    const animatedValue = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.loop(
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
        ).start();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View style={styles.card}>
            <Animated.View style={[styles.avatar, { opacity }]} />
            <View style={styles.info}>
                <Animated.View style={[styles.nameLine, { opacity }]} />
                <Animated.View style={[styles.cityLine, { opacity }]} />
                <View style={styles.categories}>
                    <Animated.View style={[styles.categoryBadge, { opacity }]} />
                    <Animated.View style={[styles.categoryBadge, { opacity }]} />
                </View>
            </View>
            <View style={styles.right}>
                <Animated.View style={[styles.ratingBadge, { opacity }]} />
                <Animated.View style={[styles.priceLine, { opacity }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
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
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.gray.light,
        marginRight: Spacing.md,
    },
    info: {
        flex: 1,
    },
    nameLine: {
        width: '70%',
        height: 18,
        backgroundColor: Colors.gray.light,
        borderRadius: 4,
        marginBottom: Spacing.sm,
    },
    cityLine: {
        width: '40%',
        height: 14,
        backgroundColor: Colors.gray.light,
        borderRadius: 4,
        marginBottom: Spacing.sm,
    },
    categories: {
        flexDirection: 'row',
        gap: Spacing.xs,
    },
    categoryBadge: {
        width: 60,
        height: 24,
        backgroundColor: Colors.gray.light,
        borderRadius: 8,
    },
    right: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    ratingBadge: {
        width: 45,
        height: 24,
        backgroundColor: Colors.gray.light,
        borderRadius: 8,
    },
    priceLine: {
        width: 60,
        height: 16,
        backgroundColor: Colors.gray.light,
        borderRadius: 4,
    },
});
