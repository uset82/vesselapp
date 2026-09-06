import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Color, Type } from '../theme/tokens';
import { GlassSurface } from './GlassSurface';
import { HomeIcon, MenuIcon, MessagesIcon } from './icons/BridgeIcons';

interface BottomNavProps {
  active: 'home' | 'messages' | 'more';
  onHome: () => void;
  onMessages: () => void;
  onMore: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ active, onHome, onMessages, onMore }) => {
  const items = [
    { key: 'home' as const, label: 'Home', onPress: onHome, icon: HomeIcon },
    { key: 'messages' as const, label: 'Log', onPress: onMessages, icon: MessagesIcon },
    { key: 'more' as const, label: 'More', onPress: onMore, icon: MenuIcon },
  ];

  return (
    <GlassSurface tone="strong" radius={20} style={styles.bar}>
      <View style={styles.row}>
        {items.map((item) => {
          const selected = item.key === active;
          const Icon = item.icon;
          const color = selected ? Color.text : Color.textMuted;
          return (
            <Pressable
              key={item.key}
              onPress={item.onPress}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              style={[styles.item, selected && styles.itemActive]}
            >
              <Icon color={color} />
              <Text style={[styles.label, { color }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </GlassSurface>
  );
};

const styles = StyleSheet.create({
  bar: {
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    paddingTop: 4,
    paddingBottom: 2,
  },
  item: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  itemActive: {
    opacity: 1,
  },
  label: {
    fontFamily: Type.bodyMedium,
    fontSize: 11,
  },
});
