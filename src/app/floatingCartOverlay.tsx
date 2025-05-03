// components/FloatingCartOverlay.tsx
'use client'

import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useCartStore } from './cart-store';

const FloatingCartOverlay = () => {
  //── Hooks (always run, in this order) ──────────────────────────────────────
  const router = useRouter();
  const pathname = usePathname();
  const { items, getTotalPrice } = useCartStore();

  // Animated value and panResponder also hooks (useRef)
  const pan = React.useRef(new Animated.ValueXY({ x: 20, y: 100 })).current;
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gs) =>
        Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
      onPanResponderGrant: () => {
        const { x, y } = (pan as any).__getValue?.() ?? { x: 0, y: 0 };
        pan.setOffset({ x, y });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  //── Derived values ─────────────────────────────────────────────────────────
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = getTotalPrice();

  //── Early returns (after hooks) ────────────────────────────────────────────
  if (pathname === '/cart') return null;    // hide on cart screen
  if (totalCount === 0) return null;         // hide when cart empty

  //── Render draggable/floating cart button ─────────────────────────────────
  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[styles.container, pan.getLayout()]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/cart')}
      >
        <Text style={styles.text}>
          🛒 {totalCount} | R{parseFloat(totalPrice).toFixed(2)}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default FloatingCartOverlay;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 9999,
    elevation: 10,
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
