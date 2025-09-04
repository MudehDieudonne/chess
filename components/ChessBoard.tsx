"use client"

import { useGame } from "@/contexts/GameContext"
import { LinearGradient } from "expo-linear-gradient"
import type React from "react"
import { useEffect, useRef } from "react"
import { Animated, Easing, StyleSheet, Text, View } from "react-native"
import Chessboard from "react-native-chessboard"

interface ChessBoardProps {
  className?: string
}

const ChessBoard: React.FC<ChessBoardProps> = ({ className = "" }) => {
  const { game, makeMove } = useGame()
  const fen = game?.fen() || "start"

  const boardAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(boardAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start()
  }, [])

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: boardAnim,
          transform: [
            {
              scale: boardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.85, 1],
              }),
            },
          ],
        }}
      >
        <LinearGradient colors={["#FAF7F0", "#F5DEB3"]} style={styles.gradient}>
          <Chessboard
            key={fen}
            fen={fen}
            boardSize={350}
            gestureEnabled={true}
            withLetters={true}
            withNumbers={true}
            durations={{ move: 180 }}
            colors={{
              white: "#FAF7F0", // crème chaleureuse (notre couleur des cartes)
              black: "#8B4513", // marron bois foncé (parfait!)
              lastMoveHighlight: "#654321", // orange cuivré (notre couleur d'accent)
              checkmateHighlight: "#654321", // vert sauge (notre autre accent)
            }}
            onMove={(from: string, to: string) => {
              makeMove(from, to)
            }}
          />
        </LinearGradient>
      </Animated.View>

      {game?.isGameOver() && (
        <View style={styles.gameOverlay}>
          <View style={styles.gameOverlayContent}>
            <Text style={styles.gameOverlayText}>
              {game.isCheckmate()
                ? "Checkmate!"
                : game.isDraw()
                  ? "Draw!"
                  : game.isStalemate()
                    ? "Stalemate!"
                    : "Game Over"}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  gradient: {
    borderRadius: 16,
    overflow: "hidden",
  },
  board: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    overflow: "hidden",
  },
  gameOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  gameOverlayContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  gameOverlayText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2F1B14", // Updated to our refined dark brown text color
  },
})

export default ChessBoard
