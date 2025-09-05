"use client"

import Sidebar from "@/components/Sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { useGame } from "@/contexts/GameContext"
import * as Clipboard from "expo-clipboard"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

// Constants
import Colors from "@/constants/Colors"
import Fonts from "@/constants/Fonts"
import Spacing from "@/constants/Spacing"

const Lobby = () => {
  const router = useRouter()
  const { user } = useAuth()
  const { createGame, loading } = useGame()

  const handlePlayVsAI = async () => {
    try {
      const gameId = await createGame(true)
      router.push(`/game/${gameId}`)
    } catch (error) {
      console.error("Failed to create AI game:", error)
      Alert.alert("Error", "Failed to create AI game. Please try again.")
    }
  }

  const handleCreateInvite = async () => {
    const inviteToken = "invite_" + Date.now()
    const inviteUrl = `https://yourapp.com/invite/${inviteToken}`
    try {
      await Clipboard.setStringAsync(inviteUrl)
      Alert.alert("Invite Created", "Invite link copied to clipboard!")
      router.push(`/invite/${inviteToken}`)
    } catch (error) {
      Alert.alert("Error", "Failed to copy invite link.")
    }
  }

  const handlePlayOffline = () => {
    router.push("/offline")
  }

  return (
    <View style={styles.background}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>Chessizen</Text>
        <Text style={styles.appSubtitle}>Master the Game</Text>
        <View style={styles.userCard}>
          <Text style={styles.userName}>{user?.displayName || "ChessMaster"}</Text>
          <Text style={styles.userStats}>🏆 1654 🔥 7 streak</Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Play Online */}
          <TouchableOpacity onPress={() => router.push("/online")}>
            <LinearGradient
              colors={Colors.primaryButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>⚡ Play Online</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Play vs AI */}
          <TouchableOpacity style={styles.aiButton} onPress={handlePlayVsAI} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.primaryText} /> : <Text style={styles.aiButtonText}>🤖 Play vs AI</Text>}
          </TouchableOpacity>

          {/* Play vs Friend */}
          <TouchableOpacity style={styles.friendButton} onPress={handleCreateInvite}>
            <Text style={styles.friendButtonText}>👥 Play vs Friend</Text>
          </TouchableOpacity>

          {/* Play Offline */}
          <TouchableOpacity style={styles.offlineButton} onPress={handlePlayOffline}>
            <Text style={styles.offlineButtonText}>🎮 Play Offline</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sidebar */}
      <Sidebar currentPage="lobby" />
    </View>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.medium,
    gap: Spacing.contentGap,
  },
  header: {
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? Spacing.headerTopIOS : Spacing.headerTopAndroid,
    paddingBottom: Spacing.large,
  },
  appTitle: {
    fontSize: Fonts.title,
    fontWeight: Fonts.bold,
    color: Colors.titleText,
  },
  appSubtitle: {
    fontSize: Fonts.subtitle,
    color: Colors.secondaryText,
    marginTop: 4,
  },
  userCard: {
    marginTop: Spacing.large,
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.cardRadius,
    padding: Spacing.large,
    width: "90%",
    alignItems: "center",
    shadowColor: Colors.primaryShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  userName: {
    fontSize: Fonts.content,
    fontWeight: Fonts.semiBold,
    color: Colors.primaryText,
  },
  userStats: {
    fontSize: Fonts.stats,
    color: Colors.accentText,
    marginTop: 4,
  },
  primaryButton: {
    borderRadius: Spacing.buttonRadius,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: Colors.primaryShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: Spacing.medium,
  },
  primaryButtonText: {
    color: Colors.primaryText,
    fontSize: Fonts.content,
    fontWeight: Fonts.bold,
  },
  aiButton: {
    backgroundColor: Colors.aiButton,
    borderRadius: Spacing.buttonRadius,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: Colors.aiShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: Spacing.medium,
  },
  aiButtonText: {
    color: Colors.primaryText,
    fontSize: Fonts.content,
    fontWeight: Fonts.bold,
  },
  friendButton: {
    backgroundColor: Colors.friendButton,
    borderRadius: Spacing.buttonRadius,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.friendButtonBorder,
    shadowColor: Colors.friendShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: Spacing.medium,
  },
  friendButtonText: {
    color: Colors.primaryText,
    fontSize: Fonts.content,
    fontWeight: Fonts.bold,
  },
  offlineButton: {
    backgroundColor: Colors.offlineButton,
    borderRadius: Spacing.buttonRadius,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.offlineButtonBorder,
    shadowColor: Colors.offlineShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: Spacing.medium,
  },
  offlineButtonText: {
    color: Colors.primaryText,
    fontSize: Fonts.content,
    fontWeight: Fonts.bold,
  },
})

export default Lobby
