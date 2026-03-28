import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, Modal, Dimensions, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Slider from '@react-native-community/slider';
import * as DocumentPicker from 'expo-document-picker';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const LANGUAGES = [
  'English (US)', 'English (UK)', 'Hindi', 'Spanish', 'French', 'German', 'Chinese (Mandarin)', 
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
  'Mythology', 'Gaming', 'Movie Reviews', 'Anime', 'AI & Future', 'Entrepreneurship', 'Startup Talk',
  'Productivity', 'Case Study', 'Product Review'
];

const VOICES = [
  { id: 'aria', name: 'Aria — Warm & Friendly' },
  { id: 'marcus', name: 'Marcus — Authoritative' },
  { id: 'sofia', name: 'Sofia — Soft & Calm' },
  { id: 'jake', name: 'Jake — High Energy' }
];

export default function HomeScreen() {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  
  // UI States
  const [showOptions, setShowOptions] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'language' | 'category' | 'voice'>('language');
  
  // Data States
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [summaryWords, setSummaryWords] = useState(500);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [selectedLanguage, setSelectedLanguage] = useState('Hindi'); // Default to Hindi as per user request
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
          setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      console.error('Pick Document Error:', err);
    }
  };

  const currentPickerData = 
    pickerType === 'language' ? LANGUAGES : 
    pickerType === 'category' ? CATEGORIES : 
    VOICES.map(v => v.name);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <View>
              <Text style={styles.userNameTitle}>Vinu Patidar</Text>
              <Text style={styles.headerWelcomeLabel}>LISTEN TO YOUR DOCUMENT SUMMARISE PODCAST</Text>
            </View>
          </View>

          <View style={styles.summarizeContainer}>
            <Text style={styles.instruction}>Upload a file or paste your script below to get started.</Text>

            {/* Document Upload */}
            <TouchableOpacity style={styles.uploadCard} onPress={pickDocument}>
              <View style={styles.dashContainer}>
                {selectedFile ? (
                    <>
                        <View style={styles.uploadIconContainer}>
                            <Ionicons name="checkmark-circle" size={32} color={Colors.light.primary} />
                        </View>
                        <Text style={styles.uploadTitle}>{selectedFile.name}</Text>
                        <TouchableOpacity onPress={() => setSelectedFile(null)}>
                            <Text style={styles.uploadSubtitle}>Tap to Change or Remove</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <View style={styles.uploadIconContainer}>
                            <Ionicons name="document-text" size={32} color={Colors.light.primary} />
                        </View>
                        <Text style={styles.uploadTitle}>Upload Document</Text>
                        <Text style={styles.uploadSubtitle}>
                            Drag or select PDF, Word or{'\n'}Text files to get started.
                        </Text>
                    </>
                )}
              </View>
            </TouchableOpacity>

            {/* Quick Select Buttons */}
            <View style={styles.quickSelectors}>
                <TouchableOpacity style={styles.miniPicker} onPress={() => openPicker('language')}>
                    <Ionicons name="language" size={16} color={Colors.light.primary} />
                    <Text style={styles.miniPickerText} numberOfLines={1}>{selectedLanguage}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.miniPicker} onPress={() => openPicker('category')}>
                    <Ionicons name="list" size={16} color={Colors.light.primary} />
                    <Text style={styles.miniPickerText} numberOfLines={1}>{selectedCategory}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR PASTE TEXT</Text>
                <View style={styles.divider} />
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
                onPress={() => setShowOptions(true)}
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

      {/* REFINEMENT: COMBINED OPTIONS MODAL TO PREVENT Z-INDEX ISSUES */}
      <Modal visible={showOptions} animationType="slide" transparent onRequestClose={() => setShowOptions(false)}>
        <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.dismissOverlay} activeOpacity={1} onPress={() => setShowOptions(false)} />
            <View style={styles.bottomSheet}>
                <View style={styles.handle} />
                <View style={[styles.sheetContent, { maxHeight: SCREEN_HEIGHT * 0.75 }]}>
                    <Text style={styles.sheetTitle}>Voice Options</Text>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                        <Text style={styles.label}>VOICE / SPEAKER</Text>
                        <TouchableOpacity style={styles.pickerButton} onPress={() => openPicker('voice')}>
                            <Text style={styles.pickerText}>{selectedVoice.name}</Text>
                            <Ionicons name="chevron-expand" size={18} color={Colors.light.primary} />
                        </TouchableOpacity>

                        <Text style={styles.label}>LANGUAGE</Text>
                        <TouchableOpacity style={styles.pickerButton} onPress={() => openPicker('language')}>
                            <Text style={styles.pickerText}>{selectedLanguage}</Text>
                            <Ionicons name="chevron-expand" size={18} color={Colors.light.primary} />
                        </TouchableOpacity>

                        <Text style={styles.label}>CATEGORY</Text>
                        <TouchableOpacity style={styles.pickerButton} onPress={() => openPicker('category')}>
                            <Text style={styles.pickerText}>{selectedCategory}</Text>
                            <Ionicons name="chevron-expand" size={18} color={Colors.light.primary} />
                        </TouchableOpacity>

                        <Text style={styles.label}>LENGTH: {summaryWords} WORDS</Text>
                        <Slider 
                            style={styles.slider} minimumValue={100} maximumValue={800} step={50} 
                            value={summaryWords} onValueChange={setSummaryWords}
                            minimumTrackTintColor={Colors.light.primary} thumbTintColor={Colors.light.primary} 
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
                                <Text style={styles.startGenerationText}>Start Podcast ⚡</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </View>
      </Modal>

      {/* INDEPENDENT SELECTION PICKER */}
      <Modal visible={pickerVisible} animationType="fade" transparent onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.subModalOverlay}>
            <View style={styles.subModalContent}>
                <View style={styles.subModalHeader}>
                    <Text style={styles.subModalTitle}>Select {pickerType}</Text>
                    <TouchableOpacity onPress={() => setPickerVisible(false)}>
                        <Ionicons name="close" size={24} color={Colors.light.onSurface} />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={currentPickerData}
                    keyExtractor={(_, index) => index.toString()}
                    style={{ maxHeight: SCREEN_HEIGHT * 0.4 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.selectionItem} onPress={() => handleSelect(pickerType === 'voice' ? VOICES.find(v => v.name === item) : item)}>
                            <Text style={[styles.selectionLabel, (selectedLanguage === item || selectedCategory === item || selectedVoice.name === item) && styles.activeSelectionLabel]}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
      </Modal>

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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 40, marginTop: 10 },
  headerWelcomeLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, color: Colors.light.onSurfaceVariant, letterSpacing: 2, marginTop: 8 },
  userNameTitle: { fontFamily: 'Inter_700Bold', fontSize: 32, color: Colors.light.onSurface, lineHeight: 38 },
  summarizeContainer: { gap: 0 },
  instruction: { fontFamily: 'Inter_400Regular', fontSize: 16, color: Colors.light.onSurfaceVariant, marginBottom: 24, marginTop: -8, lineHeight: 22 },
  uploadCard: { backgroundColor: 'white', borderRadius: 24, padding: 4, marginBottom: 24, shadowColor: Colors.light.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.05, shadowRadius: 32, elevation: 2 },
  dashContainer: { borderWidth: 1, borderColor: 'rgba(0, 88, 188, 0.1)', borderStyle: 'dashed', borderRadius: 20, padding: 32, alignItems: 'center', justifyContent: 'center' },
  uploadIconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(0, 88, 188, 0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  uploadTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: Colors.light.onSurface, marginBottom: 8, textAlign: 'center' },
  uploadSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.light.onSurfaceVariant, textAlign: 'center', lineHeight: 20 },
  quickSelectors: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  miniPicker: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 16, borderWeight: 1, borderColor: '#eee', gap: 8 },
  miniPickerText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: Colors.light.onSurface },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  divider: { flex: 1, height: 1, backgroundColor: 'rgba(0, 88, 188, 0.05)' },
  dividerText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: Colors.light.onSurfaceVariant, marginHorizontal: 16, letterSpacing: 1 },
  textInputContainer: { backgroundColor: 'white', borderRadius: 20, padding: 16, height: 160, marginBottom: 32, shadowColor: Colors.light.primary, shadowOpacity: 0.04, shadowRadius: 16, elevation: 1 },
  textInput: { fontFamily: 'Inter_400Regular', fontSize: 16, color: Colors.light.onSurface, flex: 1, textAlignVertical: 'top' },
  generateButtonContainer: { shadowColor: Colors.light.primary, shadowOpacity: 0.2, shadowRadius: 32, elevation: 8, marginBottom: 40 },
  generateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 30 },
  generateButtonText: { color: 'white', fontFamily: 'Inter_700Bold', fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(26, 27, 31, 0.6)', justifyContent: 'flex-end' },
  dismissOverlay: { flex: 1 },
  bottomSheet: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 12 },
  handle: { width: 40, height: 4, backgroundColor: '#eee', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetContent: { paddingHorizontal: 24 },
  sheetTitle: { fontFamily: 'Inter_700Bold', fontSize: 24, color: Colors.light.onSurface, marginBottom: 24 },
  label: { fontFamily: 'Inter_700Bold', fontSize: 11, color: Colors.light.onSurfaceVariant, letterSpacing: 1, marginBottom: 10, marginTop: 10 },
  pickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9f9f9', padding: 16, borderRadius: 14, marginBottom: 16 },
  pickerText: { fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.light.onSurface },
  slider: { width: '100%', height: 40, marginBottom: 10 },
  startGenerationButton: { shadowColor: Colors.light.primary, shadowOpacity: 0.2, shadowRadius: 32, elevation: 8, marginVertical: 30 },
  startGenerationGradient: { paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  startGenerationText: { color: 'white', fontFamily: 'Inter_700Bold', fontSize: 18 },
  subModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  subModalContent: { width: '100%', backgroundColor: 'white', borderRadius: 24, padding: 24 },
  subModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  subModalTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.light.onSurface },
  selectionItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  selectionLabel: { fontFamily: 'Inter_400Regular', fontSize: 16, color: Colors.light.onSurface },
  activeSelectionLabel: { fontFamily: 'Inter_700Bold', color: Colors.light.primary },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(250, 249, 254, 0.95)', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 20 },
  tabItem: { alignItems: 'center' },
  tabLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 4, color: '#aaa' },
  activeTabLabel: { fontFamily: 'Inter_700Bold', color: Colors.light.primary },
});
