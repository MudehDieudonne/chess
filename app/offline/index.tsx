import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ChessBoard from "../../components/ChessBoard";

export default function OfflineGame() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#0B1020", "#131A2E"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Play Off4line</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.boardWrapper}>
        <ChessBoard />
      </View>

      <Text style={styles.tip}>Pass-and-play on the same device.</Text>

      
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  backButton: {
    width: 45,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: "#fff", fontSize: 20, fontWeight: "700" },
  boardWrapper: { flex: 1, paddingHorizontal: 16, paddingBottom: 24 },
  tip: {
    textAlign: "center",
    color: "rgba(255,255,255,0.7)",
    paddingBottom: 16,
    fontSize: 14,
  },
});
