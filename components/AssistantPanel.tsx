import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing
} from 'react-native';
import { ChevronDown, ChevronUp, Lightbulb, Zap } from 'lucide-react-native';
import { useGame } from '@/contexts/GameContext';

const AssistantPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { assistantHint, hintCooldown, requestHint, loading } = useGame();
  const [animation] = useState(new Animated.Value(0));

  const togglePanel = () => {
    setIsOpen(!isOpen);
    Animated.timing(animation, {
      toValue: isOpen ? 0 : 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false
    }).start();
  };

  const getEvaluationColor = (evaluation: number) => {
    if (evaluation > 0.5) return '#16a34a'; // green-600
    if (evaluation < -0.5) return '#dc2626'; // red-600
    return '#ca8a04'; // yellow-600
  };

  const getEvaluationText = (evaluation: number) => {
    if (evaluation > 0.5) return 'Advantage';
    if (evaluation < -0.5) return 'Disadvantage';
    return 'Equal';
  };

  const heightInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300] // Adjust based on content height
  });

  return (
    <View style={styles.card}>
      {/* Header - Always visible */}
      <TouchableOpacity
        style={styles.header}
        onPress={togglePanel}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <Zap size={20} color="#228B22" />
          <Text style={styles.title}>Chess Assistant</Text>
        </View>
        {isOpen ? (
          <ChevronUp size={20} color="#666" />
        ) : (
          <ChevronDown size={20} color="#666" />
        )}
      </TouchableOpacity>

      {/* Collapsible Content */}
      <Animated.View style={[styles.content, { height: heightInterpolate }]}>
        <ScrollView style={styles.scrollContent}>
          <TouchableOpacity
            style={[
              styles.hintButton,
              (hintCooldown > 0 || loading) && styles.hintButtonDisabled
            ]}
            onPress={requestHint}
            disabled={hintCooldown > 0 || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Lightbulb size={16} color="#fff" />
                <Text style={styles.hintButtonText}>
                  {hintCooldown > 0
                    ? `Request Hint (${hintCooldown}s)`
                    : 'Request Hint'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {assistantHint && (
            <View style={styles.hintContainer}>
              <View style={styles.hintHeader}>
                <View style={styles.suggestedMove}>
                  <Text style={styles.hintLabel}>Suggested Move:</Text>
                  <View style={styles.moveBadge}>
                    <Text style={styles.moveText}>{assistantHint.move}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.evaluationBadge,
                    {
                      borderColor: getEvaluationColor(assistantHint.evaluation)
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.evaluationText,
                      { color: getEvaluationColor(assistantHint.evaluation) }
                    ]}
                  >
                    {getEvaluationText(assistantHint.evaluation)}
                  </Text>
                </View>
              </View>

              <View style={styles.analysisSection}>
                <Text style={styles.hintLabel}>Analysis:</Text>
                <Text style={styles.explanationText}>
                  {assistantHint.explanation}
                </Text>
              </View>

              <View style={styles.evaluationBarContainer}>
                <Text style={styles.evaluationLabel}>Evaluation:</Text>
                <View style={styles.evaluationBar}>
                  <View
                    style={[
                      styles.evaluationFill,
                      {
                        backgroundColor:
                          assistantHint.evaluation > 0 ? '#22c55e' : '#ef4444',
                        width: `${Math.abs(assistantHint.evaluation) * 25 + 50}%`,
                        marginLeft:
                          assistantHint.evaluation < 0
                            ? `${50 - Math.abs(assistantHint.evaluation) * 25}%`
                            : '0%'
                      }
                    ]}
                  />
                </View>
                <Text style={styles.evaluationValue}>
                  {assistantHint.evaluation > 0 ? '+' : ''}
                  {assistantHint.evaluation.toFixed(1)}
                </Text>
              </View>
            </View>
          )}

          {!assistantHint && (
            <View style={styles.emptyState}>
              <Lightbulb size={32} color="#666" />
              <Text style={styles.emptyStateText}>
                Click "Request Hint" to get AI analysis of the current position
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa'
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D5016'
  },
  content: {
    overflow: 'hidden'
  },
  scrollContent: {
    padding: 16
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#228B22',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16
  },
  hintButtonDisabled: {
    backgroundColor: '#9ec19e'
  },
  hintButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16
  },
  hintContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8'
  },
  hintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  suggestedMove: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  hintLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666'
  },
  moveBadge: {
    backgroundColor: '#e8e8e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  moveText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#2D5016'
  },
  evaluationBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  evaluationText: {
    fontSize: 12,
    fontWeight: '600'
  },
  analysisSection: {
    marginBottom: 16
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2D5016',
    marginTop: 4
  },
  evaluationBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8'
  },
  evaluationLabel: {
    fontSize: 12,
    color: '#666'
  },
  evaluationBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e8e8e8',
    borderRadius: 4,
    overflow: 'hidden'
  },
  evaluationFill: {
    height: '100%',
    borderRadius: 4
  },
  evaluationValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    minWidth: 40,
    textAlign: 'right'
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    gap: 8
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  }
});

export default AssistantPanel;
