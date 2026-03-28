import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, Dimensions, FlatList, Animated, Alert } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Slider from '@react-native-community/slider';
import * as DocumentPicker from 'expo-document-picker';
import PaywallScreen from './paywall';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const LANGUAGES = [
  'Hindi', 'English (US)', 'English (UK)', 'Spanish', 'French', 'German', 'Chinese (Mandarin)', 
  'Japanese', 'Korean', 'Arabic', 'Portuguese', 'Russian', 'Italian', 'Turkish', 'Dutch', 
  'Polish', 'Swedish', 'Indonesian', 'Vietnamese', 'Thai', 'Bengali', 'Marathi', 
  'Telugu', 'Tamil', 'Gujarati', 'Urdu', 'Kannada', 'Malayalam', 'Punjabi'
];

const CATEGORIES = [
  'Story Telling', 'Book Reading', 'Novel Reading', 'Educational', 'News Report', 
  'Interview', 'Comedy', 'True Crime', 'Tech & Science', 'Business', 'Wellness', 
  'Travel', 'Sports', 'History', 'Philosophy', 'Kids & Family', 'Arts', 'Music & Media', 
  'Political', 'Spiritual', 'Documentary', 'Personal Journal', 'Meditative', 'ASMR', 
  'Horror', 'Drama', 'Biography', 'Self-Improvement', 'Health & Fitness', 'Food & Cooking', 
  'Gardening', 'Parenting', 'Relationship Advice', 'Finance', 'Real Estate', 'Law', 
  'Mythology', 'Gaming', 'Movie Reviews', 'Anime', 'AI & Future', 'Entrepreneurship', 
  'Startup Talk', 'Productivity', 'Case Study', 'Product Review'
];

// REFINEMENT: Real ElevenLabs Pre-made Voice IDs
const VOICES = [
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (Deep / Narrative)' },
  { id: '21m00T83T45QR7oViVXq', name: 'Rachel (Clear / Casual)' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (Soft / Warm)' },
  { id: 'VR6AewrOoPST9074nu7h', name: 'Arnold (Powerful / Deep)' },
  { id: 'AZnzlk1XhxPqc8pJ86nE', name: 'Domi (Friendly / Professional)' },
  { id: 'ErXw9S1aaBXv59cHq9vK', name: 'Antoni (Smooth / Calm)' }
];

export default function HomeScreen() {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  
  // UI States
  const [showOptions, setShowOptions] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'language' | 'category' | 'voice'>('language');
  
  // Subscription Interception (Simulation)
  const [hasSubscription, setHasSubscription] = useState(false);
  
  // Data States
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [summaryWords, setSummaryWords] = useState(500);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [selectedLanguage, setSelectedLanguage] = useState('Hindi');
  const [selectedCategory, setSelectedCategory] = useState('Story Telling');

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

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
          const file = result.assets[0];
          const sizeMB = (file.size || 0) / (1024 * 1024);
          
          if (sizeMB > 5) {
              Alert.alert('File too large', 'Please upload a document smaller than 5MB.');
              return;
          }
          
          setSelectedFile(file);
      }
    } catch (err) {
      console.error('Pick Document Error:', err);
    }
  };

  const currentPickerData = 
    pickerType === 'language' ? LANGUAGES : 
    pickerType === 'category' ? CATEGORIES : 
    VOICES.map(v => v.name);

  if (!hasSubscription) {
      // Direct redirect to Paywall if no subscription
      return (
          <View style={{ flex: 1, backgroundColor: '#103E5B' }}>
              <TouchableOpacity 
                  style={{ flex: 1 }} 
                  onPress={() => setHasSubscription(true)} 
                  activeOpacity={1}
              >
                  <PaywallScreen />
              </TouchableOpacity>
          </View>
      );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <View>
              <Text style={styles.userNameTitle}>Vinu Patidar</Text>
              <Text style={styles.headerWelcomeLabel}>LISTEN TO YOUR DOCUMENT SUMMARISE PODCAST</Text>
            </View>
          </View>

          <View style={styles.summarizeContainer}>
            <Text style={styles.instruction}>Upload a file or paste your script below to get started.</Text>

            <TouchableOpacity style={styles.uploadCard} onPress={pickDocument} activeOpacity={0.7}>
              <View style={styles.dashContainer}>
                {selectedFile ? (
                    <View style={{ alignItems: 'center' }}>
                        <Ionicons name="checkmark-circle" size={32} color={Colors.light.primary} />
                        <Text style={styles.uploadTitle} numberOfLines={1}>{selectedFile.name}</Text>
                        <TouchableOpacity onPress={() => setSelectedFile(null)}>
                            <Text style={styles.uploadSubtitle}>Tap to Remove</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={{ alignItems: 'center' }}>
                        <View style={styles.uploadIconContainer}>
                            <Ionicons name="document-text" size={32} color={Colors.light.primary} />
                        </View>
                        <Text style={styles.uploadTitle}>Upload Document</Text>
                        <Text style={styles.uploadSubtitle}>PDF, Word or Text files (Max 5MB)</Text>
                    </View>
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
                <View style={[styles.divider, { backgroundColor: '#eef' }]} />
                <Text style={styles.dividerText}>OR PASTE TEXT (Max 1000 words)</Text>
                <View style={[styles.divider, { backgroundColor: '#eef' }]} />
            </View>

            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Paste your content here..."
                placeholderTextColor={Colors.light.onSurfaceVariant}
                multiline
                value={text}
                onChangeText={setText}
              />
            </View>

            <TouchableOpacity 
                style={styles.generateButtonContainer} 
                onPress={() => {
                   const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
                   if (wordCount > 1000) {
                       Alert.alert('Too many words', 'Please reduce your text to under 1000 words.');
                       return;
                   }
                   if (!text.trim() && !selectedFile) {
                       Alert.alert('Missing content', 'Please upload a file or paste some text first.');
                       return;
                   }
                   setShowOptions(true);
                }}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={Colors.light.signatureGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.generateButton}
                >
                    <Ionicons name="sparkles" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.generateButtonText}>Generate Podcast ⚡</Text>
                </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showOptions && (
        <View style={styles.absoluteOverlay}>
            <TouchableOpacity style={styles.flexOne} activeOpacity={1} onPress={() => setShowOptions(false)} />
            <View style={styles.customBottomSheet}>
                <View style={styles.customHandle} />
                <View style={[styles.sheetContent, { maxHeight: SCREEN_HEIGHT * 0.75 }]}>
                    <Text style={styles.sheetTitle}>Podcast Options</Text>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                        <Text style={styles.label}>AI VOICE SPEAKER</Text>
                        <TouchableOpacity style={styles.pickerButton} onPress={() => openPicker('voice')}>
                            <Text style={styles.pickerText}>{selectedVoice.name}</Text>
                            <Ionicons name="chevron-forward" size={18} color={Colors.light.primary} />
                        </TouchableOpacity>

                        <Text style={styles.label}>LANGUAGE</Text>
                        <TouchableOpacity style={styles.pickerButton} onPress={() => openPicker('language')}>
                            <Text style={styles.pickerText}>{selectedLanguage}</Text>
                            <Ionicons name="chevron-forward" size={18} color={Colors.light.primary} />
                        </TouchableOpacity>

                        <Text style={styles.label}>CATEGORY</Text>
                        <TouchableOpacity style={styles.pickerButton} onPress={() => openPicker('category')}>
                            <Text style={styles.pickerText}>{selectedCategory}</Text>
                            <Ionicons name="chevron-forward" size={18} color={Colors.light.primary} />
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                            <Text style={styles.label}>SUMMARY LENGTH</Text>
                            <Text style={[styles.label, { color: Colors.light.primary }]}>{summaryWords} words</Text>
                        </View>
                        <Slider 
                            style={styles.slider} 
                            minimumValue={100} 
                            maximumValue={1000} 
                            step={50} 
                            value={summaryWords} 
                            onValueChange={setSummaryWords}
                            minimumTrackTintColor={Colors.light.primary}
                            maximumTrackTintColor="#D3D3D3"
                            thumbTintColor={Colors.light.primary} 
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                            <Text style={styles.label}>VOICE SPEED</Text>
                            <Text style={[styles.label, { color: Colors.light.primary }]}>{voiceSpeed.toFixed(1)}x</Text>
                        </View>
                        <Slider 
                            style={styles.slider} 
                            minimumValue={0.5} 
                            maximumValue={2.0} 
                            step={0.1} 
                            value={voiceSpeed} 
                            onValueChange={setVoiceSpeed}
                            minimumTrackTintColor={Colors.light.primary}
                            maximumTrackTintColor="#D3D3D3"
                            thumbTintColor={Colors.light.primary} 
                        />

                        <TouchableOpacity 
                            style={styles.startGenerationButton}
                            onPress={() => {
                                setShowOptions(false);
                                router.push({
                                    pathname: '/generating-audio',
                                    params: { 
                                        text, fileUri: selectedFile?.uri, fileName: selectedFile?.name,
                                        fileType: selectedFile?.mimeType, language: selectedLanguage, 
                                        category: selectedCategory, maxWords: summaryWords,
                                        speed: voiceSpeed, voiceId: selectedVoice.id
                                    }
                                });
                            }}
                        >
                            <LinearGradient colors={Colors.light.signatureGradient} style={styles.startGenerationGradient}>
                                <Text style={styles.startGenerationText}>Start Generating 🎧</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </View>
      )}

      {pickerVisible && (
        <View style={styles.absoluteOverlayHigher}>
            <TouchableOpacity style={styles.flexOne} activeOpacity={1} onPress={() => setPickerVisible(false)} />
            <View style={styles.subModalContent}>
                <View style={styles.subModalHeader}>
                    <Text style={styles.subModalTitle}>Choose {pickerType}</Text>
                    <TouchableOpacity onPress={() => setPickerVisible(false)}>
                        <Ionicons name="close-circle" size={28} color={Colors.light.onSurfaceVariant} />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={currentPickerData}
                    keyExtractor={(_, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                    style={{ maxHeight: SCREEN_HEIGHT * 0.5 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.selectionItem} 
                            onPress={() => handleSelect(pickerType === 'voice' ? VOICES.find(v => v.name === item) : item)}
                        >
                            <Text style={[styles.selectionLabel, (selectedLanguage === item || selectedCategory === item || selectedVoice.name === item) && styles.activeSelectionLabel]}>{item}</Text>
                            {(selectedLanguage === item || selectedCategory === item || selectedVoice.name === item) && (
                                <Ionicons name="checkmark" size={20} color={Colors.light.primary} />
                            )}
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
      )}

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
        <TouchableOpacity style={styles.tabItem} onPress={() => route && router.replace(route as any)}>
            <Ionicons name={icon + (active ? "" : "-outline") as any} size={22} color={active ? Colors.light.primary : Colors.light.onSurfaceVariant} />
            <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>{label}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf9fe' },
  scrollContent: { padding: 24, paddingBottom: 110 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 30, marginTop: 10 },
  headerWelcomeLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, color: Colors.light.onSurfaceVariant, letterSpacing: 2, marginTop: 8 },
  userNameTitle: { fontFamily: 'Inter_700Bold', fontSize: 32, color: Colors.light.onSurface, lineHeight: 38 },
  summarizeContainer: { gap: 0 },
  instruction: { fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.light.onSurfaceVariant, marginBottom: 20, lineHeight: 22 },
  uploadCard: { backgroundColor: 'white', borderRadius: 24, padding: 4, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  dashContainer: { borderWidth: 1, borderColor: '#eef', borderStyle: 'dashed', borderRadius: 20, padding: 24, alignItems: 'center' },
  uploadIconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0, 88, 188, 0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  uploadTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.light.onSurface, marginBottom: 4 },
  uploadSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.light.onSurfaceVariant },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  divider: { flex: 1, height: 1 },
  dividerText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#bbb', marginHorizontal: 16, letterSpacing: 1 },
  textInputContainer: { backgroundColor: 'white', borderRadius: 20, padding: 16, height: 140, marginBottom: 24, elevation: 1 },
  textInput: { fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.light.onSurface, flex: 1, textAlignVertical: 'top' },
  generateButtonContainer: { elevation: 5, marginBottom: 40 },
  generateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 24 },
  generateButtonText: { color: 'white', fontFamily: 'Inter_700Bold', fontSize: 18 },
  
  absoluteOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, justifyContent: 'flex-end' },
  absoluteOverlayHigher: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 2000, justifyContent: 'center', alignItems: 'center', padding: 20 },
  flexOne: { flex: 1 },
  customBottomSheet: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingBottom: 40 },
  customHandle: { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, alignSelf: 'center', marginVertical: 12 },
  sheetContent: { paddingHorizontal: 24 },
  sheetTitle: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#111', marginBottom: 20 },
  label: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#888', letterSpacing: 1, marginBottom: 8, marginTop: 8 },
  pickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f5f7fa', padding: 16, borderRadius: 14, marginBottom: 16 },
  pickerText: { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#333' },
  slider: { width: '100%', height: 40 },
  startGenerationButton: { marginTop: 24 },
  startGenerationGradient: { paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  startGenerationText: { color: 'white', fontFamily: 'Inter_700Bold', fontSize: 18 },
  
  subModalContent: { width: '100%', backgroundColor: 'white', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  subModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  subModalTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#111' },
  selectionItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  selectionLabel: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#333' },
  activeSelectionLabel: { fontFamily: 'Inter_700Bold', color: Colors.light.primary },
  
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 75, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  tabItem: { alignItems: 'center' },
  tabLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 4, color: '#aaa' },
  activeTabLabel: { fontFamily: 'Inter_700Bold', color: Colors.light.primary },
});
