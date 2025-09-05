import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Types
interface ChessPieceProps {
  piece: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
  isSelected: boolean;
  onPress: () => void;
}

// Tes images disponibles
const pieceImages: Record<string, any> = {
  king: require('../assets/chess/king.png'),
  queen: require('../assets/chess/queen.png'),
  rook: require('../assets/chess/rook.png'),
};

const ChessPiece: React.FC<ChessPieceProps> = ({ piece, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.pieceButton, isSelected && styles.selectedPiece]}
      onPress={onPress}
    >
      <Image
        source={pieceImages[piece]}
        style={[
          styles.pieceImage,
          piece === 'king' ? { tintColor: '#FFFFFF' } : {},
        ]}
        resizeMode="contain"
      />
      <Text style={styles.pieceLabel}>
        {piece.charAt(0).toUpperCase() + piece.slice(1)}
      </Text>
    </TouchableOpacity>
  );
};

const CreateProfileScreen = () => {
  const [selectedPiece, setSelectedPiece] = useState<'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'>('king');
  const [username, setUsername] = useState('');
  const navigation = useNavigation();

  const pieces: ChessPieceProps['piece'][] = ['king', 'queen', 'rook'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F23" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chessizen</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* User Card */}
        <View style={styles.userCard}>
          <Text style={styles.userName}>{username || 'ChessMaster'}</Text>
          <Text style={styles.userStats}>🏆 1654 🔥 7 streak</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Create Your Profile</Text>
          <Text style={styles.subtitle}>Choose your chess identity</Text>

          {/* Avatar Selection */}
          <Text style={styles.sectionTitle}>Choose Your Avatar</Text>
          <View style={styles.piecesGrid}>
            {pieces.map((piece, index) => (
              <ChessPiece
                key={index}
                piece={piece}
                isSelected={selectedPiece === piece}
                onPress={() => setSelectedPiece(piece)}
              />
            ))}
          </View>

          {/* Username Input */}
          <Text style={styles.sectionTitle}>Username</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#C084FC" />
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          {/* Create Button */}
          <TouchableOpacity style={styles.createButton}>
            <Text style={styles.createButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F23' },
  scrollContainer: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#A855F7' },
  placeholder: { width: 32 },
  userCard: {
    marginTop: 20,
    backgroundColor: "#1E1B4B",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 24,
    alignItems: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 30,
  },
  userName: { fontSize: 18, fontWeight: "600", color: "#FFFFFF" },
  userStats: { fontSize: 14, color: "#C084FC", marginTop: 4 },
  content: { paddingHorizontal: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#9CA3AF', textAlign: 'center', marginBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 16, textAlign: 'center' },
  piecesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 },
  pieceButton: { width: 80, height: 80, backgroundColor: '#1E1B4B', borderRadius: 16, margin: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6 },
  selectedPiece: { borderColor: '#A855F7', backgroundColor: '#3a2a4a' },
  pieceImage: { width: 40, height: 40, marginBottom: 4 },
  pieceLabel: { fontSize: 12, color: '#C084FC', fontWeight: '500' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1B4B', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 40, borderWidth: 1, borderColor: '#8B5CF6' },
  input: { flex: 1, fontSize: 16, color: '#FFFFFF', marginLeft: 12 },
  createButton: { backgroundColor: '#9C27B0', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 20 },
  createButtonText: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
});

export default CreateProfileScreen;
