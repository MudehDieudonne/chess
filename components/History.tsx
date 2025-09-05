"use client"

import Sidebar from "@/components/Sidebar"
import { useRouter } from "expo-router"
import { Bot, Clock, Users } from "lucide-react-native"
import { useState } from "react"
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface GameHistoryItem {
  id: string
  opponent: string
  result: "1-0" | "0-1" | "1/2-1/2"
  date: string
  moves: number
  timeControl: string
  opening: string
}

const History = () => {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)

  const [gameHistory] = useState<GameHistoryItem[]>([
    {
      id: "demo1",
      opponent: "ChessBot Pro",
      result: "1-0",
      date: new Date().toISOString(),
      moves: 34,
      timeControl: "10+0",
      opening: "Sicilian Defense",
    },
    {
      id: "demo2",
      opponent: "Player_Magnus",
      result: "1/2-1/2",
      date: new Date(Date.now() - 86400000).toISOString(),
      moves: 67,
      timeControl: "15+10",
      opening: "Queen's Gambit",
    },
    {
      id: "demo3",
      opponent: "AI Grandmaster",
      result: "0-1",
      date: new Date(Date.now() - 172800000).toISOString(),
      moves: 42,
      timeControl: "5+3",
      opening: "King's Indian Defense",
    },
    {
      id: "demo4",
      opponent: "ChessNinja",
      result: "1-0",
      date: new Date(Date.now() - 259200000).toISOString(),
      moves: 28,
      timeControl: "3+2",
      opening: "Italian Game",
    },
    {
      id: "demo5",
      opponent: "DeepBlue_v2",
      result: "0-1",
      date: new Date(Date.now() - 345600000).toISOString(),
      moves: 56,
      timeControl: "30+0",
      opening: "French Defense",
    },
    {
      id: "demo6",
      opponent: "GrandMaster_Alex",
      result: "1/2-1/2",
      date: new Date(Date.now() - 432000000).toISOString(),
      moves: 73,
      timeControl: "15+10",
      opening: "English Opening",
    },
  ])

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRefreshing(false)
    Alert.alert("Refreshed", "Game history updated")
  }

  const getResultBadge = (result: string, isWin: boolean) => {
    const badgeStyle = result === "1/2-1/2" ? styles.drawBadge : isWin ? styles.winBadge : styles.lossBadge
    const badgeText = result === "1/2-1/2" ? "Draw" : isWin ? "Win" : "Loss"

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
    const wins = gameHistory.filter((game) => game.result === "1-0").length
    const total = gameHistory.length
    return Math.round((wins / total) * 100)
  }

  return (
    <View style={styles.background}>
      {/* Header */}
      <View style={styles.header}>
        {/* <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#A855F7" />
        </TouchableOpacity> */}
        <Text style={styles.title}>Game History</Text>
        <TouchableOpacity onPress={handleRefresh} disabled={refreshing} style={styles.refreshButton}>
          {/* <RefreshCw size={24} color="#A855F7" /> */}
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
          <Text style={styles.statNumber}>{gameHistory.filter((g) => g.result === "1-0").length}</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </View>
      </View>

      {/* Games List */}
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {gameHistory.map((game, index) => {
            const isWin = game.result === "1-0"
            return (
              <TouchableOpacity
                key={game.id}
                style={styles.gameCard}
                onPress={() => router.push(`/history/${game.id}`)}
              >
                <View style={styles.gameHeader}>
                  <View style={styles.opponentInfo}>
                    {game.opponent.includes("Bot") || game.opponent.includes("AI") ? (
                      <Bot size={20} color="#A855F7" />
                    ) : (
                      <Users size={20} color="#A855F7" />
                    )}
                    <Text style={styles.opponentName}>{game.opponent}</Text>
                  </View>
                  {getResultBadge(game.result, isWin)}
                </View>

                <View style={styles.gameDetails}>
                  <Text style={styles.opening}>{game.opening}</Text>
                  <View style={styles.gameStats}>
                    <View style={styles.statRow}>
                      <Clock size={14} color="#9CA3AF" />
                      <Text style={styles.gameStatText}>{game.moves} moves</Text>
                    </View>
                    <Text style={styles.timeControl}>{game.timeControl}</Text>
                    <Text style={styles.gameDate}>{formatDate(game.date)}</Text>
                  </View>
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
