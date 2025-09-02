import AssistantPanel from '@/components/AssistantPanel';
import ChessBoard from '@/components/ChessBoard';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bot,
  Crown,
  Flag,
  Handshake,
  History,
  Lightbulb,
  RotateCcw,
  Undo,
  User,
  X
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';

const GameScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { gameState, loadGame, game, resetGame } = useGame();
  const [activeTab, setActiveTab] = useState<'history' | 'assistant' | null>(null);
  const [loading, setLoading] = useState(true);

  const { width, height } = useWindowDimensions();
  const boardSize = Math.min(width * 0.9, height * 0.6, 500);

  // Animations
  const [rotateAnim] = useState(new Animated.Value(0));
  const [boardScale] = useState(new Animated.Value(0));
  const [resignScale] = useState(new Animated.Value(1));
  const [drawScale] = useState(new Animated.Value(1));
  const [resetScale] = useState(new Animated.Value(1));
  const [undoScale] = useState(new Animated.Value(1));
  const [modalSlide] = useState(new Animated.Value(0));
  const [headerOpacity] = useState(new Animated.Value(0));
  const [headerTranslateY] = useState(new Animated.Value(-20));
  const [sidebarOpacity] = useState(new Animated.Value(0));
  const [sidebarTranslateY] = useState(new Animated.Value(50));

  React.useEffect(() => {
    const initializeGame = async () => {
      if (id && !gameState) await loadGame(id as string);
      setLoading(false);
    };
    initializeGame();
  }, [id, gameState, loadGame]);

  React.useEffect(() => {
    const animateCrown = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    };

    if (loading) {
      animateCrown();
    } else {
      rotateAnim.stopAnimation();
      Animated.parallel([
        Animated.spring(boardScale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
        Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(headerTranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(sidebarOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(sidebarTranslateY, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      ]).start();
    }
  }, [loading]);

  React.useEffect(() => {
    if (activeTab !== null) {
      Animated.timing(modalSlide, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    } else {
      modalSlide.setValue(0);
    }
  }, [activeTab]);

  const handleResign = () => {
    Alert.alert('Resign Game', 'Are you sure you want to resign?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Resign', style: 'destructive', onPress: () => { resetGame(); router.replace('/lobby'); } }
    ]);
  };

  const handleOfferDraw = () => Alert.alert('Draw Offer', 'Draw offer sent to opponent');

  const handleResetGame = () => {
    Alert.alert('Reset Game', 'Are you sure you want to reset the game?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => resetGame() },
    ]);
  };

  const handleUndoMove = () => Alert.alert('Undo Move', 'Undo last move');

  const animateButtonPress = (buttonAnim: Animated.Value, callback: () => void) => {
    Animated.sequence([
      Animated.timing(buttonAnim, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(callback);
  };

  const getCurrentTurn = (): string => (game?.turn() === 'w' ? 'White' : 'Black');

  const getGameStatus = (): string => {
    if (!game) return 'Loading...';
    if (game.isCheckmate()) return 'Checkmate';
    if (game.isCheck()) return 'Check';
    if (game.isDraw()) return 'Draw';
    if (game.isStalemate()) return 'Stalemate';
    return 'Active';
  };

  if (loading || !gameState) {
    const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Crown size={48} color="#228B22" />
        </Animated.View>
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/lobby')}>
          <ArrowLeft size={24} color="#2D5016" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.opponentInfo}>
            {gameState.opponent?.includes('AI') || gameState.opponent?.includes('Bot') ? (
              <Bot size={16} color="#2D5016" />
            ) : (
              <User size={16} color="#2D5016" />
            )}
            <Text style={styles.headerTitle} numberOfLines={1}>vs {gameState.opponent}</Text>
          </View>
          <Text style={styles.headerSubtitle}>{getCurrentTurn()}'s turn • {getGameStatus()}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => setActiveTab('history')}>
            <History size={22} color="#2D5016" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={() => setActiveTab('assistant')}>
            <Lightbulb size={22} color="#2D5016" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Chess Board */}
      <View style={styles.mainContent}>
        <Animated.View style={[styles.boardContainer, { width: boardSize, height: boardSize, transform:[{scale: boardScale}], opacity: boardScale }]}>
          <ChessBoard />
        </Animated.View>
      </View>

      {/* Sidebar horizontale en bas */}
      <Animated.View style={[styles.sidebarBottom, { opacity: sidebarOpacity, transform:[{translateY: sidebarTranslateY}] }]}>
        {[
          { icon: Flag, label: 'Resign', anim: resignScale, action: handleResign },
          { icon: RotateCcw, label: 'Reset', anim: resetScale, action: handleResetGame },
          { icon: Handshake, label: 'Draw', anim: drawScale, action: handleOfferDraw },
          { icon: Undo, label: 'Undo', anim: undoScale, action: handleUndoMove },
        ].map(({ icon: Icon, label, anim, action }, index) => (
          <Animated.View key={index} style={{ transform:[{scale: anim}] }}>
            <TouchableOpacity style={styles.sidebarButtonBottom} onPress={() => animateButtonPress(anim, action)}>
              <Icon size={24} color="#2D5016" />
              <Text style={styles.sidebarButtonTextBottom}>{label}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </Animated.View>

      {/* Modal */}
      <Modal visible={activeTab !== null} animationType="none" transparent onRequestClose={() => setActiveTab(null)}>
        <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={() => setActiveTab(null)}>
          <Animated.View style={[styles.modalContent, { maxHeight: height*0.7, transform:[{translateY: modalSlide.interpolate({inputRange:[0,1], outputRange:[300,0]})}]}]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{activeTab==='history'?'Move History':'AI Assistant'}</Text>
              <TouchableOpacity onPress={()=>setActiveTab(null)} style={styles.closeButton}>
                <X size={24} color="#2D5016" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              {activeTab==='history' && (
                <ScrollView style={styles.historyList}>
                  {gameState.moves.length===0 ? (
                    <Text style={styles.noMovesText}>No moves yet</Text>
                  ) : (
                    gameState.moves.map((move,index)=>(
                      <View key={index} style={styles.moveItem}>
                        <Text style={styles.moveNumber}>{Math.floor(index/2)+1}.</Text>
                        <Text style={styles.moveNotation}>{move.san}</Text>
                      </View>
                    ))
                  )}
                </ScrollView>
              )}
              {activeTab==='assistant' && <AssistantPanel />}
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#f8f9fa' },
  loadingContainer: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#f8f9fa' },
  loadingText: { marginTop:16, fontSize:16, color:'#666' },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop: Platform.OS==='ios'?50:30, paddingBottom:12, backgroundColor:'white', borderBottomWidth:1, borderBottomColor:'#e8e8e8', minHeight:60 },
  backButton: { padding:8 },
  headerCenter: { flex:1, alignItems:'center', marginHorizontal:12 },
  opponentInfo: { flexDirection:'row', alignItems:'center', gap:6 },
  headerTitle: { fontSize:16, fontWeight:'600', color:'#2D5016' },
  headerSubtitle: { fontSize:12, color:'#666', marginTop:2 },
  headerActions: { flexDirection:'row', gap:12 },
  headerIcon: { padding:8 },
  mainContent: { flex:1, justifyContent:'center', alignItems:'center', padding:16 },
  boardContainer: { justifyContent:'center', alignItems:'center', marginBottom:20, backgroundColor:'white', borderRadius:12, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.2, shadowRadius:8, elevation:8 },

  // Sidebar en bas
  sidebarBottom: { position:'absolute', bottom:0, left:0, right:0, flexDirection:'row', justifyContent:'space-around', alignItems:'center', paddingVertical:10, backgroundColor:'#f0f0f0', borderTopWidth:1, borderTopColor:'#ccc' },
  sidebarButtonBottom: { justifyContent:'center', alignItems:'center' },
  sidebarButtonTextBottom: { fontSize:12, marginTop:2, color:'#2D5016' },

  modalContainer: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end' },
  modalContent: { backgroundColor:'white', borderTopLeftRadius:20, borderTopRightRadius:20 },
  modalHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:20, borderBottomWidth:1, borderBottomColor:'#e8e8e8' },
  modalTitle: { fontSize:18, fontWeight:'600', color:'#2D5016' },
  closeButton: { padding:4 },
  modalBody: { padding:20 },
  historyList: { maxHeight:300 },
  moveItem: { flexDirection:'row', alignItems:'center', paddingVertical:8, borderBottomWidth:1, borderBottomColor:'#f0f0f0' },
  moveNumber: { width:30, color:'#666', fontSize:14 },
  moveNotation: { fontFamily:'monospace', fontSize:16, fontWeight:'500', color:'#2D5016' },
  noMovesText: { textAlign:'center', color:'#666', padding:20 },
});

export default GameScreen;
