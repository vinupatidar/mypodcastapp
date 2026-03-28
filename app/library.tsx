import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Computer's Local IP for Physical Devices
const API_BASE_URL = 'http://192.168.1.2:5005';

/**
 * Library Screen for MyPodcast App
 * Now fetches real saved episodes from the backend DB.
 */
export default function LibraryScreen() {
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     fetchEpisodes();
  }, []);

  const fetchEpisodes = async () => {
    try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/episodes`);
        const result = await response.json();
        if (result.success) {
            // Sort by latest first
            setEpisodes(result.data.reverse());
        }
    } catch (err) {
        console.error('Fetch Library Error:', err);
    } finally {
        setLoading(false);
    }
  };

  const handleOpenEpisode = (episode: any) => {
    // Navigate to the player with the already generated summary and audioUrl
    router.push({
        pathname: '/generating-audio',
        params: {
            summary: episode.summary,
            audioUrl: episode.audioUrl,
            category: episode.category,
            title: episode.title
        }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerWelcomeLabel}>YOUR COLLECTION</Text>
          <Text style={styles.userNameTitle}>Library</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Image 
            source="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" 
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Episodes</Text>
        <TouchableOpacity onPress={fetchEpisodes}>
             <Ionicons name="refresh" size={18} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
            <View style={{ marginTop: 100 }}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <Text style={styles.loadingText}>Loading your collection...</Text>
            </View>
        ) : (
            episodes.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="mic-off" size={64} color={Colors.light.surfaceContainerHigh} />
                    <Text style={styles.emptyTitle}>No Podcasts Yet</Text>
                    <Text style={styles.emptyDescription}>Generate your first AI podcast from the Home screen!</Text>
                </View>
            ) : (
                episodes.map((episode) => (
                    <TouchableOpacity 
                        key={episode.id} 
                        style={styles.episodeCard}
                        onPress={() => handleOpenEpisode(episode)}
                    >
                        <View style={styles.episodeInfo}>
                            <View style={styles.categoryLabel}>
                                <Text style={styles.categoryText}>{episode.category.toUpperCase()}</Text>
                            </View>
                            <Text style={styles.episodeTitle}>{episode.title}</Text>
                            <Text style={styles.episodeSummary} numberOfLines={2}>
                                {episode.summary}
                            </Text>
                            <View style={styles.timestampContainer}>
                                <Ionicons name="time-outline" size={14} color={Colors.light.onSurfaceVariant} />
                                <Text style={styles.timestampText}>{new Date(episode.timestamp).toLocaleDateString()}</Text>
                            </View>
                        </View>
                        <View style={styles.playButtonMini}>
                            <Ionicons name="play" size={20} color="white" />
                        </View>
                    </TouchableOpacity>
                ))
            )
        )}
      </ScrollView>

      {/* Persistent Bottom Tab Bar */}
      <View style={styles.tabBar}>
          <TabItem icon="home" label="HOME" route="/" />
          <TabItem icon="mic" label="LIBRARY" active />
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
    backgroundColor: '#faf9fe',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    marginBottom: 40,
  },
  headerWelcomeLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: Colors.light.onSurfaceVariant,
    letterSpacing: 2,
    marginBottom: 8,
  },
  userNameTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: Colors.light.onSurface,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.light.onSurface,
  },
  categoryLabel: {
    backgroundColor: 'rgba(0, 88, 188, 0.08)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  categoryText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: Colors.light.primary,
    letterSpacing: 0.8,
  },
  episodeCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  episodeInfo: {
    flex: 1,
  },
  episodeTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.light.onSurface,
    marginBottom: 8,
  },
  episodeSummary: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.light.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: 12,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestampText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.light.onSurfaceVariant,
  },
  playButtonMini: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  loadingText: {
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      color: Colors.light.onSurfaceVariant,
      textAlign: 'center',
      marginTop: 16,
  },
  emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 80,
  },
  emptyTitle: {
      fontFamily: 'Inter_700Bold',
      fontSize: 18,
      color: Colors.light.onSurface,
      marginTop: 20,
  },
  emptyDescription: {
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      color: Colors.light.onSurfaceVariant,
      textAlign: 'center',
      marginTop: 8,
      paddingHorizontal: 40,
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
