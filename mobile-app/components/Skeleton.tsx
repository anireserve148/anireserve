import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

export const Skeleton: React.FC<{
    width?: number | string;
    height?: number;
    borderRadius?: number;
}> = ({ width = '100%', height = 20, borderRadius = 8 }) => {
    return (
        <SkeletonPlaceholder
            borderRadius={4}
            highlightColor="#F0F0F0"
            backgroundColor="#E1E9EE"
            speed={1200}
        >
            <SkeletonPlaceholder.Item width={width} height={height} borderRadius={borderRadius} />
        </SkeletonPlaceholder>
    );
};

export const ProCardSkeleton = () => {
    return (
        <View style={cardStyles.container}>
            <SkeletonPlaceholder
                borderRadius={4}
                highlightColor="#F0F0F0"
                backgroundColor="#E1E9EE"
                speed={1200}
            >
                <SkeletonPlaceholder.Item flexDirection="column" >
                    {/* Image */}
                    <SkeletonPlaceholder.Item width="100%" height={200} borderRadius={16} marginBottom={12} />

                    {/* Content */}
                    <SkeletonPlaceholder.Item padding={8}>
                        {/* Title */}
                        <SkeletonPlaceholder.Item width="60%" height={24} borderRadius={8} marginBottom={8} />

                        {/* Subtitle */}
                        <SkeletonPlaceholder.Item width="40%" height={16} borderRadius={6} marginBottom={12} />

                        {/* Tags */}
                        <SkeletonPlaceholder.Item flexDirection="row" gap={8}>
                            <SkeletonPlaceholder.Item width={80} height={32} borderRadius={16} />
                            <SkeletonPlaceholder.Item width={80} height={32} borderRadius={16} />
                        </SkeletonPlaceholder.Item>
                    </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder>
        </View>
    );
};

export const ConversationSkeleton = () => {
    return (
        <SkeletonPlaceholder
            borderRadius={4}
            highlightColor="#F0F0F0"
            backgroundColor="#E1E9EE"
            speed={1200}
        >
            <SkeletonPlaceholder.Item flexDirection="row" alignItems="center" paddingVertical={12}>
                {/* Avatar */}
                <SkeletonPlaceholder.Item width={50} height={50} borderRadius={25} marginRight={12} />

                {/* Content */}
                <SkeletonPlaceholder.Item flex={1}>
                    <SkeletonPlaceholder.Item width="60%" height={18} borderRadius={6} marginBottom={6} />
                    <SkeletonPlaceholder.Item width="80%" height={14} borderRadius={6} />
                </SkeletonPlaceholder.Item>

                {/* Time */}
                <SkeletonPlaceholder.Item width={40} height={14} borderRadius={6} />
            </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
    );
};

export const ProfileSkeleton = () => {
    return (
        <SkeletonPlaceholder
            borderRadius={4}
            highlightColor="#F0F0F0"
            backgroundColor="#E1E9EE"
            speed={1200}
        >
            <SkeletonPlaceholder.Item>
                {/* Header Image */}
                <SkeletonPlaceholder.Item width="100%" height={300} />

                {/* Profile Info */}
                <SkeletonPlaceholder.Item padding={16}>
                    <SkeletonPlaceholder.Item width="70%" height={28} borderRadius={8} marginBottom={12} />
                    <SkeletonPlaceholder.Item width="50%" height={20} borderRadius={6} marginBottom={20} />

                    {/* Stats */}
                    <SkeletonPlaceholder.Item flexDirection="row" gap={16} marginBottom={20}>
                        <SkeletonPlaceholder.Item width={80} height={60} borderRadius={12} />
                        <SkeletonPlaceholder.Item width={80} height={60} borderRadius={12} />
                        <SkeletonPlaceholder.Item width={80} height={60} borderRadius={12} />
                    </SkeletonPlaceholder.Item>

                    {/* Description */}
                    <SkeletonPlaceholder.Item width="100%" height={16} borderRadius={6} marginBottom={8} />
                    <SkeletonPlaceholder.Item width="90%" height={16} borderRadius={6} marginBottom={8} />
                    <SkeletonPlaceholder.Item width="80%" height={16} borderRadius={6} />
                </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
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
