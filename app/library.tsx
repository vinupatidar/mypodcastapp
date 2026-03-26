import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

const RECENT_EPISODES = [
  { id: '1', title: 'The Future of AI Voice Synthesis', date: 'Mar 24, 2026', duration: '12:45', category: 'Tech' },
  { id: '2', title: 'Why Reading Novels Still Matters', date: 'Mar 22, 2026', duration: '08:32', category: 'Story Telling' },
  { id: '3', title: 'Morning News Roundup', date: 'Mar 21, 2026', duration: '05:15', category: 'News' },
  { id: '4', title: 'Deep Work: My Summary', date: 'Mar 18, 2026', duration: '15:20', category: 'Educational' },
  { id: '5', title: 'Exploring New Frontiers', date: 'Mar 15, 2026', duration: '22:10', category: 'Travel' },
  { id: '6', title: 'Science Weekly: Physics', date: 'Mar 12, 2026', duration: '18:12', category: 'Science' },
];

export default function LibraryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Library</Text>
          <Text style={styles.subtitle}>All your generated summaries in one place.</Text>
        </View>

        {/* Podcast List */}
        <View style={styles.listContainer}>
          {RECENT_EPISODES.map((item) => (
            <TouchableOpacity key={item.id} style={styles.episodeCard}>
              <View style={styles.episodeIcon}>
                <Ionicons name="play" size={20} color={Colors.light.primary} />
              </View>
              <View style={styles.episodeInfo}>
                <Text style={styles.episodeCategory}>{item.category.toUpperCase()}</Text>
                <Text style={styles.episodeTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.episodeMeta}>{item.date} • {item.duration}</Text>
              </View>
              <Ionicons name="ellipsis-vertical" size={20} color={Colors.light.onSurfaceVariant} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
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
    marginBottom: 32,
    marginTop: 10,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: Colors.light.onSurface,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.light.onSurfaceVariant,
  },
  listContainer: {
    gap: 12,
  },
  episodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  episodeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 88, 188, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  episodeInfo: {
    flex: 1,
  },
  episodeCategory: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: Colors.light.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  episodeTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.light.onSurface,
    marginBottom: 2,
  },
  episodeMeta: {
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
  },
});
