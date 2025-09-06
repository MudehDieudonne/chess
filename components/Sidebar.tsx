"use client"

import { usePathname, useRouter } from "expo-router"
import { History, Home, Plus, Settings, Trophy } from "lucide-react-native"
import { StyleSheet, TouchableOpacity, View } from "react-native"

interface SidebarProps {
  currentPage?: string
}

const Sidebar = ({ currentPage = "lobby" }: SidebarProps) => {
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    { id: "lobby", icon: Home, route: "/lobby" },
    { id: "history", icon: History, route: "/history" },
    { id: "newgame", icon: Plus, route: "/lobby" },
    { id: "leaderboard", icon: Trophy, route: "/leaderboard" },
    { id: "settings", icon: Settings, route: "/settings" },
  ]

  const handleNavigation = (item: (typeof menuItems)[0]) => {
    console.log("Navigate to:", item.route);
    if (item.id === "newgame") {
      // logique spéciale pour créer une partie
      return
    }
    router.push(item.route as any)
  }

  const isActive = (itemId: string) => {
    if (itemId === "lobby" && (pathname === "/lobby" || pathname === "/" || currentPage === "lobby")) return true
    if (itemId === "history" && (pathname === "/history" || currentPage === "history")) return true
    if (itemId === "leaderboard" && (pathname === "/leaderboard" || currentPage === "leaderboard")) return true
    if (itemId === "settings" && (pathname === "/settings" || currentPage === "settings")) return true
    return false
  }

  return (
    <View style={styles.sidebar}>
      {menuItems.map((item) => {
        const Icon = item.icon
        const active = isActive(item.id)

        if (item.id === "newgame") {
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.newGameButtonWrapper}
              onPress={() => handleNavigation(item)}
              activeOpacity={0.8}
            >
              <View style={styles.newGameButtonOuter}>
                <View style={[styles.newGameButton, active && styles.newGameButtonActive]}>
                  <Icon size={28} color="#FFFFFF" />
                </View>
              </View>
              {/* <Text style={styles.newGameLabel}>{item.label}</Text> */}
            </TouchableOpacity>
          )
        }

        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, active && styles.activeMenuItem]}
            onPress={() => handleNavigation(item)}
          >
            <Icon size={20} color={active ? "#FFFFFF" : "#9CA3AF"} />
            {/* <Text style={[styles.menuLabel, active && styles.activeMenuLabel]}>{item.label}</Text> */}
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: "#1E1B4B",
    borderTopWidth: 1,
    borderTopColor: "#312E81",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 52,
    paddingHorizontal: 6,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 6,
  },
  menuItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    minWidth: 56,
  },
  activeMenuItem: {
    backgroundColor: "#8B5CF6",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },
  menuLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9CA3AF",
    marginTop: 2,
  },
  activeMenuLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  newGameButtonWrapper: {
    alignItems: "center",
    marginBottom: -20,
  },
  newGameButtonOuter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#1E1B4B",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 6,
    marginBottom: 60,
  },
  newGameButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },
  newGameButtonActive: {
    backgroundColor: "#8B5CF6",
  },
  newGameLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 2,
  },
})

export default Sidebar
