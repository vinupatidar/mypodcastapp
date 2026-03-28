import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Dimensions, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../services/supabase';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    
    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const handleAuth = async () => {
        if (!email || !password || (!isLogin && !fullName)) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                // router.replace('/') will be handled by onAuthStateChange in index.tsx
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        }
                    }
                });
                if (error) throw error;
                
                if (data.session) {
                    Alert.alert('Welcome!', 'Account created successfully.');
                } else {
                    Alert.alert('Account Created', 'Please check your email to verify your account.');
                    setIsLogin(true);
                }
            }
        } catch (error: any) {
            Alert.alert('Authentication Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#103E5B', '#000000']}
                style={StyleSheet.absoluteFillObject}
            />
            
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <LinearGradient
                                colors={['#3b82f6', '#2dd4bf']}
                                style={styles.logoIcon}
                            >
                                <Ionicons name="mic" size={40} color="white" />
                            </LinearGradient>
                        </View>
                        <Text style={styles.title}>MyPodcast</Text>
                        <Text style={styles.subtitle}>{isLogin ? 'Welcome Back!' : 'Create Your Account'}</Text>
                    </View>

                    <View style={styles.authCard}>
                        {/* Tab Switcher */}
                        <View style={styles.tabContainer}>
                            <TouchableOpacity 
                                style={[styles.tab, isLogin && styles.activeTab]} 
                                onPress={() => setIsLogin(true)}
                            >
                                <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Login</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.tab, !isLogin && styles.activeTab]} 
                                onPress={() => setIsLogin(false)}
                            >
                                <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Register</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.form}>
                            {!isLogin && (
                                <View style={styles.inputContainer}>
                                    <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Full Name"
                                        placeholderTextColor="#888"
                                        value={fullName}
                                        onChangeText={setFullName}
                                    />
                                </View>
                            )}

                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email Address"
                                    placeholderTextColor="#888"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor="#888"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>

                            {isLogin && (
                                <TouchableOpacity style={styles.forgotBtn}>
                                    <Text style={styles.forgotText}>Forgot Password?</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity 
                                style={[styles.actionBtn, loading && { opacity: 0.7 }]} 
                                onPress={handleAuth}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={['#3b82f6', '#2dd4bf']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.actionGradient}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text style={styles.actionBtnText}>{isLogin ? 'Login' : 'Create Account'}</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>By continuing, you agree to our</Text>
                        <Text style={styles.footerLink}>Terms & Conditions</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#103E5B' },
    scrollContent: { padding: 30, paddingTop: SCREEN_HEIGHT * 0.1 },
    header: { alignItems: 'center', marginBottom: 40 },
    logoContainer: { marginBottom: 20 },
    logoIcon: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: '#3b82f6', shadowOpacity: 0.5, shadowRadius: 15, elevation: 10 },
    title: { color: 'white', fontSize: 32, fontFamily: 'Inter_700Bold' },
    subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 16, marginTop: 8 },
    
    authCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: 4, marginBottom: 24 },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
    activeTab: { backgroundColor: 'rgba(255,255,255,0.1)' },
    tabText: { color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_700Bold', fontSize: 14 },
    activeTabText: { color: 'white' },
    
    form: { gap: 16 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, paddingHorizontal: 16, height: 60, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, color: 'white', fontSize: 16 },
    forgotBtn: { alignSelf: 'flex-end', marginTop: 4 },
    forgotText: { color: '#3b82f6', fontSize: 13, fontFamily: 'Inter_700Bold' },
    actionBtn: { height: 64, borderRadius: 20, overflow: 'hidden', marginTop: 10 },
    actionGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    actionBtnText: { color: 'white', fontSize: 18, fontFamily: 'Inter_700Bold' },
    
    footer: { marginTop: 40, alignItems: 'center' },
    footerText: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
    footerLink: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'Inter_700Bold', marginTop: 4 },
});
