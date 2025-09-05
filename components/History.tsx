"use client"

import Sidebar from "@/components/Sidebar"
import { useAuth } from "@/contexts/AuthContext"
import axios from "axios"
import { Users } from "lucide-react-native"
import { useEffect, useState } from "react"
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface GameHistoryItem {
  id: string
  opponent: string
  opponentRating: number
  outcome: "WIN" | "LOSS" | "DRAW"
  endedAt: string
}

const History = () => {
  const {user, getAccessToken} = useAuth()
  const [refreshing, setRefreshing] = useState(false)

const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([])

  const fetchHistory = async () => {
    try {
      const userId = user?.id
      const token = await getAccessToken()

      const res = await axios.get(`${API_URL}/games/${userId}/history`, {
        headers: {Authorization: `Bearer ${token}`}
      })

      setGameHistory(res.data);

    } catch(error: any) {
      console.error(error.response?.data || error.message)
      Alert.alert("Error", "Could not load game history")
    }
  }

useEffect(() => {
  const loadHistory = async () => {
    try {
       fetchHistory();
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  loadHistory();
}, []);

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchHistory()
    setRefreshing(false)
    Alert.alert("Refreshed", "Game history updated")
  }

  const getResultBadge = (outcome: string) => {
    const badgeStyle = outcome === "DRAW" ? styles.drawBadge : outcome === "WIN" ? styles.winBadge : styles.lossBadge
    const badgeText = outcome === "DRAW" ? "Draw" : outcome === "WIN" ? "Win" : "Loss"

    return (
      <View style={[styles.badge, badgeStyle]}>
        <Text style={styles.badgeText}>{badgeText}</Text>
      </View>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays < 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  const getWinRate = () => {
    const wins = gameHistory.filter((game) => game.outcome === "WIN").length
    const total = gameHistory.length
    return total > 0 ? Math.round((wins/gameHistory.length) * 100) : 0
  }

  return (
    <View style={styles.background}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Game History</Text>
        <TouchableOpacity onPress={handleRefresh} disabled={refreshing} style={styles.refreshButton}>
        </TouchableOpacity>
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{gameHistory.length}</Text>
          <Text style={styles.statLabel}>Total Games</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{getWinRate()}%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{gameHistory.filter((g) => g.outcome === "WIN").length}</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </View>
      </View>

      {/* Games List */}
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {gameHistory.map((game, index) => {
            return (
              <TouchableOpacity
                key={index + 1}
                style={styles.gameCard}
              >
                <View style={styles.gameHeader}>
                  <View style={styles.opponentInfo}>
                      <Users size={20} color="#A855F7" />
                    <Text style={styles.opponentName}>{game.opponent} ({game.opponentRating})</Text>
                  </View>
                  {getResultBadge(game.outcome)}
                </View>

                <View style={styles.gameDetails}>
                    <Text style={styles.gameDate}>{formatDate(game.endedAt)}</Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      <Sidebar currentPage="history" />
    </View>
  )
}

const styles = StyleSheet.create({
  background: {
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
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#A855F7",
  },
  refreshButton: {
    padding: 8,
  },
  statsCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#1E1B4B",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#A855F7",
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 12,
    paddingBottom: 100,
  },
  gameCard: {
    backgroundColor: "#1E1B4B",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#312E81",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  gameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  opponentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  opponentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  gameDetails: {
    gap: 8,
  },
  opening: {
    fontSize: 14,
    color: "#C084FC",
    fontWeight: "500",
  },
  gameStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  gameStatText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  timeControl: {
    fontSize: 12,
    color: "#9CA3AF",
    backgroundColor: "#312E81",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gameDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "white",
  },
  winBadge: {
    backgroundColor: "#059669",
  },
  lossBadge: {
    backgroundColor: "#DC2626",
  },
  drawBadge: {
    backgroundColor: "#7C3AED",
  },
})

export default History
