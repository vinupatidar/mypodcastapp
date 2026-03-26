import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, Modal, Dimensions, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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

export default function StartPodcastScreen() {
  const [text, setText] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  
  // Selection Modal State
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'language' | 'category' | 'voice'>('language');
  
  // Generation Options State
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [summaryWords, setSummaryWords] = useState(500);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');
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

  const currentPickerData = 
    pickerType === 'language' ? LANGUAGES : 
    pickerType === 'category' ? CATEGORIES : 
    VOICES.map(v => v.name);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.light.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>VoiceAI</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.pageHeader}>
            <Text style={styles.title}>Summarize Your{'\n'}Document</Text>
          </View>

          <Text style={styles.instruction}>Upload a file or paste your script below to get started.</Text>

          <TouchableOpacity style={styles.uploadCard}>
            <View style={styles.dashContainer}>
              <View style={styles.uploadIconContainer}>
                <Ionicons name="document-text" size={32} color={Colors.light.primary} />
              </View>
              <Text style={styles.uploadTitle}>Upload Document</Text>
              <Text style={styles.uploadSubtitle}>
                Drag or select PDF, Word or{'\n'}Text files to get started.
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR PASTE TEXT</Text>
              <View style={styles.divider} />
          </View>

          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Paste your content here (up to 500 words)..."
              placeholderTextColor={Colors.light.onSurfaceVariant}
              multiline
              textAlignVertical="top"
              value={text}
              onChangeText={setText}
            />
            <Text style={styles.wordCount}>{text.split(/\s+/).filter(w => w !== '').length} / 500 words</Text>
          </View>
        </ScrollView>

        <View style={styles.bottomActions}>
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
              <Text style={styles.generateButtonText}>Generate</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Generation Options Modal */}
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
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{summaryWords} words</Text>
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
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{voiceSpeed.toFixed(1)}x</Text>
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

                        <TouchableOpacity style={styles.startGenerationButton}>
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

      {/* Sub-Picker Modal for Selections */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.light.onSurface,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 150,
  },
  pageHeader: {
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: Colors.light.onSurface,
    lineHeight: 38,
  },
  instruction: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.light.onSurfaceVariant,
    marginBottom: 24,
  },
  uploadCard: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: 24,
    padding: 4,
    marginBottom: 32,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.05,
    shadowRadius: 32,
  },
  dashContainer: {
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 88, 188, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.light.onSurface,
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.light.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.surfaceContainer,
  },
  dividerText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: Colors.light.onSurfaceVariant,
    marginHorizontal: 16,
    letterSpacing: 1,
  },
  textInputContainer: {
    backgroundColor: Colors.light.surfaceContainerHighest,
    borderRadius: 16,
    padding: 16,
    minHeight: 180,
  },
  textInput: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.light.onSurface,
    flex: 1,
    height: 120,
  },
  wordCount: {
    alignSelf: 'flex-end',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.light.onSurfaceVariant,
    marginTop: 10,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 30,
  },
  generateButtonText: {
    color: 'white',
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 27, 31, 0.4)',
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
  badge: {
    backgroundColor: 'rgba(0, 88, 188, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
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
  }
});
