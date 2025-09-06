import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import Spacing from "@/constants/Spacing";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ⚠️ Remplace cet email par un hook (ex: useAuth) si dispo
const mockUser = {
  email: "player@example.com",
};

export default function SettingsPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/lobby")}>
          <ChevronLeft size={24} color={Colors.primaryText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚙️ Settings</Text>
      </View>

      {/* User Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Connected as</Text>
        <Text style={styles.cardContent}>{mockUser.email}</Text>
      </View>

      {/* Options */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionText}>🔔 Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionText}>🎨 Theme</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionText}>🔒 Security</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Navigation */}
      <TouchableOpacity
        onPress={() => router.push("/settings/profile")}
        style={styles.profileButton}
      >
        <Text style={styles.profileButtonText}>Go to Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.large,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.large,
  },
  headerTitle: {
    flex: 1,
    fontSize: Fonts.title,
    fontWeight: Fonts.bold,
    color: Colors.titleText,
    textAlign: "center",
    marginRight: 24, // pour compenser la flèche
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.cardRadius,
    padding: Spacing.medium,
    marginBottom: Spacing.large,
  },
  cardTitle: {
    fontSize: Fonts.subtitle,
    fontWeight: Fonts.medium,
    color: Colors.secondaryText,
    marginBottom: Spacing.small,
  },
  cardContent: {
    fontSize: Fonts.content,
    fontWeight: Fonts.regular,
    color: Colors.primaryText,
  },
  optionButton: {
    paddingVertical: Spacing.small,
  },
  optionText: {
    fontSize: Fonts.content,
    fontWeight: Fonts.medium,
    color: Colors.primaryText,
  },
  profileButton: {
    marginTop: "auto",
    padding: Spacing.medium,
    borderRadius: Spacing.buttonRadius,
    backgroundColor: Colors.primaryButton[0],
    alignItems: "center",
  },
  profileButtonText: {
    fontSize: Fonts.content,
    fontWeight: Fonts.semiBold,
    color: Colors.primaryText,
  },
});
