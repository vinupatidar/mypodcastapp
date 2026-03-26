import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

import { router } from 'expo-router';

/**
 * Main Home Screen for MyPodcast App
 * Updated layout based on user feedback.
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

        {/* New Podcast Button (Linked to start-podcast) */}
        <TouchableOpacity style={styles.topAction} onPress={() => router.push('/start-podcast')}>
            <LinearGradient
                colors={Colors.light.signatureGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.generateButton}
            >
                <Ionicons name="sparkles" size={20} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.generateButtonText}>New Podcast</Text>
            </LinearGradient>
         </TouchableOpacity>

        {/* Recent Section (Just showing episodes now) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Episodes</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* List Items (Tonal Layering, No Borders) */}
          <PodcastItem 
            title="The Future of AI" 
            date="OCT 24, 2026" 
            duration="2.4 MB" 
            icon="document-text-outline"
          />
          <PodcastItem 
            title="Design Principles 101" 
            date="OCT 22, 2026" 
            duration="840 KB" 
            icon="color-palette-outline"
          />
          <PodcastItem 
            title="Morning News Digest" 
            date="OCT 20, 2026" 
            duration="12 KB" 
            icon="newspaper-outline"
          />
          <PodcastItem 
            title="Space Exploration Update" 
            date="OCT 18, 2026" 
            duration="4.1 MB" 
            icon="rocket-outline"
          />
          <PodcastItem 
            title="Weekly Tech Review" 
            date="OCT 15, 2026" 
            duration="1.8 MB" 
            icon="phone-portrait-outline"
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation Mockup */}
      <View style={styles.tabBar}>
          <TabItem icon="home" label="HOME" active />
          <TabItem icon="mic" label="LIBRARY" />
          <TabItem icon="person" label="PROFILE" />
      </View>
    </SafeAreaView>
  );
}

function PodcastItem({ title, date, duration, icon }: any) {
  return (
    <TouchableOpacity style={styles.podcastItem}>
      <View style={styles.itemImageContainer}>
        <Ionicons name={icon} size={20} color={Colors.light.primary} />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSubtitle}>{date} • {duration}</Text>
      </View>
      <TouchableOpacity>
        <Ionicons name="ellipsis-vertical" size={20} color={Colors.light.onSurfaceVariant} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function TabItem({ icon, label, active }: any) {
    return (
        <TouchableOpacity style={styles.tabItem}>
            <Ionicons 
                name={icon + (active ? "" : "-outline")} 
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
    backgroundColor: Colors.light.surface,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100, // Reduced space since button moved up
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 32,
  },
  overline: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: Colors.light.primary,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: Colors.light.onSurface,
    lineHeight: 38,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: Colors.light.surfaceContainer,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  topAction: {
    marginBottom: 40,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%', // Fixed to take full width of container
    justifyContent: 'center',
    // Ambient Shadow
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 8,
  },
  generateButtonText: {
    color: 'white',
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.light.onSurface,
  },
  viewAll: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: Colors.light.primary,
  },
  podcastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
  },
  itemImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 88, 188, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.light.onSurface,
    marginBottom: 4,
  },
  itemSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.light.onSurfaceVariant,
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
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    marginTop: 4,
    color: Colors.light.onSurfaceVariant,
  },
  activeTabLabel: {
    color: Colors.light.primary,
  }
});
