import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

/**
 * Main Home Dashboard for MyPodcast App
 * Clean layout focused on main "New Podcast" action.
 */
export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.overline}>GOOD MORNING</Text>
            <Text style={styles.title}>Listen to Your{'\n'}Podcasts</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Image 
              source="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" 
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Primary CTA Section (Top) */}
        <View style={styles.actionSection}>
            <TouchableOpacity 
                style={styles.topAction} 
                activeOpacity={0.8}
                onPress={() => router.push('/start-podcast')}
            >
                <LinearGradient
                    colors={Colors.light.signatureGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientCard}
                >
                    <View style={styles.actionInfo}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="add" size={32} color={Colors.light.primary} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.actionTitle}>New Podcast</Text>
                            <Text style={styles.actionSubtitle}>Start generating your AI voice summary.</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="rgba(255, 255, 255, 0.8)" />
                </LinearGradient>
            </TouchableOpacity>
        </View>

        {/* Welcome Card / Instruction */}
        <View style={styles.welcomeCard}>
            <Ionicons name="sparkles-outline" size={24} color={Colors.light.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeText}>
              Tap the button above to start a new podcast, or visit your Library to listen to previous summaries.
            </Text>
        </View>

      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.tabBar}>
          <TabItem icon="home" label="HOME" active />
          <TabItem icon="mic" label="LIBRARY" route="/library" />
          <TabItem icon="person" label="PROFILE" route="/profile" />
      </View>
    </SafeAreaView>
  );
}

function TabItem({ icon, label, active, route }: any) {
    return (
        <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => route && router.replace(route as any)}
        >
            <Ionicons 
                name={icon + (active ? "" : "-outline") as any} 
                size={22} 
                color={active ? Colors.light.primary : Colors.light.onSurfaceVariant} 
            />
            <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>{label}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9fe', // Neutral, tonal background
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 40,
    marginTop: 10,
  },
  overline: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: Colors.light.onSurfaceVariant,
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: Colors.light.onSurface,
    lineHeight: 38,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primaryContainer,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  actionSection: {
    marginBottom: 32,
  },
  topAction: {
    borderRadius: 32,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 8,
  },
  gradientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingVertical: 24,
    borderRadius: 32,
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  actionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: 'white',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
  },
  welcomeCard: {
      backgroundColor: 'white',
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: 'rgba(0, 88, 188, 0.05)',
  },
  welcomeTitle: {
      fontFamily: 'Inter_700Bold',
      fontSize: 20,
      color: Colors.light.onSurface,
      marginBottom: 8,
  },
  welcomeText: {
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      color: Colors.light.onSurfaceVariant,
      lineHeight: 20,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(250, 249, 254, 0.95)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 0,
    paddingBottom: 20,
  },
  tabItem: {
    alignItems: 'center',
  },
  tabLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    marginTop: 4,
    color: Colors.light.onSurfaceVariant,
  },
  activeTabLabel: {
    fontFamily: 'Inter_700Bold',
    color: Colors.light.primary,
  },
});
