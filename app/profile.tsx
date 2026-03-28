import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <LinearGradient
                        colors={Colors.light.signatureGradient}
                        style={styles.avatarGradient}
                    >
                        <Text style={styles.avatarText}>VP</Text>
                    </LinearGradient>
                    <Text style={styles.userName}>Vinu Patidar</Text>
                    <Text style={styles.userEmail}>vinu@example.com</Text>
                    
                    <TouchableOpacity style={styles.editProfileButton}>
                        <Text style={styles.editProfileText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Section */}
                <View style={styles.statsContainer}>
                    <StatItem icon="mic" label="Episodes" value="12" />
                    <StatItem icon="time" label="Minutes" value="45" />
                    <StatItem icon="flash" label="Rank" value="Pro" />
                </View>

                {/* Settings Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <View style={styles.card}>
                        <SettingItem icon="notifications" label="Notifications" />
                        <SettingItem icon="language" label="App Language" value="English" />
                        <SettingItem icon="moon" label="Dark Mode" value="System" />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support & Legal</Text>
                    <View style={styles.card}>
                        <SettingItem icon="help-circle" label="Help Center" />
                        <SettingItem icon="shield-checkmark" label="Privacy Policy" />
                        <SettingItem icon="document-text" label="Terms of Service" />
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButton}>
                    <Ionicons name="log-out" size={18} color="#FF6347" style={{ marginRight: 8 }} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.tabBar}>
                <TabItem icon="home" label="HOME" route="/" />
                <TabItem icon="mic" label="LIBRARY" route="/library" />
                <TabItem icon="person" label="PROFILE" active />
            </View>
        </SafeAreaView>
    );
}

function StatItem({ icon, label, value }: any) {
    return (
        <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
                <Ionicons name={icon} size={20} color={Colors.light.primary} />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function SettingItem({ icon, label, value }: any) {
    return (
        <TouchableOpacity style={styles.settingItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.settingIconContainer}>
                    <Ionicons name={icon} size={18} color="#555" />
                </View>
                <Text style={styles.settingLabel}>{label}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {value && <Text style={styles.settingValue}>{value}</Text>}
                <Ionicons name="chevron-forward" size={16} color="#ccc" />
            </View>
        </TouchableOpacity>
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
    scrollContent: { padding: 24 },
    profileHeader: { alignItems: 'center', marginVertical: 30 },
    avatarGradient: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: Colors.light.primary, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
    avatarText: { color: 'white', fontFamily: 'Inter_700Bold', fontSize: 32 },
    userName: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#111' },
    userEmail: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#888', marginTop: 4 },
    editProfileButton: { marginTop: 16, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: 'rgba(0, 88, 188, 0.05)' },
    editProfileText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: Colors.light.primary },
    
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
    statItem: { backgroundColor: 'white', padding: 16, borderRadius: 20, alignItems: 'center', width: (SCREEN_WIDTH - 48 - 24) / 3, elevation: 1 },
    statIconContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0, 88, 188, 0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    statValue: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#111' },
    statLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#888', letterSpacing: 0.5 },
    
    section: { marginBottom: 24 },
    sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#111', marginBottom: 12, marginLeft: 4 },
    card: { backgroundColor: 'white', borderRadius: 24, padding: 8, elevation: 1 },
    settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
    settingIconContainer: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#f5f7fa', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    settingLabel: { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#333' },
    settingValue: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#aaa', marginRight: 8 },
    
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, paddingVertical: 12 },
    logoutText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#FF6347' },
    
    tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 75, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    tabItem: { alignItems: 'center' },
    tabLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 4, color: '#aaa' },
    activeTabLabel: { fontFamily: 'Inter_700Bold', color: Colors.light.primary },
});
