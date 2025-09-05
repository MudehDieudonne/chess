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
          <ChevronLeft size={24} color="#FFFFFF"/>
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
              {
                transform: [{ rotate: spin }],
              },
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
                    {
                      left: x + 120,
                      top: y + 120,
                    },
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
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={["#8B5CF6", "#7C3AED", "#6D28D9"]}
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
              colors={["#8B5CF6", "#7C3AED"]}
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

        {/* User Info */}
        <View style={styles.userInfo}>
          {/* <Text style={styles.userRating}>Your Rating: 1654</Text> */}
          {/* <Text style={styles.searchInfo}>Searching for players: 1500-1800</Text> */}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F23",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 24,
    color: "#FFFFFF",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#A855F7",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  chessCircle: {
    width: 300,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 60,
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
    fontSize: 28,
    color: "#9CA3AF",
    opacity: 0.6,
  },
  centralCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    shadowColor: "#8B5CF6",
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
    fontSize: 42,
    color: "#FFFFFF",
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 16,
    color: "#A78BFA",
    textAlign: "center",
    marginBottom: 16,
  },
  timer: {
    fontSize: 20,
    fontWeight: "700",
    color: "#C084FC",
  },
  progressContainer: {
    width: "80%",
    marginBottom: 40,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#1F1F37",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8B5CF6",
    width: "30%",
  },
  actionButton: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 60,
    shadowColor: "#8B5CF6",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 20,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "#312E81",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderWidth: 2,
    borderColor: "#8B5CF6",
    marginBottom: 40,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  userInfo: {
    alignItems: "center",
  },
  userRating: {
    fontSize: 16,
    color: "#A78BFA",
    marginBottom: 4,
    fontWeight: "600",
  },
  searchInfo: {
    fontSize: 14,
    color: "#9CA3AF",
  },
});

export default Online;
