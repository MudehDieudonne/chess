"use client"

import ChessBoard from '@/components/ChessBoard';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Crown, Flag, Handshake, RefreshCw, Undo2 } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';
import Spacing from '@/constants/Spacing';

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
    <View style={{ alignItems: 'center', marginHorizontal: Spacing.medium }}>
      {visible && (
        <Animated.View style={[styles.tooltip, { opacity, transform: [{ translateY }] }]}>
          <Text style={styles.tooltipText}>{label}</Text>
        </Animated.View>
      )}
      <TouchableOpacity onPress={onPress} onPressIn={showTooltip} onPressOut={hideTooltip} style={styles.iconWrapper}>
        {children}
      </TouchableOpacity>
    </View>
  );
};

const GameScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { gameState, loadGame, game, resetGame, undoMove } = useGame();

  const { width, height } = useWindowDimensions();
  const boardSize = Math.min(width * 0.95, height * 0.5, 400);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeGame = async () => {
      if (id && !gameState) await loadGame(id as string);
      setLoading(false);
    };
    initializeGame();
  }, [id, gameState, loadGame]);

  const handleResign = () => {
    Alert.alert('Resign Game', 'Are you sure you want to resign?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Resign', style: 'destructive', onPress: () => { resetGame(); router.replace('/lobby'); } }
    ]);
  };

  const handleOfferDraw = () => Alert.alert('Draw Offer', 'Draw offer sent to opponent');

  if (loading || !gameState) {
    return (
      <View style={styles.loadingContainer}>
        <Crown size={48} color={Colors.primaryButton[0]} />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/lobby')}>
          <ChevronLeft size={24} color={Colors.primaryText} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Ranked Match</Text>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>10:00</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={[styles.boardContainer, { width: boardSize, height: boardSize }]}>
          <ChessBoard />
        </View>

        {/* Icons below the board */}
        <View style={styles.iconsContainer}>
          <TooltipIcon label="Resign" onPress={handleResign}>
            <Flag size={28} color="#dc2626" />
          </TooltipIcon>

          <TooltipIcon label="Draw" onPress={handleOfferDraw}>
            <Handshake size={28} color="#FFFFFF" />
          </TooltipIcon>

          <TooltipIcon label="Reset" onPress={resetGame}>
            <RefreshCw size={28} color="#FFFFFF" />
          </TooltipIcon>

          <TooltipIcon label="Undo" onPress={undoMove}>
            <Undo2 size={28} color="#FFFFFF" />
          </TooltipIcon>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  loadingText: { marginTop: Spacing.medium, fontSize: Fonts.content, color: Colors.primaryText },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.large,
    paddingTop: Platform.OS === 'ios' ? Spacing.headerTopIOS : Spacing.headerTopAndroid,
    paddingBottom: Spacing.xmedium,
    backgroundColor: Colors.cardBackground,
  },
  backButton: { padding: Spacing.small },
  headerTitle: { fontSize: Fonts.title, fontWeight: Fonts.bold, color: Colors.titleText, textAlign: 'center' },

  timerContainer: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: Spacing.medium,
    paddingVertical: Spacing.small,
    borderRadius: Spacing.buttonRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: { color: Colors.primaryText, fontSize: Fonts.content, fontWeight: Fonts.bold },

  mainContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.large },
  boardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.cardRadius,
    padding: Spacing.medium,
    shadowColor: Colors.primaryShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xxlarge,
    gap: Spacing.large,
  },

  iconWrapper: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.small,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primaryShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  tooltip: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tooltipText: { color: Colors.primaryText, fontSize: 12, fontWeight: '500' },
});

export default GameScreen;
