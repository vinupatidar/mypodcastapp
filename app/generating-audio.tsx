import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Dimensions, Animated, Easing, ScrollView, Modal, FlatList, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import Slider from '@react-native-community/slider';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const LANGUAGES = [
  'English (US)', 'English (UK)', 'Hindi', 'Spanish', 'French', 'German', 'Chinese (Mandarin)', 
  'Japanese', 'Korean', 'Arabic', 'Portuguese', 'Russian', 'Italian', 'Turkish', 'Dutch', 
  'Polish', 'Swedish', 'Indonesian', 'Vietnamese', 'Thai', 'Greek', 'Bengali', 'Marathi', 
  'Telugu', 'Tamil', 'Gujarati', 'Urdu', 'Kannada', 'Malayalam', 'Punjabi', 'Persian', 
  'Hebrew', 'Ukrainian', 'Czech', 'Danish', 'Finnish', 'Norwegian', 'Hungarian', 'Romanian'
];

const CATEGORIES = [
  'Story Telling', 'Book Reading', 'Novel Reading', 'Educational', 'News Report', 
  'Interview', 'Comedy', 'True Crime', 'Tech & Science', 'Business', 'Wellness', 
  'Travel', 'Sports', 'History', 'Philosophy', 'Kids & Family', 'Arts', 'Music & Media', 
  'Political', 'Spiritual', 'Documentary', 'Personal Journal', 'Meditative', 'ASMR', 
  'Horror', 'Drama', 'Biography', 'Self-Improvement', 'Health & Fitness', 'Food & Cooking', 
  'Gardening', 'Parenting', 'Relationship Advice', 'Finance', 'Real Estate', 'Law', 
  'Mythology', 'Gaming', 'Movie Reviews', 'Anime', 'AI & Future', 'Entrepreneurship'
];

const VOICES = [
  { id: 'aria', name: 'Aria — Warm & Friendly' },
  { id: 'marcus', name: 'Marcus — Authoritative' },
  { id: 'sofia', name: 'Sofia — Soft & Calm' },
  { id: 'jake', name: 'Jake — High Energy' }
];

export default function GeneratingAudioScreen() {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [showOptions, setShowOptions] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'language' | 'category' | 'voice'>('language');

  // Generation Options State
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [summaryWords, setSummaryWords] = useState(500);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');
  const [selectedCategory, setSelectedCategory] = useState('Story Telling');

  const [generationKey, setGenerationKey] = useState(0);

  useEffect(() => {
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
  }, [generationKey]);

  const openPicker = (type: 'language' | 'category' | 'voice') => {
    setPickerType(type);
    setPickerVisible(true);
  };

  const handleSelect = (item: any) => {
    if (pickerType === 'language') setSelectedLanguage(item);
    else if (pickerType === 'category') setSelectedCategory(item);
    else if (pickerType === 'voice') setSelectedVoice(item);
    setPickerVisible(false);
  };

  const startNewGeneration = () => {
    setShowOptions(false);
    setGenerationKey(prev => prev + 1);
  };

  const currentPickerData = 
    pickerType === 'language' ? LANGUAGES : 
    pickerType === 'category' ? CATEGORIES : 
    VOICES.map(v => v.name);

  return (
    <View style={styles.masterContainer}>
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
          <View style={styles.content} key={generationKey}>
              <View style={styles.badge}>
                  <Text style={styles.badgeText}>GENERATING AUDIO</Text>
              </View>

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

              {/* Quick Actions (Pause and Regenerate) */}
              <View style={styles.quickActions}>
                  <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.7}>
                      <LinearGradient
                          colors={Colors.light.signatureGradient}
                          style={styles.quickActionGradient}
                      >
                          <Ionicons name="pause" size={24} color="white" />
                      </LinearGradient>
                      <Text style={styles.quickActionLabel}>PAUSE</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.quickActionButton} 
                    onPress={() => setShowOptions(true)}
                    activeOpacity={0.7}
                  >
                      <LinearGradient
                          colors={Colors.light.signatureGradient}
                          style={styles.quickActionGradient}
                      >
                          <Ionicons name="refresh" size={24} color="white" />
                      </LinearGradient>
                      <Text style={styles.quickActionLabel}>REGENERATE</Text>
                  </TouchableOpacity>
              </View>

              <View style={styles.previewSection}>
                  <Text style={styles.sectionTitle}>Summary Preview</Text>
                  <View style={styles.previewCard}>
                      <Text style={styles.previewContent}>
                          The latest research into neural voice synthesis suggests that emotional cadence can now be mapped with over 98% accuracy. 
                          This generation session is applying a <Text style={styles.highlight}>{selectedVoice.name.split(' — ')[0]}</Text> tone with subtle emphasis on key technical breakthroughs. 
                          The resulting audio will maintain a consistent atmospheric depth suitable for high-end editorial presentations. {'\n'}{'\n'}
                          Our advanced summary engine is extracting the key pillars of your content to ensure a high-authority delivery. Feel free to pause and download the clip below.
                      </Text>
                      
                      <View style={styles.processingBar}>
                          <View style={styles.tokenCircle} />
                          <Text style={styles.processingText}>Processing {summaryWords} words in {selectedLanguage}...</Text>
                      </View>
                  </View>
              </View>
          </View>
        </ScrollView>

        <View style={styles.tabBar}>
            <TabItem icon="home" label="HOME" route="/" />
            <TabItem icon="mic" label="LIBRARY" active />
            <TabItem icon="person" label="PROFILE" route="/profile" />
        </View>
      </SafeAreaView>

      {/* MODALS */}
      <Modal
        visible={showOptions}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOptions(false)}
      >
        <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.dismissOverlay} activeOpacity={1} onPress={() => setShowOptions(false)} />
            <View style={styles.bottomSheet}>
                <View style={styles.handle} />
                <View style={[styles.sheetContent, { maxHeight: SCREEN_HEIGHT * 0.7 }]}>
                    <Text style={styles.sheetTitle}>Generation Options</Text>
                    <Text style={styles.sheetSubtitle}>Customize how your AI voice summary is crafted.</Text>
                    
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                        <Text style={styles.label}>VOICE OPTION</Text>
                        <TouchableOpacity style={styles.pickerButton} onPress={() => openPicker('voice')}>
                            <Text style={styles.pickerText}>{selectedVoice.name}</Text>
                            <Ionicons name="chevron-expand" size={20} color={Colors.light.primary} />
                        </TouchableOpacity>

                        <View style={styles.sliderHeader}>
                            <Text style={styles.label}>SUMMARY LENGTH</Text>
                            <View style={styles.badgeSmall}>
                                <Text style={styles.badgeTextSmall}>{summaryWords} words</Text>
                            </View>
                        </View>
                        <Slider
                            style={styles.slider}
                            minimumValue={100}
                            maximumValue={800}
                            step={50}
                            value={summaryWords}
                            onValueChange={setSummaryWords}
                            minimumTrackTintColor={Colors.light.primary}
                            maximumTrackTintColor={Colors.light.surfaceContainerHigh}
                            thumbTintColor={Colors.light.primary}
                        />

                        <View style={styles.sliderHeader}>
                            <Text style={styles.label}>VOICE SPEED</Text>
                            <View style={styles.badgeSmall}>
                                <Text style={styles.badgeTextSmall}>{voiceSpeed.toFixed(1)}x</Text>
                            </View>
                        </View>
                        <Slider
                            style={styles.slider}
                            minimumValue={0.5}
                            maximumValue={2.0}
                            step={0.1}
                            value={voiceSpeed}
                            onValueChange={setVoiceSpeed}
                            minimumTrackTintColor={Colors.light.primary}
                            maximumTrackTintColor={Colors.light.surfaceContainerHigh}
                            thumbTintColor={Colors.light.primary}
                        />

                        <Text style={styles.label}>SELECT LANGUAGE</Text>
                        <TouchableOpacity style={styles.pickerButton} onPress={() => openPicker('language')}>
                            <Text style={styles.pickerText}>{selectedLanguage}</Text>
                            <Ionicons name="chevron-expand" size={20} color={Colors.light.primary} />
                        </TouchableOpacity>

                        <Text style={styles.label}>PODCAST CATEGORY</Text>
                        <TouchableOpacity style={styles.pickerButton} onPress={() => openPicker('category')}>
                            <Text style={styles.pickerText}>{selectedCategory}</Text>
                            <Ionicons name="chevron-expand" size={20} color={Colors.light.primary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.startGenerationButton} onPress={startNewGeneration}>
                            <LinearGradient
                                colors={Colors.light.signatureGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.startGenerationGradient}
                            >
                                <Text style={styles.startGenerationText}>Start Generation ⚡</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setShowOptions(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </View>
      </Modal>

      <Modal
         visible={pickerVisible}
         animationType="fade"
         transparent={true}
         onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.subModalOverlay}>
            <View style={styles.subModalContent}>
                <View style={styles.subModalHeader}>
                    <Text style={styles.subModalTitle}>Select {pickerType.charAt(0).toUpperCase() + pickerType.slice(1)}</Text>
                    <TouchableOpacity onPress={() => setPickerVisible(false)}>
                        <Ionicons name="close" size={24} color={Colors.light.onSurface} />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={currentPickerData}
                    keyExtractor={(item, index) => index.toString()}
                    style={{ maxHeight: SCREEN_HEIGHT * 0.5 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.selectionItem} 
                            onPress={() => handleSelect(pickerType === 'voice' ? VOICES.find(v => v.name === item) : item)}
                        >
                            <Text style={[
                                styles.selectionLabel, 
                                (selectedLanguage === item || selectedCategory === item || selectedVoice.name === item) && styles.activeSelectionLabel
                            ]}>{item}</Text>
                            {(selectedLanguage === item || selectedCategory === item || selectedVoice.name === item) && (
                                <Ionicons name="checkmark-circle" size={20} color={Colors.light.primary} />
                            )}
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
      </Modal>
    </View>
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
  masterContainer: {
    flex: 1,
    backgroundColor: '#faf9fe',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  content: {
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
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  outerCircle: {
    width: '100%',
    height: '100%',
    borderRadius: SCREEN_WIDTH * 0.4,
    borderWidth: 1,
    borderColor: 'rgba(0, 88, 188, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: '85%',
    height: '85%',
    borderRadius: SCREEN_WIDTH * 0.35,
    borderWidth: 2,
    borderColor: 'rgba(0, 88, 188, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
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
  quickActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      paddingHorizontal: 20,
      marginBottom: 32,
      zIndex: 10, // Ensure it's interactive
  },
  quickActionButton: {
      alignItems: 'center',
      gap: 8,
      padding: 4, // Increase touch area
  },
  quickActionGradient: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: Colors.light.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
  },
  quickActionLabel: {
      fontFamily: 'Inter_700Bold',
      fontSize: 10,
      color: Colors.light.primary,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 27, 31, 1)', // Darker overlay for focus
    justifyContent: 'flex-end',
  },
  dismissOverlay: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.light.surfaceContainerHigh,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetContent: {
    paddingHorizontal: 24,
  },
  sheetTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: Colors.light.onSurface,
    marginBottom: 8,
  },
  sheetSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.light.onSurfaceVariant,
    marginBottom: 32,
  },
  label: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: Colors.light.onSurfaceVariant,
    letterSpacing: 1.2,
    marginBottom: 12,
    marginTop: 10,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.surfaceContainerLow,
    padding: 18,
    borderRadius: 16,
    marginBottom: 24,
  },
  pickerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.light.onSurface,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeSmall: {
    backgroundColor: 'rgba(0, 88, 188, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeTextSmall: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: Colors.light.primary,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 24,
  },
  startGenerationButton: {
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 8,
    marginVertical: 20,
  },
  startGenerationGradient: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  startGenerationText: {
    color: 'white',
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
  },
  cancelButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: Colors.light.onSurfaceVariant,
  },
  subModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  subModalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
  },
  subModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  subModalTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.light.onSurface,
  },
  selectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.surfaceContainer,
  },
  selectionLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.light.onSurface,
  },
  activeSelectionLabel: {
    fontFamily: 'Inter_700Bold',
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
