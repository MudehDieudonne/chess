import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Crown, Medal, Star, Trophy } from 'lucide-react-native';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Player {
  id: number;
  name: string;
  rating: number;
  games: number;
  winRate: number;
  avatar: string;
  rank: number;
}

const mockPlayers: Player[] = [
  { id: 1, name: "ChessLegend", rating: 2156, games: 234, winRate: 89, avatar: "CL", rank: 1 },
  { id: 2, name: "GrandMaster99", rating: 2089, games: 189, winRate: 85, avatar: "GM", rank: 2 },
  { id: 3, name: "QueenSlayer", rating: 1987, games: 167, winRate: 82, avatar: "QS", rank: 3 },
  { id: 4, name: "KnightRider", rating: 1923, games: 145, winRate: 78, avatar: "KR", rank: 4 },
  { id: 5, name: "BishopBlitz", rating: 1876, games: 132, winRate: 75, avatar: "BB", rank: 5 },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown size={24} color="#FBBF24" />;
    case 2:
      return <Trophy size={24} color="#D1D5DB" />;
    case 3:
      return <Medal size={24} color="#B45309" />;
    default:
      return <Text style={styles.rankText}>#{rank}</Text>;
  }
};

const getCardColors = (rank: number) => {
  switch (rank) {
    case 1:
      return ['rgba(76, 29, 149, 0.4)', 'rgba(91, 33, 182, 0.4)'];
    case 2:
      return ['rgba(76, 29, 149, 0.4)', 'rgba(126, 34, 206, 0.4)'];
    case 3:
      return ['rgba(55, 48, 163, 0.4)', 'rgba(91, 33, 182, 0.4)'];
    default:
      return ['rgba(30, 41, 59, 0.4)', 'rgba(76, 29, 149, 0.2)'];
  }
};

const Leaderboard = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Top 3 Players in a single container */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.topThreeContainer}>
          <Text style={styles.sectionTitle}>Top Players</Text>
          <LinearGradient
            colors={['rgba(76, 29, 149, 0.3)', 'rgba(91, 33, 182, 0.3)']}
            style={styles.topThreeBox}
          >
            {mockPlayers.slice(0, 3).map((player) => (
              <View key={player.id} style={styles.topPlayerRow}>
                <View style={styles.playerLeft}>
                  <View style={styles.rankIcon}>
                    {getRankIcon(player.rank)}
                  </View>
                  <LinearGradient
                    colors={getCardColors(player.rank)}
                    style={styles.avatarContainer}
                  >
                    <Text style={styles.avatarText}>{player.avatar}</Text>
                  </LinearGradient>
                  <View>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.playerStats}>
                      {player.games} games • {player.winRate}%
                    </Text>
                  </View>
                </View>
                <View style={styles.ratingContainer}>
                  <Star size={16} color="#FBBF24" />
                  <Text style={styles.playerRating}>{player.rating}</Text>
                </View>
              </View>
            ))}
          </LinearGradient>
        </View>

        {/* Leaderboard List */}
        <View style={styles.leaderboardList}>
          <Text style={styles.sectionTitle}>All Players</Text>
          {mockPlayers.map((player) => (
            <LinearGradient
              key={player.id}
              colors={getCardColors(player.rank)}
              style={styles.playerCard}
            >
              <View style={styles.playerInfo}>
                <View style={styles.rankContainer}>
                  {getRankIcon(player.rank)}
                </View>
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.listAvatar}
                >
                  <Text style={styles.listAvatarText}>{player.avatar}</Text>
                </LinearGradient>
                <View>
                  <Text style={styles.listPlayerName}>{player.name}</Text>
                  <Text style={styles.listPlayerStats}>
                    {player.games} games • {player.winRate}%
                  </Text>
                </View>
              </View>
              <View style={styles.ratingContainer}>
                <Star size={16} color="#FBBF24" />
                <Text style={styles.listPlayerRating}>{player.rating}</Text>
              </View>
            </LinearGradient>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 12,
    marginLeft: 4,
  },
  topThreeContainer: {
    padding: 16,
  },
  topThreeBox: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  topPlayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  playerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  playerName: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: 16,
  },
  playerStats: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  playerRating: {
    color: '#F8FAFC',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankText: {
    color: '#9CA3AF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  leaderboardList: {
    padding: 16,
  },
  playerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  listAvatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listPlayerName: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: 16,
  },
  listPlayerStats: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  listPlayerRating: {
    color: '#F8FAFC',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 4,
  },
});

export default Leaderboard;