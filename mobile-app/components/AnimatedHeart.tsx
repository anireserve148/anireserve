import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
} from 'react-native-reanimated';

interface AnimatedHeartProps {
    isLiked: boolean;
    onPress: () => void;
    size?: number;
    likedColor?: string;
    unlikedColor?: string;
}

export const AnimatedHeart: React.FC<AnimatedHeartProps> = ({
    isLiked,
    onPress,
    size = 24,
    likedColor = '#FF3B5C',
    unlikedColor = '#18223b',
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePress = () => {
        // Bounce animation when clicking
        scale.value = withSequence(
            withSpring(1.3, { damping: 2, stiffness: 200 }),
            withSpring(1, { damping: 3, stiffness: 150 })
        );
        onPress();
    };

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
            <Animated.View style={animatedStyle}>
                <Ionicons
                    name={isLiked ? 'heart' : 'heart-outline'}
                    size={size}
                    color={isLiked ? likedColor : unlikedColor}
                />
            </Animated.View>
        </TouchableOpacity>
    );
};
