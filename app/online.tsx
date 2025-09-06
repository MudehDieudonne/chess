"use client"

import { useAuth } from "@/contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Constants
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import Spacing from "@/constants/Spacing";

const Online = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [rotateAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isSearching) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      );

      pulseAnimation.start();
      rotateAnimation.start();

      return () => {
        pulseAnimation.stop();
        rotateAnimation.stop();
      };
    }
  }, [isSearching, pulseAnim, rotateAnim]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      interval = setInterval(() => {
        setSearchTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSearching]);

  const startSearch = () => {
    setIsSearching(true);
    setSearchTime(0);

    const searchDuration = Math.random() * 5000 + 3000;
    setTimeout(() => {
      setIsSearching(false);
      Alert.alert("Adversaire trouvé!", "Un joueur avec un niveau similaire a été trouvé.", [
        {
          text: "Jouer",
          onPress: () => {
            const gameId = "game_" + Date.now();
            router.push(`/game/${gameId}`);
          },
        },
      ]);
    }, searchDuration);
  };

  const cancelSearch = () => {
    setIsSearching(false);
    setSearchTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const chessPieces = [
    { piece: "♔", angle: 0 },
    { piece: "♕", angle: 45 },
    { piece: "♖", angle: 90 },
    { piece: "♗", angle: 135 },
    { piece: "♘", angle: 180 },
    { piece: "♙", angle: 225 },
    { piece: "♚", angle: 270 },
    { piece: "♛", angle: 315 },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.primaryText}/>
        </TouchableOpacity>
        <Text style={styles.title}>Chessizen</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Chess Pieces Circle */}
        <View style={styles.chessCircle}>
          <Animated.View
            style={[
              styles.rotatingContainer,
              { transform: [{ rotate: spin }] },
            ]}
          >
            {chessPieces.map((item, index) => {
              const radian = (item.angle * Math.PI) / 180;
              const radius = 120;
              const x = Math.cos(radian) * radius;
              const y = Math.sin(radian) * radius;

              return (
                <View
                  key={index}
                  style={[
                    styles.chessPiece,
                    { left: x + 120, top: y + 120 },
                  ]}
                >
                  <Text style={styles.chessPieceText}>{item.piece}</Text>
                </View>
              );
            })}
          </Animated.View>

          {/* Central Circle */}
          <Animated.View
            style={[
              styles.centralCircle,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <LinearGradient
              colors={Colors.primaryButton}
              style={styles.gradient}
            >
              <Text style={styles.centralIcon}>♟</Text>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Status Text */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>
            {isSearching ? "Searching for Opponent" : "Ready to Play"}
          </Text>
          <Text style={styles.statusSubtitle}>
            {isSearching ? "Finding a player with similar rating" : "Find an opponent for a quick match"}
          </Text>
          {isSearching && <Text style={styles.timer}>{formatTime(searchTime)}</Text>}
        </View>

        {/* Progress Bar */}
        {isSearching && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View style={styles.progressFill} />
            </View>
          </View>
        )}

        {/* Action Button */}
        {!isSearching ? (
          <TouchableOpacity onPress={startSearch}>
            <LinearGradient
              colors={Colors.primaryButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>Find Match</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.cancelButton} onPress={cancelSearch}>
            <Text style={styles.cancelButtonText}>Cancel Search</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? Spacing.headerTopIOS : Spacing.headerTopAndroid,
    paddingHorizontal: Spacing.large,
    paddingBottom: Spacing.large,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: Fonts.title,
    fontWeight: Fonts.bold,
    color: Colors.titleText,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.large,
  },
  chessCircle: {
    width: 300,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xlarge,
  },
  rotatingContainer: {
    width: 300,
    height: 300,
    position: "absolute",
  },
  chessPiece: {
    position: "absolute",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  chessPieceText: {
    fontSize: Fonts.icon,
    color: Colors.secondaryText,
    opacity: 0.6,
  },
  centralCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    shadowColor: Colors.primaryShadow,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  gradient: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
  },
  centralIcon: {
    fontSize: Fonts.iconLarge,
    color: Colors.primaryText,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: Spacing.xlarge,
  },
  statusTitle: {
    fontSize: Fonts.title,
    fontWeight: Fonts.bold,
    color: Colors.primaryText,
    marginBottom: Spacing.small,
  },
  statusSubtitle: {
    fontSize: Fonts.content,
    color: Colors.accentText,
    textAlign: "center",
    marginBottom: Spacing.medium,
  },
  timer: {
    fontSize: Fonts.subtitle,
    fontWeight: Fonts.bold,
    color: Colors.accentText,
  },
  progressContainer: {
    width: "80%",
    marginBottom: Spacing.xlarge,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.cardBackground,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primaryButton[0],
    width: "30%",
  },
  actionButton: {
    borderRadius: Spacing.buttonRadius,
    paddingVertical: 16,
    paddingHorizontal: 60,
    shadowColor: Colors.primaryShadow,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: Spacing.medium,
  },
  actionButtonText: {
    color: Colors.primaryText,
    fontSize: Fonts.content,
    fontWeight: Fonts.bold,
  },
  cancelButton: {
    backgroundColor: Colors.offlineButton,
    borderRadius: Spacing.buttonRadius,
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderWidth: 2,
    borderColor: Colors.primaryButton[0],
    marginBottom: Spacing.xlarge,
  },
  cancelButtonText: {
    color: Colors.primaryText,
    fontSize: Fonts.content,
    fontWeight: Fonts.bold,
  },
});

export default Online;
