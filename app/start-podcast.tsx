import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

/**
 * Start Podcast Screen
 * Matching the "Process Your Documents" design reference.
 */
export default function StartPodcastScreen() {
  const [text, setText] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Navigation Header */}
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.light.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>VoiceAI</Text>
          <View style={{ width: 40 }} /> {/* Spacer to center title */}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Page Header */}
          <View style={styles.pageHeader}>
            <Text style={styles.title}>Summarize Your{'\n'}Document</Text>
          </View>

          {/* Upload Method Toggle / Instructions */}
          <Text style={styles.instruction}>Upload a file or paste your script below to get started.</Text>

          {/* Large Upload Card (Digital Atoll Style) */}
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

          {/* Text Input Section */}
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

        {/* Generate Button (Sticky at Bottom) */}
        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={styles.generateButtonContainer}
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
  backButton: {
    padding: 8,
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
  instruction: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.light.onSurfaceVariant,
    marginBottom: 24,
  },
  uploadCard: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: 24,
    padding: 4, // Padding for the dashed border look
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
  generateButtonContainer: {
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 8,
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
});
