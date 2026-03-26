import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Dimensions, Animated, Easing, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

/**
 * Generating Audio Screen
 * Replicating the VoiceAI generation UI with scroll and extra controls.
 */
export default function GeneratingAudioScreen() {
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Waveform Pulsing Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.light.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>VoiceAI</Text>
        <TouchableOpacity style={styles.profileButtonMini}>
          <Image 
            source="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" 
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
            {/* Status Badge */}
            <View style={styles.badge}>
                <Text style={styles.badgeText}>GENERATING AUDIO</Text>
            </View>

            {/* Waveform Visualization */}
            <View style={styles.vizWrapper}>
                <View style={styles.outerCircle}>
                    <View style={styles.innerCircle}>
                        <Animated.View style={[styles.waveformContainer, { transform: [{ scale: pulseAnim }] }]}>
                            <View style={[styles.wave, { height: 40, opacity: 0.4 }]} />
                            <View style={[styles.wave, { height: 60, opacity: 0.6 }]} />
                            <View style={[styles.wave, { height: 80, opacity: 1, backgroundColor: Colors.light.primary }]} />
                            <View style={[styles.wave, { height: 100, opacity: 1, backgroundColor: Colors.light.primary }]} />
                            <View style={[styles.wave, { height: 80, opacity: 1, backgroundColor: Colors.light.primary }]} />
                            <View style={[styles.wave, { height: 60, opacity: 0.6 }]} />
                            <View style={[styles.wave, { height: 40, opacity: 0.4 }]} />
                        </Animated.View>
                        <Ionicons name="mic" size={20} color={Colors.light.primary} style={styles.micIcon} />
                        <Text style={styles.vizLabel}>VOICE SYNTHESIS</Text>
                    </View>
                </View>
            </View>

            {/* Top Pause Control (As requested: New button after circle) */}
            <TouchableOpacity style={styles.topPauseControl}>
                <LinearGradient
                    colors={Colors.light.signatureGradient}
                    style={styles.topPauseGradient}
                >
                    <Ionicons name="pause" size={24} color="white" />
                </LinearGradient>
                <Text style={styles.topPauseLabel}>TAP TO PAUSE SENSE</Text>
            </TouchableOpacity>

            {/* Summary Preview Section */}
            <View style={styles.previewSection}>
                <Text style={styles.sectionTitle}>Summary Preview</Text>
                <View style={styles.previewCard}>
                    <Text style={styles.previewContent}>
                        The latest research into neural voice synthesis suggests that emotional cadence can now be mapped with over 98% accuracy. 
                        This generation session is applying a <Text style={styles.highlight}>Professional Narrative</Text> tone with subtle emphasis on key technical breakthroughs. 
                        The resulting audio will maintain a consistent atmospheric depth suitable for high-end editorial presentations. {'\n'}{'\n'}
                        Our advanced summary engine is extracting the key pillars of your content to ensure a high-authority delivery. Feel free to pause and download the clip below.
                    </Text>
                    
                    <View style={styles.processingBar}>
                        <View style={styles.tokenCircle} />
                        <Text style={styles.processingText}>Processing 2.4k tokens...</Text>
                    </View>
                </View>
            </View>

            {/* Control Actions (At bottom of scroll content) */}
            <View style={styles.controls}>
                <ControlItem icon="square" label="STOP" />
                <TouchableOpacity style={styles.pauseButton}>
                    <LinearGradient
                        colors={Colors.light.signatureGradient}
                        style={styles.pauseGradient}
                    >
                        <Ionicons name="pause" size={32} color="white" />
                    </LinearGradient>
                    <Text style={styles.pauseLabel}>PAUSE</Text>
                </TouchableOpacity>
                <ControlItem icon="download-outline" label="DOWNLOAD" />
            </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.tabBar}>
          <TabItem icon="home" label="HOME" />
          <TabItem icon="mic" label="LIBRARY" active />
          <TabItem icon="person" label="PROFILE" />
      </View>
    </SafeAreaView>
  );
}

function ControlItem({ icon, label }: any) {
    return (
        <View style={styles.controlItemWrapper}>
            <TouchableOpacity style={styles.controlItem}>
                <Ionicons name={icon} size={24} color="#d12e2e" />
            </TouchableOpacity>
            <Text style={styles.controlLabel}>{label}</Text>
        </View>
    )
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
    backgroundColor: '#faf9fe', 
  },
  scrollContent: {
    paddingBottom: 120, // Space for tab bar
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.light.onSurface,
  },
  profileButtonMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    backgroundColor: 'rgba(0, 88, 188, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  badgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#0058bc',
    letterSpacing: 1.2,
  },
  vizWrapper: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  outerCircle: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.4,
    borderWidth: 1,
    borderColor: 'rgba(0, 88, 188, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: '85%',
    height: '85%',
    borderRadius: width * 0.35,
    borderWidth: 2,
    borderColor: 'rgba(0, 88, 188, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    // Soft Shadow
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 4,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10,
  },
  wave: {
    width: 4,
    backgroundColor: 'rgba(0, 88, 188, 0.3)',
    borderRadius: 2,
  },
  micIcon: {
    marginBottom: 8,
  },
  vizLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: Colors.light.onSurfaceVariant,
    letterSpacing: 1,
  },
  topPauseControl: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'white',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 16,
      marginBottom: 32,
      shadowColor: Colors.light.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
  },
  topPauseGradient: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
  },
  topPauseLabel: {
      fontFamily: 'Inter_700Bold',
      fontSize: 12,
      color: Colors.light.onSurface,
      letterSpacing: 0.5,
  },
  previewSection: {
    width: '100%',
    marginBottom: 40,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.light.onSurface,
    marginBottom: 16,
  },
  previewCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  previewContent: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.light.onSurfaceVariant,
    lineHeight: 24,
    marginBottom: 24,
  },
  highlight: {
    color: Colors.light.primary,
    fontFamily: 'Inter_700Bold',
  },
  processingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tokenCircle: {
      width: 40,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(0, 88, 188, 0.2)',
  },
  processingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.light.onSurfaceVariant,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  controlItemWrapper: {
    alignItems: 'center',
  },
  controlItem: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(238, 237, 243, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  controlLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: Colors.light.onSurfaceVariant,
  },
  pauseButton: {
    alignItems: 'center',
  },
  pauseGradient: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  pauseLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: Colors.light.primary,
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
  activeTabLabel: {
    color: Colors.light.primary,
  },
  tabLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    marginTop: 4,
    color: Colors.light.onSurfaceVariant,
  },
});
