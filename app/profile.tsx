import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Animated, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const PLANS = [
    {
        id: 'express',
        name: 'Express Plan',
        price: '$20',
        period: '/month',
        features: ['5 AI Podcast Generations', '30 Days Library History', 'High Quality Audio', 'Standard Support'],
        gradient: ['#6366f1', '#a855f7'],
        color: '#6366f1'
    },
    {
        id: 'pro',
        name: 'Professional Plan',
        price: '$40',
        period: '/month',
        features: ['20 AI Podcast Generations', 'Full Library History Access', 'Ultra High Quality Audio', 'Priority 24/7 Support', 'Custom Voice Control'],
        gradient: ['#1e293b', '#334155'], // Professional dark theme
        color: '#1e293b'
    }
];

export default function ProfileScreen() {
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [showPlanDetails, setShowPlanDetails] = useState(false);

    const openPlanDetails = (plan: any) => {
        setSelectedPlan(plan);
        setShowPlanDetails(true);
    };

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

                {/* Subscription Banners */}
                <Text style={styles.sectionTitle}>Choose Your Plan</Text>
                <View style={styles.subscriptionContainer}>
                    {PLANS.map((plan) => (
                        <TouchableOpacity 
                            key={plan.id}
                            style={styles.planCardContainer}
                            activeOpacity={0.9}
                            onPress={() => openPlanDetails(plan)}
                        >
                            <LinearGradient
                                colors={plan.gradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.planCard}
                            >
                                <View style={styles.planCardHeader}>
                                    <View>
                                        <Text style={styles.planName}>{plan.name}</Text>
                                        <Text style={styles.planPriceText}>{plan.price}<Text style={styles.planPeriodText}>{plan.period}</Text></Text>
                                    </View>
                                    <View style={styles.planIconCircle}>
                                        <Ionicons name={plan.id === 'pro' ? "diamond" : "flash"} size={20} color="white" />
                                    </View>
                                </View>
                                <View style={styles.planCardFooter}>
                                    <Text style={styles.viewDetailsText}>View Details</Text>
                                    <Ionicons name="arrow-forward" size={14} color="white" />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
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

                {/* Account Management */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Management</Text>
                    <View style={styles.card}>
                        <SettingItem icon="log-out" label="Sign Out" danger />
                        <SettingItem icon="trash" label="Delete My Account" danger />
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Plan Details Modal Overlay */}
            {showPlanDetails && selectedPlan && (
                <View style={styles.absoluteOverlay}>
                    <TouchableOpacity style={styles.flexOne} activeOpacity={1} onPress={() => setShowPlanDetails(false)} />
                    <View style={styles.customBottomSheet}>
                        <View style={styles.customHandle} />
                        <View style={styles.sheetContent}>
                            <View style={[styles.planHeaderBadge, { backgroundColor: selectedPlan.color }]}>
                                <Ionicons name={selectedPlan.id === 'pro' ? "diamond" : "flash"} size={24} color="white" />
                            </View>
                            <Text style={styles.sheetPlanName}>{selectedPlan.name}</Text>
                            <Text style={styles.sheetPlanPrice}>{selectedPlan.price}<Text style={styles.sheetPlanPeriod}>{selectedPlan.period}</Text></Text>
                            
                            <View style={styles.featuresList}>
                                {selectedPlan.features.map((feature: string, index: number) => (
                                    <View key={index} style={styles.featureRow}>
                                        <Ionicons name="checkmark-circle" size={20} color={selectedPlan.color} />
                                        <Text style={styles.featureText}>{feature}</Text>
                                    </View>
                                ))}
                            </View>

                            <TouchableOpacity 
                                style={[styles.subscribeButton, { backgroundColor: selectedPlan.color }]}
                                onPress={() => setShowPlanDetails(false)}
                            >
                                <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            <View style={styles.tabBar}>
                <TabItem icon="home" label="HOME" route="/" />
                <TabItem icon="mic" label="LIBRARY" route="/library" />
                <TabItem icon="person" label="PROFILE" active />
            </View>
        </SafeAreaView>
    );
}

function SettingItem({ icon, label, value, danger }: any) {
    return (
        <TouchableOpacity style={styles.settingItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.settingIconContainer, danger && { backgroundColor: 'rgba(255, 99, 71, 0.05)' }]}>
                    <Ionicons name={icon} size={18} color={danger ? "#FF6347" : "#555"} />
                </View>
                <Text style={[styles.settingLabel, danger && { color: '#FF6347', fontFamily: 'Inter_700Bold' }]}>{label}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {value && <Text style={styles.settingValue}>{value}</Text>}
                <Ionicons name="chevron-forward" size={16} color={danger ? "#FF6347" : "#ccc"} />
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
    profileHeader: { alignItems: 'center', marginVertical: 20, marginBottom: 30 },
    avatarGradient: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: Colors.light.primary, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
    avatarText: { color: 'white', fontFamily: 'Inter_700Bold', fontSize: 28 },
    userName: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#111' },
    userEmail: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#888', marginTop: 4 },
    editProfileButton: { marginTop: 12, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(0, 88, 188, 0.05)' },
    editProfileText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: Colors.light.primary },
    
    subscriptionContainer: { gap: 16, marginBottom: 32 },
    planCardContainer: { borderRadius: 24, overflow: 'hidden', elevation: 4 },
    planCard: { padding: 24, minHeight: 140, justifyContent: 'space-between' },
    planCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    planName: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
    planPriceText: { fontFamily: 'Inter_700Bold', fontSize: 28, color: 'white' },
    planPeriodText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.7)' },
    planIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    planCardFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    viewDetailsText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: 'white' },
    
    section: { marginBottom: 24 },
    sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#111', marginBottom: 12, marginLeft: 4 },
    card: { backgroundColor: 'white', borderRadius: 24, padding: 8, elevation: 1 },
    settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
    settingIconContainer: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#f5f7fa', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    settingLabel: { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#333' },
    settingValue: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#aaa', marginRight: 8 },
    
    absoluteOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, justifyContent: 'flex-end' },
    flexOne: { flex: 1 },
    customBottomSheet: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingBottom: 40 },
    customHandle: { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, alignSelf: 'center', marginVertical: 12 },
    sheetContent: { paddingHorizontal: 24, alignItems: 'center', paddingTop: 10 },
    planHeaderBadge: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    sheetPlanName: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#111', marginBottom: 8 },
    sheetPlanPrice: { fontFamily: 'Inter_700Bold', fontSize: 32, color: '#111', marginBottom: 24 },
    sheetPlanPeriod: { fontSize: 14, color: '#888' },
    featuresList: { width: '100%', gap: 16, marginBottom: 32 },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    featureText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#555' },
    subscribeButton: { width: '100%', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
    subscribeButtonText: { color: 'white', fontFamily: 'Inter_700Bold', fontSize: 16 },
    
    tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 75, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    tabItem: { alignItems: 'center' },
    tabLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 4, color: '#aaa' },
    activeTabLabel: { fontFamily: 'Inter_700Bold', color: Colors.light.primary },
});
