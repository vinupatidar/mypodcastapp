import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Modal, FlatList, ActivityIndicator, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// Computer's Local IP for Physical Devices (updated via earlier task)
const API_BASE_URL = 'http://192.168.1.2:5009';

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

/**
 * Generating Audio Screen
 * Now integrates Sarvam AI TTS playback with expo-av.
 */
export default function GeneratingAudioScreen() {
  const params = useLocalSearchParams();
  const soundRef = useRef<Audio.Sound | null>(null);
  
  // UI States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  
  // Content States
  const [summary, setSummary] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // Option States
  const [selectedVoice, setSelectedVoice] = useState(
    VOICES.find(v => v.id === params.voiceId) || VOICES[0]
  );
  const [summaryWords, setSummaryWords] = useState(Number(params.maxWords) || 500);
  const [voiceSpeed, setVoiceSpeed] = useState(Number(params.speed) || 1.0);
  const [selectedLanguage, setSelectedLanguage] = useState((params.language as string) || 'English (US)');
  const [selectedCategory, setSelectedCategory] = useState((params.category as string) || 'Story Telling');

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'language' | 'category' | 'voice'>('language');

  useEffect(() => {
    if (params.audioUrl && params.summary) {
        // Pre-loaded from Library
        setSummary(params.summary as string);
        setAudioUrl(params.audioUrl as string);
        playAudio(params.audioUrl as string);
        setIsGenerating(false);
    } else {
        // New generation
        generateContent();
    }
    
    return () => {
        if (soundRef.current) {
            soundRef.current.unloadAsync();
        }
    };
  }, []);

  const generateContent = async () => {
    setIsGenerating(true);
    setSummary(''); // Clear stale summary
    setAudioUrl(null);
    setIsPlaying(false);
    
    try {
      const formData = new FormData();
      if (params.fileUri) {
          formData.append('file', {
              uri: params.fileUri,
              name: params.fileName || 'document.pdf',
              type: params.fileType || 'application/pdf'
          } as any);
      }
      if (params.text) formData.append('text', params.text as string);
      formData.append('category', selectedCategory);
      formData.append('language', selectedLanguage);
      formData.append('maxWords', summaryWords.toString());
      formData.append('speed', voiceSpeed.toString());

      console.log('📡 Sending request to backend with speed:', voiceSpeed);
      const response = await fetch(`${API_BASE_URL}/summarize`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      const result = await response.json();
      console.log('📥 Backend Response Summary:', result.data?.summary?.substring(0, 50) + '...');
      if (result.success) {
        setSummary(result.data.summary);
        if (result.data.audioUrl) {
            setAudioUrl(result.data.audioUrl);
            playAudio(result.data.audioUrl);
        }
      } else {
        setSummary('Failed to generate summary. Verify your API Keys in the Backend.');
      }
    } catch (err) {
      setSummary('Network error. Check your connection to the Backend Server.');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Load and Play Audio with expo-av
   */
  const playAudio = async (url: string) => {
    try {
        if (soundRef.current) {
            await soundRef.current.unloadAsync();
        }
        
        const { sound } = await Audio.Sound.createAsync(
            { uri: url },
            { shouldPlay: true, rate: voiceSpeed, shouldCorrectPitch: true }
        );
        
        soundRef.current = sound;
        setIsPlaying(true);
        
        sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
                setIsPlaying(false);
            }
        });
    } catch (error) {
        console.error('Audio Playback Error:', error);
    }
  };

  const togglePlayback = async () => {
      if (!soundRef.current) return;
      if (isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
      } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
      }
  };

  const startNewGeneration = () => {
    setShowOptions(false);
    generateContent();
  };

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

  const currentPickerData = 
    pickerType === 'language' ? LANGUAGES : 
    pickerType === 'category' ? CATEGORIES : 
    VOICES.map(v => v.name);

  return (
    <SafeAreaView style={styles.masterContainer}>
      <View style={styles.container}>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color={Colors.light.primary} />
            <Text style={styles.homeButtonText}>HOME</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Podcasting...</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
              <View style={styles.badge}>
                  <Text style={styles.badgeText}>GENERATING AUDIO SESSION</Text>
              </View>

              {/* Visualization Circle */}
              <View style={styles.vizWrapper}>
                  <View style={styles.outerCircle}>
                      <View style={styles.innerCircle}>
                          <View style={styles.waveformContainer}>
                              {[...Array(isPlaying ? 8 : 1)].map((_, i) => (
                                  <View 
                                    key={i} 
                                    style={[
                                        styles.wave, 
                                        { 
                                            height: isPlaying ? 20 + Math.random() * 30 : 2,
                                            backgroundColor: isPlaying ? Colors.light.primary : 'rgba(0, 88, 188, 0.2)'
                                        }
                                    ]} 
                                  />
                              ))}
                          </View>
                          <Ionicons 
                            name={isPlaying ? "headset" : "mic"} 
                            size={32} 
                            color={isPlaying ? Colors.light.primary : Colors.light.onSurfaceVariant} 
                          />
                          <Text style={styles.vizLabel}>{selectedVoice.name.split(' — ')[0].toUpperCase()}</Text>
                      </View>
                  </View>
              </View>

              {/* Playback Controls */}
              <View style={styles.quickActions}>
                  <TouchableOpacity style={styles.quickActionButton} onPress={togglePlayback} disabled={!audioUrl}>
                      <LinearGradient
                          colors={audioUrl ? Colors.light.signatureGradient : ['#ccc', '#ddd']}
                          style={styles.quickActionGradient}
                      >
                          <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="white" />
                      </LinearGradient>
                      <Text style={styles.quickActionLabel}>{isPlaying ? "PAUSE" : "PLAY"}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.quickActionButton} 
                    onPress={() => setShowOptions(true)}
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

              {/* Results Preview */}
              <View style={styles.previewSection}>
                  <Text style={styles.sectionTitle}>Podcast Summary</Text>
                  <View style={styles.previewCard}>
                      {isGenerating ? (
                        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                           <ActivityIndicator size="large" color={Colors.light.primary} />
                           <Text style={[styles.processingText, { marginTop: 16 }]}>Crafting voice script with Sarvam AI...</Text>
                        </View>
                      ) : (
                        <>
                          <Text style={styles.previewContent}>{summary}</Text>
                          
                          <View style={styles.processingBar}>
                              <Ionicons name="sparkles" size={16} color={Colors.light.primary} />
                              <Text style={styles.processingText}>Generated audio available below</Text>
                          </View>

                          {audioUrl && (
                             <View style={styles.voiceScriptBadge}>
                                <Ionicons name="radio" size={14} color={Colors.light.primary} />
                                <Text style={styles.voiceScriptBadgeText}>Sarvam AI Voice: Tanya ⚡</Text>
                             </View>
                          )}
                        </>
                      )}
                  </View>
              </View>
          </View>
        </ScrollView>

        <View style={styles.tabBar}>
            <TabItem icon="home" label="HOME" active route="/" />
            <TabItem icon="mic" label="LIBRARY" route="/library" />
            <TabItem icon="person" label="PROFILE" route="/profile" />
        </View>
      </View>

      {/* REGENERATION OPTIONS */}
      <Modal visible={showOptions} animationType="slide" transparent onRequestClose={() => setShowOptions(false)}>
        <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.dismissOverlay} activeOpacity={1} onPress={() => setShowOptions(false)} />
            <View style={styles.bottomSheet}>
                <View style={styles.handle} />
                <View style={[styles.sheetContent, { maxHeight: SCREEN_HEIGHT * 0.7 }]}>
                    <Text style={styles.sheetTitle}>Voice Settings</Text>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                        <Text style={styles.label}>VOICE / SPEAKER</Text>
                        <TouchableOpacity style={styles.pickerButton} onPress={() => openPicker('voice')}>
                            <Text style={styles.pickerText}>{selectedVoice.name}</Text>
                            <Ionicons name="chevron-expand" size={20} color={Colors.light.primary} />
                        </TouchableOpacity>

                        <View style={styles.sliderHeader}>
                            <Text style={styles.label}>WORDS LIMIT</Text>
                            <View style={styles.badgeSmall}>
                                <Text style={styles.badgeTextSmall}>{summaryWords}</Text>
                            </View>
                        </View>
                        <Slider style={styles.slider} minimumValue={100} maximumValue={800} step={50} value={summaryWords} onValueChange={setSummaryWords} minimumTrackTintColor={Colors.light.primary} thumbTintColor={Colors.light.primary} />

                        <View style={styles.sliderHeader}>
                            <Text style={styles.label}>PACE / SPEED</Text>
                            <View style={styles.badgeSmall}>
                                <Text style={styles.badgeTextSmall}>{voiceSpeed.toFixed(1)}x</Text>
                            </View>
                        </View>
                        <Slider style={styles.slider} minimumValue={0.5} maximumValue={2.0} step={0.1} value={voiceSpeed} onValueChange={setVoiceSpeed} minimumTrackTintColor={Colors.light.primary} thumbTintColor={Colors.light.primary} />

                        <TouchableOpacity style={styles.startGenerationButton} onPress={startNewGeneration}>
                            <LinearGradient colors={Colors.light.signatureGradient} style={styles.startGenerationGradient}>
                                <Text style={styles.startGenerationText}>Regenerate Audio ⚡</Text>
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

      {/* Sub-Picker */}
      <Modal visible={pickerVisible} animationType="fade" transparent onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.subModalOverlay}>
            <View style={styles.subModalContent}>
                <View style={styles.subModalHeader}>
                    <Text style={styles.subModalTitle}>Speakers</Text>
                    <TouchableOpacity onPress={() => setPickerVisible(false)}><Ionicons name="close" size={24} color={Colors.light.onSurface} /></TouchableOpacity>
                </View>
                <FlatList data={currentPickerData} keyExtractor={(item, index) => index.toString()} renderItem={({ item }) => (
                    <TouchableOpacity style={styles.selectionItem} onPress={() => handleSelect(pickerType === 'voice' ? VOICES.find(v => v.name === item) : item)}>
                        <Text style={[styles.selectionLabel, selectedVoice.name === item && styles.activeSelectionLabel]}>{item}</Text>
                        {selectedVoice.name === item && <Ionicons name="checkmark-circle" size={20} color={Colors.light.primary} />}
                    </TouchableOpacity>
                )} />
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function TabItem({ icon, label, active, route }: any) {
    return (
        <TouchableOpacity style={styles.tabItem} onPress={() => route && router.replace(route as any)}>
            <Ionicons name={icon + (active ? "" : "-outline") as any} size={22} color={active ? Colors.light.primary : Colors.light.onSurfaceVariant} />
            <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>{label}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
  masterContainer: { flex: 1, backgroundColor: '#faf9fe' },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  content: { paddingHorizontal: 24, alignItems: 'center' },
  navHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.03)' },
  backButton: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  homeButtonText: { marginLeft: 6, color: Colors.light.primary, fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 0.5 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.light.onSurface },
  badge: { backgroundColor: 'rgba(0, 88, 188, 0.1)', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, marginTop: 20, marginBottom: 40 },
  badgeText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#0058bc', letterSpacing: 1.2 },
  vizWrapper: { width: SCREEN_WIDTH * 0.8, height: SCREEN_WIDTH * 0.8, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  outerCircle: { width: '100%', height: '100%', borderRadius: SCREEN_WIDTH * 0.4, borderWidth: 1, borderColor: 'rgba(0, 88, 188, 0.1)', justifyContent: 'center', alignItems: 'center' },
  innerCircle: { width: '85%', height: '85%', borderRadius: SCREEN_WIDTH * 0.35, borderWidth: 2, borderColor: 'rgba(0, 88, 188, 0.05)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', shadowColor: Colors.light.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.08, shadowRadius: 32, elevation: 4 },
  waveformContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10 },
  wave: { width: 4, borderRadius: 2 },
  vizLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, color: Colors.light.onSurfaceVariant, letterSpacing: 1, marginTop: 8 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingHorizontal: 20, marginBottom: 32 },
  quickActionButton: { alignItems: 'center', gap: 8 },
  quickActionGradient: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.light.primary, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  quickActionLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, color: Colors.light.primary },
  previewSection: { width: '100%', marginBottom: 40 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.light.onSurface, marginBottom: 16 },
  previewCard: { backgroundColor: 'white', borderRadius: 20, padding: 24, shadowColor: Colors.light.primary, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2 },
  previewContent: { fontFamily: 'Inter_400Regular', fontSize: 16, color: Colors.light.onSurfaceVariant, lineHeight: 24, marginBottom: 24 },
  processingBar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  processingText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.light.onSurfaceVariant },
  voiceScriptBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0, 88, 188, 0.05)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6, alignSelf: 'flex-start', marginTop: 12 },
  voiceScriptBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: Colors.light.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(26, 27, 31, 0.8)', justifyContent: 'flex-end' },
  dismissOverlay: { flex: 1 },
  bottomSheet: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 12 },
  handle: { width: 40, height: 4, backgroundColor: '#eee', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetContent: { paddingHorizontal: 24 },
  sheetTitle: { fontFamily: 'Inter_700Bold', fontSize: 24, color: Colors.light.onSurface, marginBottom: 32 },
  label: { fontFamily: 'Inter_700Bold', fontSize: 12, color: Colors.light.onSurfaceVariant, marginBottom: 12, marginTop: 10 },
  pickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f5f5f5', padding: 18, borderRadius: 16, marginBottom: 24 },
  pickerText: { fontFamily: 'Inter_400Regular', fontSize: 16, color: Colors.light.onSurface },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badgeSmall: { backgroundColor: 'rgba(0, 88, 188, 0.08)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeTextSmall: { fontFamily: 'Inter_700Bold', fontSize: 10, color: Colors.light.primary },
  slider: { width: '100%', height: 40, marginBottom: 24 },
  startGenerationButton: { shadowColor: Colors.light.primary, shadowOpacity: 0.2, shadowRadius: 32, elevation: 8, marginVertical: 20 },
  startGenerationGradient: { paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  startGenerationText: { color: 'white', fontFamily: 'Inter_700Bold', fontSize: 18 },
  cancelButton: { alignItems: 'center', marginBottom: 20 },
  cancelText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#aaa' },
  subModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  subModalContent: { width: '100%', backgroundColor: 'white', borderRadius: 24, padding: 24 },
  subModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  subModalTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.light.onSurface },
  selectionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  selectionLabel: { fontFamily: 'Inter_400Regular', fontSize: 16, color: Colors.light.onSurface },
  activeSelectionLabel: { fontFamily: 'Inter_700Bold', color: Colors.light.primary },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(250, 249, 254, 0.95)', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 20 },
  tabItem: { alignItems: 'center' },
  tabLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 4, color: '#aaa' },
  activeTabLabel: { fontFamily: 'Inter_700Bold', color: Colors.light.primary },
});
