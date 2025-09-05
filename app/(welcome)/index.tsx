"use client"

import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from "react-native"

const WelcomeScreen = () => {
  const router = useRouter()
  const [displayedText, setDisplayedText] = useState("")
  const fullText = "Chessizen"
  const typingSpeed = 150

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const logoRotateAnim = useRef(new Animated.Value(0)).current
  const floatingAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Initial fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start()

    // Logo rotation animation
    Animated.loop(
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()

    // Floating animation for decorative elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start()

    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typingInterval)
      }
    }, typingSpeed)

    // Redirect after 6 seconds
    const redirectTimer = setTimeout(() => {
      router.replace("/auth")
    }, 6000)

    return () => {
      clearInterval(typingInterval)
      clearTimeout(redirectTimer)
    }
  }, [])

  const logoRotate = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  const floatingTranslateY = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  })

  return (
    <LinearGradient colors={["#0a0a0a", "#1a1a2e", "#16213e"]} style={styles.container}>
      <Animated.View style={[styles.floatingDot, styles.dot1, { transform: [{ translateY: floatingTranslateY }] }]} />
      <Animated.View
        style={[
          styles.floatingDot,
          styles.dot2,
          {
            transform: [
              {
                translateY: floatingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 8],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.floatingDot,
          styles.dot3,
          {
            transform: [
              {
                translateY: floatingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -15],
                }),
              },
            ],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View style={[styles.logoContainer, { transform: [{ rotate: logoRotate }] }]}>
          <View style={styles.logoGradient}>
            <Text style={styles.chessIcon}>♔</Text>
          </View>
        </Animated.View>

        <View style={styles.titleContainer}>
          <LinearGradient
            colors={["#8B5CF6", "#EC4899", "#06B6D4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleGradient}
          >
            <Text style={styles.title}>
              {displayedText}
              <Text style={styles.cursor}>|</Text>
            </Text>
          </LinearGradient>
        </View>

        <Text style={styles.subtitle}>Play. Learn. Conquer.</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => router.replace("/auth")} activeOpacity={0.8}>
            <View style={styles.buttonGradient}>
              <Text style={styles.buttonText}>Get Started</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>v1.0.0</Text>
      </Animated.View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  floatingDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#8B5CF6",
    opacity: 0.6,
  },
  dot1: {
    top: "20%",
    right: "15%",
  },
  dot2: {
    top: "35%",
    left: "10%",
    backgroundColor: "#EC4899",
  },
  dot3: {
    bottom: "25%",
    right: "20%",
    backgroundColor: "#06B6D4",
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 15,
  },
  chessIcon: {
    fontSize: 60,
    color: "white",
    textShadowColor: "#8B5CF6",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  titleContainer: {
    marginBottom: 20,
  },
  titleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  cursor: {
    opacity: 0.7,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 60,
    letterSpacing: 1,
  },
  buttonContainer: {
    marginBottom: 40,
  },
  button: {
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  buttonGradient: {
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "#8B5CF6",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  version: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.4)",
    textAlign: "center",
  },
})

export default WelcomeScreen
