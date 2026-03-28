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
                colors={['#103E5B', '#071d2b']}
                style={StyleSheet.absoluteFillObject}
            />
            
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <SafeAreaView style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.header}>
                            <View style={styles.logoContainer}>
                                <LinearGradient
                                    colors={['#3b82f6', '#2dd4bf']}
                                    style={styles.logoIcon}
                                >
                                    <Ionicons name="mic" size={42} color="white" />
                                </LinearGradient>
                            </View>
                            <Text style={styles.title}>MYPODCAST</Text>
                        </View>

                        <View style={styles.authCard}>
                            {/* Tab Switcher */}
                            <View style={styles.tabContainer}>
                                <TouchableOpacity 
                                    style={[styles.tab, isLogin && styles.activeTab]} 
                                    onPress={() => {
                                        setIsLogin(true);
                                        setEmail('');
                                        setPassword('');
                                    }}
                                >
                                    <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Login</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.tab, !isLogin && styles.activeTab]} 
                                    onPress={() => {
                                        setIsLogin(false);
                                        setEmail('');
                                        setPassword('');
                                    }}
                                >
                                    <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Register</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.form}>
                                {!isLogin && (
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Full Name"
                                            placeholderTextColor="rgba(255,255,255,0.3)"
                                            value={fullName}
                                            onChangeText={setFullName}
                                        />
                                    </View>
                                )}

                                <View style={styles.inputContainer}>
                                    <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email Address"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={email}
                                        onChangeText={setEmail}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Password"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
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
                                            <Text style={styles.actionBtnText}>{isLogin ? 'LOG IN' : 'CREATE ACCOUNT'}</Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>By continuing, you agree to our</Text>
                            <TouchableOpacity>
                                <Text style={styles.footerLink}>Terms & Conditions</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#103E5B' },
    scrollContent: { padding: 30, paddingTop: SCREEN_HEIGHT * 0.08, paddingBottom: 50 },
    header: { alignItems: 'center', marginBottom: 50 },
    logoContainer: { marginBottom: 25 },
    logoIcon: { width: 90, height: 90, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#3b82f6', shadowOpacity: 0.4, shadowRadius: 20, elevation: 15 },
    title: { color: 'white', fontSize: 36, fontFamily: 'Inter_700Bold', letterSpacing: 3 },
    
    authCard: { 
        backgroundColor: 'rgba(255,255,255,0.06)', 
        borderRadius: 40, 
        padding: 24, 
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 30,
        elevation: 10
    },
    tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 5, marginBottom: 30 },
    tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 16 },
    activeTab: { backgroundColor: 'white' },
    tabText: { color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 0.5 },
    activeTabText: { color: '#103E5B' },
    
    form: { gap: 18 },
    inputContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: 'rgba(0,0,0,0.25)', 
        borderRadius: 18, 
        paddingHorizontal: 20, 
        height: 64, 
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.08)' 
    },
    inputIcon: { marginRight: 15 },
    input: { flex: 1, color: 'white', fontSize: 16, fontFamily: 'Inter_400Regular' },
    forgotBtn: { alignSelf: 'flex-end', marginTop: 2 },
    forgotText: { color: '#3b82f6', fontSize: 13, fontFamily: 'Inter_700Bold' },
    
    actionBtn: { height: 68, borderRadius: 22, overflow: 'hidden', marginTop: 12, elevation: 8, shadowColor: '#3b82f6', shadowOpacity: 0.4, shadowRadius: 15 },
    actionGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    actionBtnText: { color: 'white', fontSize: 16, fontFamily: 'Inter_800ExtraBold', letterSpacing: 1.5 },
    
    footer: { marginTop: 45, alignItems: 'center' },
    footerText: { color: 'rgba(255,255,255,0.35)', fontSize: 12, fontFamily: 'Inter_400Regular' },
    footerLink: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'Inter_700Bold', marginTop: 6, textDecorationLine: 'underline' },
});
