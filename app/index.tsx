import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';

const WelcomeScreen = () => {
  const router = useRouter();
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'Welcome ChessCitizen';
  const typingSpeed = 250;

  useEffect(() => {
    // Typing animation
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, typingSpeed);

    // Redirect after 10 seconds
    const redirectTimer = setTimeout(() => {
      router.replace('/auth');
    }, 5000);

    return () => {
      clearInterval(typingInterval);
      clearTimeout(redirectTimer);
    };
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://plus.unsplash.com/premium_photo-1675762226695-bec5748d4d00?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2hlc3MlMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww'
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.content}>
          <Text style={styles.title}>
            {displayedText}
            <Text style={styles.cursor}>|</Text>
          </Text>
          <Text style={styles.subtitle}>
            Master the game with AI assistance
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  backgroundImage: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20
  },
  cursor: {
    opacity: 0.7
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center'
  }
});

export default WelcomeScreen;
