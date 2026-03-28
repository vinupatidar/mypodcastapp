import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// SUBSCRIPTION DATA (Matched to user screenshot style)
const UPGRADE_PLANS = [
    {
        id: 'yearly',
        name: 'Yearly',
        price: '₹500.00 /y',
        subtitle: 'Pay for a year',
        features: ['No ads, experience ad free app', 'View and manage unlimited documents', 'All pro tools'],
        isBest: true
    },
    {
        id: 'monthly',
        name: 'Monthly',
        price: '₹70.00 /m',
        subtitle: 'Pay monthly, cancel anytime',
        features: ['Ad free experience', 'Access to all library features'],
        isBest: false
    }
];

export default function ProfileScreen() {
    const [currentPlan, setCurrentPlan] = useState('Free Explorer');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedUpgrade, setSelectedUpgrade] = useState('yearly');

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

                {/* CURRENT PLAN - BLUE BANNER */}
                <View style={styles.currentPlanSection}>
                    <Text style={styles.sectionTitle}>Your Subscription</Text>
                    <LinearGradient
                        colors={['#0058bc', '#0072ff']}
                        style={styles.currentPlanCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <View style={styles.planInfo}>
                            <View style={styles.planIconCircle}>
                                <Ionicons name="star" size={24} color="white" />
                            </View>
                            <View>
                                <Text style={styles.planBadge}>ACTIVE PLAN</Text>
                                <Text style={styles.currentPlanName}>{currentPlan}</Text>
                            </View>
                        </View>
                        
                        <TouchableOpacity style={styles.upgradeBtn} onPress={() => setShowUpgradeModal(true)}>
                            <Text style={styles.upgradeBtnText}>Upgrade Plan</Text>
                            <Ionicons name="sparkles" size={14} color={Colors.light.primary} />
                        </TouchableOpacity>
                    </LinearGradient>
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

            {/* UPGRADE MODAL - DARK THEMED AS PER SCREENSHOT */}
            {showUpgradeModal && (
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.flexOne} activeOpacity={1} onPress={() => setShowUpgradeModal(false)} />
                    <View style={styles.darkSheet}>
                        <View style={styles.darkSheetHeader}>
                            <TouchableOpacity onPress={() => setShowUpgradeModal(false)} style={styles.closeModalBtn}>
                                <Ionicons name="chevron-back" size={24} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.moreOptionsBtn}>
                                <Ionicons name="ellipsis-horizontal" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalTitle}>Choose a plan</Text>
                        <Text style={styles.modalSubtitle}>All features, No limit</Text>

                        <ScrollView style={styles.planScroll} showsVerticalScrollIndicator={false}>
                            {UPGRADE_PLANS.map((plan) => (
                                <TouchableOpacity 
                                    key={plan.id}
                                    style={[styles.planOptionCard, selectedUpgrade === plan.id && styles.planOptionCardActive]}
                                    activeOpacity={0.8}
                                    onPress={() => setSelectedUpgrade(plan.id)}
                                >
                                    <View style={styles.optionHeader}>
                                        <View style={styles.radioRow}>
                                            <View style={[styles.radioOuter, selectedUpgrade === plan.id && styles.radioOuterActive]}>
                                                {selectedUpgrade === plan.id && <View style={styles.radioInner} />}
                                            </View>
                                            <View>
                                                <Text style={styles.optionName}>{plan.name}</Text>
                                                <Text style={styles.optionSubtitle}>{plan.subtitle}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.optionPrice}>{plan.price}</Text>
                                    </View>
                                    
                                    {selectedUpgrade === plan.id && (
                                        <View style={styles.featuresBox}>
                                            {plan.features.map((f, i) => (
                                                <View key={i} style={styles.featureLine}>
                                                    <View style={styles.bullet} />
                                                    <Text style={styles.featureLineText}>{f}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {plan.isBest && (
                                        <View style={styles.bestBadge}>
                                            <Ionicons name="star" size={14} color="white" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.paymentBtn} onPress={() => setShowUpgradeModal(false)}>
                                <LinearGradient colors={['#3b82f6', '#2dd4bf']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.paymentGradient}>
                                    <Text style={styles.paymentBtnText}>Make Payment</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <Text style={styles.modalFooterNote}>You can cancel the subscription anytime</Text>
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
    profileHeader: { alignItems: 'center', marginVertical: 20 },
    avatarGradient: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: Colors.light.primary, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
    avatarText: { color: 'white', fontFamily: 'Inter_700Bold', fontSize: 24 },
    userName: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#111' },
    userEmail: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#888', marginTop: 2 },
    editProfileButton: { marginTop: 10, paddingVertical: 5, paddingHorizontal: 12, borderRadius: 20, backgroundColor: 'rgba(0, 88, 188, 0.05)' },
    editProfileText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: Colors.light.primary },
    
    currentPlanSection: { marginBottom: 32, marginTop: 10 },
    currentPlanCard: { borderRadius: 24, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    planInfo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    planIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    planBadge: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
    currentPlanName: { color: 'white', fontFamily: 'Inter_700Bold', fontSize: 20 },
    upgradeBtn: { backgroundColor: 'white', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 6, elevation: 5 },
    upgradeBtnText: { color: Colors.light.primary, fontFamily: 'Inter_700Bold', fontSize: 12 },
    
    section: { marginBottom: 24 },
    sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#111', marginBottom: 12, marginLeft: 4 },
    card: { backgroundColor: 'white', borderRadius: 24, padding: 8, elevation: 1 },
    settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
    settingIconContainer: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#f5f7fa', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    settingLabel: { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#333' },
    settingValue: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#aaa', marginRight: 8 },
    
    // UPGRADE MODAL - DARK THEME
    modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000 },
    flexOne: { flex: 1 },
    darkSheet: { backgroundColor: '#131317', borderTopLeftRadius: 36, borderTopRightRadius: 36, height: SCREEN_HEIGHT * 0.85, paddingBottom: 40 },
    darkSheetHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 24, paddingBottom: 10 },
    closeModalBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    moreOptionsBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    modalTitle: { color: 'white', fontFamily: 'Inter_700Bold', fontSize: 32, paddingHorizontal: 30 },
    modalSubtitle: { color: '#888', fontFamily: 'Inter_400Regular', fontSize: 16, paddingHorizontal: 30, marginTop: 4, marginBottom: 30 },
    planScroll: { flex: 1, paddingHorizontal: 24 },
    planOptionCard: { backgroundColor: '#1e1e24', borderRadius: 24, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
    planOptionCardActive: { borderColor: Colors.light.primary, backgroundColor: '#1c1c2b' },
    optionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    radioRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#555', justifyContent: 'center', alignItems: 'center' },
    radioOuterActive: { borderColor: Colors.light.primary },
    radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.light.primary },
    optionName: { color: 'white', fontFamily: 'Inter_700Bold', fontSize: 18 },
    optionSubtitle: { color: '#888', fontSize: 12, marginTop: 2 },
    optionPrice: { color: 'white', fontFamily: 'Inter_700Bold', fontSize: 16 },
    featuresBox: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#333', gap: 12 },
    featureLine: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    bullet: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#888' },
    featureLineText: { color: '#ddd', fontSize: 13, fontFamily: 'Inter_400Regular' },
    bestBadge: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, backgroundColor: Colors.light.primary, borderBottomLeftRadius: 40, alignItems: 'flex-end', padding: 8 },
    modalFooter: { padding: 30, gap: 16 },
    paymentBtn: { width: '100%', height: 64, borderRadius: 32, overflow: 'hidden' },
    paymentGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    paymentBtnText: { color: 'white', fontFamily: 'Inter_700Bold', fontSize: 18 },
    modalFooterNote: { color: '#888', textAlign: 'center', fontSize: 12 },
    
    tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 75, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    tabItem: { alignItems: 'center' },
    tabLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 4, color: '#aaa' },
    activeTabLabel: { fontFamily: 'Inter_700Bold', color: Colors.light.primary },
});
