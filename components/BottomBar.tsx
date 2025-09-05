// components/BottomBar.tsx
import { Flag, Handshake, RefreshCw, Undo2 } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BottomBarProps {
  onResign: () => void;
  onOfferDraw: () => void;
  onReset: () => void;
  onUndo: () => void;
}

const TooltipIcon = ({ label, onPress, children }: { label: string; onPress: () => void; children: React.ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(5)).current;

  const showTooltip = () => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true })
    ]).start();
  };

  const hideTooltip = () => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 5, duration: 150, useNativeDriver: true })
    ]).start(() => setVisible(false));
  };

  return (
    <View style={{ alignItems: 'center' }}>
      {visible && (
        <Animated.View style={[styles.tooltip, { opacity, transform: [{ translateY }] }]}>
          <Text style={styles.tooltipText}>{label}</Text>
        </Animated.View>
      )}
      <TouchableOpacity onPress={onPress} onPressIn={showTooltip} onPressOut={hideTooltip}>
        {children}
      </TouchableOpacity>
    </View>
  );
};

const BottomBar: React.FC<BottomBarProps> = ({ onResign, onOfferDraw, onReset, onUndo }) => {
  return (
    <View style={styles.bottomBar}>
      <TooltipIcon label="Resign" onPress={onResign}>
        <Flag size={28} color="#dc2626" />
      </TooltipIcon>

      <TooltipIcon label="Draw" onPress={onOfferDraw}>
        <Handshake size={28} color="#FFFFFF" />
      </TooltipIcon>

      <TooltipIcon label="Reset" onPress={onReset}>
        <RefreshCw size={28} color="#FFFFFF" />
      </TooltipIcon>

      <TooltipIcon label="Undo" onPress={onUndo}>
        <Undo2 size={28} color="#FFFFFF" />
      </TooltipIcon>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#16213e',
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  tooltip: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default BottomBar;
