import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Composant pour les pièces d'échecs (avec images)
const ChessPiece = ({
  piece,
  isSelected,
  onPress,
}: {
  piece: string;
  isSelected: boolean;
  onPress: () => void;
}) => {
  const getPieceImage = (piece: string) => {
    const icons: Record<string, string> = {
      king: "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt60.png",
      queen: "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt60.png",
      rook: "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt60.png",
      bishop: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt60.png",
      knight: "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt60.png",
      pawn: "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt60.png",
    };
    return icons[piece] || icons.king;
  };

  return (
    <TouchableOpacity
      style={[styles.pieceButton, isSelected && styles.selectedPiece]}
      onPress={onPress}
    >
      <Image
        source={{ uri: getPieceImage(piece) }}
        style={{ width: 32, height: 32, marginBottom: 4 }}
        resizeMode="contain"
      />
      <Text style={styles.pieceLabel}>
        {piece.charAt(0).toUpperCase() + piece.slice(1)}
      </Text>
    </TouchableOpacity>
  );
};

// Composant pour les couleurs
const ColorOption = ({
  color,
  isSelected,
  onPress,
}: {
  color: string;
  isSelected: boolean;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.colorButton,
        { backgroundColor: color },
        isSelected && styles.selectedColor,
      ]}
      onPress={onPress}
    />
  );
};

// Composant principal
const CreateProfileScreen = ({ navigation }: { navigation: any }) => {
  const [selectedPiece, setSelectedPiece] = useState('knight');
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [username, setUsername] = useState('');

  const pieces = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'];
  const colors = [
    '#FFFFFF',
    '#FF5722',
    '#4CAF50',
    '#2196F3',
    '#9C27B0',
    '#FFC107',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

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

      <View style={styles.content}>
        {/* Title */}
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
          <Ionicons name="person-outline" size={20} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            placeholderTextColor="#666"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        {/* Color Selection */}
        <Text style={styles.sectionTitle}>Preferred Color</Text>
        <View style={styles.colorsRow}>
          {colors.map((color, index) => (
            <ColorOption
              key={index}
              color={color}
              isSelected={selectedColor === color}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>

        {/* Create Button */}
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>Create Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9C27B0',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  piecesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
  },
  pieceButton: {
    width: 80,
    height: 80,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPiece: {
    borderColor: '#9C27B0',
    backgroundColor: '#3a2a4a',
  },
  pieceLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#333',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  colorsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    flexWrap: 'wrap',
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#9C27B0',
  },
  createButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CreateProfileScreen;
