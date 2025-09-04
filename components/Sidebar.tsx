"use client"

import { usePathname, useRouter } from "expo-router"
import { BarChart2, History, Home, MoreHorizontal, Plus, Settings, Trophy, User } from "lucide-react-native"
import { useState } from "react"
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface SidebarProps {
  currentPage?: string
}

const Sidebar = ({ currentPage = "lobby" }: SidebarProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const [moreVisible, setMoreVisible] = useState(false)

  const menuItems = [
    {
      id: "lobby",
      label: "Home",
      icon: Home,
      route: "/lobby",
    },
    {
      id: "history",
      label: "History",
      icon: History,
      route: "/history",
    },
    {
      id: "newgame",
      label: "New Game",
      icon: Plus,
      route: "/lobby", // reste pour l’instant
    },
    {
      id: "more",
      label: "More",
      icon: MoreHorizontal,
      route: "",
    },
  ]

  const moreMenuItems = [
    { id: "profile", label: "Profile", icon: User, route: "/profile" },
    { id: "stats", label: "Stats", icon: BarChart2, route: "/stats" },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy, route: "/leaderboard" },
    { id: "settings", label: "Settings", icon: Settings, route: "/settings" },
  ]

  const handleNavigation = (item: (typeof menuItems)[0]) => {
    if (item.id === "newgame") {
      // logique new game
      return
    }
    if (item.id === "more") {
      setMoreVisible(true)
      return
    }
    router.push(item.route as any)
  }

  const isActive = (itemId: string) => {
    if (itemId === "lobby" && (pathname === "/lobby" || pathname === "/" || currentPage === "lobby")) {
      return true
    }
    if (itemId === "history" && (pathname === "/history" || currentPage === "history")) {
      return true
    }
    return false
  }

  return (
    <>
      {/* Barre de navigation */}
      <View style={styles.sidebar}>
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.id)

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, active && styles.activeMenuItem]}
              onPress={() => handleNavigation(item)}
            >
              <Icon size={24} color={active ? "#FFFFFF" : "#9CA3AF"} />
              <Text style={[styles.menuLabel, active && styles.activeMenuLabel]}>{item.label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Menu More (Bottom Sheet Style) */}
      <Modal
        visible={moreVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMoreVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>More</Text>
            {moreMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setMoreVisible(false)
                    router.push(item.route as any)
                  }}
                >
                  <Icon size={20} color="#8B5CF6" style={{ marginRight: 12 }} />
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              )
            })}

            <TouchableOpacity style={styles.closeButton} onPress={() => setMoreVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  menuItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 70,
  },
  activeMenuItem: {
    backgroundColor: "#8B5CF6",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  menuLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    marginTop: 4,
  },
  activeMenuLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1E1B4B",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#312E81",
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#8B5CF6",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default Sidebar
