import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants';

interface LoadingProps {
    size?: 'small' | 'large';
    color?: string;
    style?: ViewStyle;
}

export const Loading = React.memo(({
    size = 'large',
    color = Colors.accent,
    style
}: LoadingProps) => {
    return (
        <View style={[styles.container, style]}>
            <ActivityIndicator size={size} color={color} />
        </View>
    );
});

Loading.displayName = 'Loading';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.backgroundSecondary,
    },
});
