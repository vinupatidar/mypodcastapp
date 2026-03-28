import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { supabase } from '../services/supabase';
import { ActivityIndicator, Alert } from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [currentPlan, setCurrentPlan] = useState('Free Explorer');
    const [plans, setPlans] = useState<any[]>([]);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedUpgrade, setSelectedUpgrade] = useState('');
    const [remainingCredits, setRemainingCredits] = useState(0);

    const [loadingPlans, setLoadingPlans] = useState(true);

    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // 1. Get Session Immediately (Fast Cache)
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;
            
            setUser(session.user);

            // 2. Parallelize all expensive fetches
            const [profileRes, subRes, plansRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', session.user.id).single(),
                supabase.from('user_subscriptions').select('*, subscription_plans(*)').eq('user_id', session.user.id).eq('status', 'active').maybeSingle(),
                supabase.from('subscription_plans').select('*').order('price', { ascending: true })
            ]);

            if (profileRes.data) setProfile(profileRes.data);
            if (subRes.data?.subscription_plans) {
                setCurrentPlan(subRes.data.subscription_plans.name);
                setRemainingCredits(subRes.data.remaining_credits || 0);
            }
            if (plansRes.data) {
                setPlans(plansRes.data);
                if (plansRes.data.length > 0) setSelectedUpgrade(plansRes.data[0].id);
            }
        } catch (e) {
            console.error('Fetch Profile Data Error:', e);
        } finally {
            setLoading(false);
            setLoadingPlans(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.replace('/auth');
    };

    const handleDeleteAccount = async () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (user) {
                            await supabase.from('profiles').delete().eq('id', user.id);
                            await supabase.auth.signOut();
                            router.replace('/auth');
                        }
                    }
                }
            ]
        );
    };

    const handleUpgrade = async () => {
        if (!user || !selectedUpgrade) return;
        
        setLoading(true);
        try {
            const selectedPlanData = plans.find(p => p.id === selectedUpgrade);
            const planCredits = selectedPlanData?.credits || 0;

            const { error } = await supabase
                .from('user_subscriptions')
                .upsert({ 
                    user_id: user.id, 
                    plan_id: selectedUpgrade, 
                    status: 'active',
                    start_date: new Date().toISOString(),
                    remaining_credits: planCredits
                }, { onConflict: 'user_id' });

            if (error) throw error;
            
            const planName = plans.find(p => p.id === selectedUpgrade)?.name || 'Basic';
            setCurrentPlan(planName);
            setShowUpgradeModal(false);
            Alert.alert("Success", `Upgraded to ${planName} plan!`);
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.onSurface} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity 
                    style={styles.creditBadge}
                    onPress={() => Alert.alert('Credits', `You have ${remainingCredits} credits remaining. Want more? Upgrade your plan below.`)}
                >
                    <Ionicons name="star" size={14} color="#fbbf24" style={{ marginRight: 4 }} />
                    <Text style={styles.creditText}>Credits: {remainingCredits}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={styles.profileHeader}>
                    <LinearGradient
                        colors={Colors.light.signatureGradient}
                        style={styles.avatarGradient}
                    >
                        <Text style={styles.avatarText}>{(user?.user_metadata?.full_name || profile?.full_name || 'U').split(' ').map((n: string) => n[0]).join('')}</Text>
                    </LinearGradient>
                    <Text style={styles.userName}>{user?.user_metadata?.full_name || profile?.full_name || ''}</Text>
                    <Text style={styles.userEmail}>{user?.email || 'N/A'}</Text>
                    
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
                        {loading ? (
                            <View style={{ flex: 1, height: 60, justifyContent: 'center' }}>
                                <ActivityIndicator color="white" />
                            </View>
                        ) : (
                            <>
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
                            </>
                        )}
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
                        <SettingItem icon="log-out" label="Sign Out" danger onPress={handleSignOut} />
                        <SettingItem icon="trash" label="Delete My Account" danger onPress={handleDeleteAccount} />
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* UPGRADE MODAL - MATCHED TO PAYWALL DESIGN */}
            {showUpgradeModal && (
                <View style={[styles.modalOverlay, { backgroundColor: '#103E5B' }]}>
                    <SafeAreaView style={{ flex: 1 }}>
                        <View style={styles.paywallHeader}>
                            <View style={styles.paywallTopGreetings}>
                                <Text style={styles.paywallGreeting}>Hello, Vinu Patidar</Text>
                                <TouchableOpacity onPress={() => setShowUpgradeModal(false)} style={styles.paywallBackBtnSmall}>
                                    <Ionicons name="close" size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.paywallUserSection}>
                                <Text style={styles.paywallTitle}>CHOOSE YOUR PLAN</Text>
                            </View>
                        </View>

                        <View style={styles.paywallContentCard}>
                            <ScrollView style={styles.paywallScroll} showsVerticalScrollIndicator={false}>
                                {plans.map((plan) => (
                                    <TouchableOpacity 
                                        key={plan.id}
                                        style={[styles.paywallPlanItem, selectedUpgrade === plan.id && styles.paywallPlanItemActive]}
                                        activeOpacity={0.8}
                                        onPress={() => setSelectedUpgrade(plan.id)}
                                    >
                                        <LinearGradient
                                            colors={plan.gradient as any}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.paywallIconBox}
                                        >
                                            <Ionicons name={plan.icon as any} size={28} color="white" />
                                        </LinearGradient>
                                        
                                        <View style={styles.paywallPlanInfo}>
                                            <Text style={styles.paywallPlanName}>{plan.name}</Text>
                                            {plan.features?.slice(0, 2).map((f: string, i: number) => (
                                                <Text key={i} style={styles.paywallPlanFeature}>{f}</Text>
                                            ))}
                                            <Text style={[styles.paywallChooseLink, { color: selectedUpgrade === plan.id ? '#3b82f6' : '#888' }]}>
                                                {selectedUpgrade === plan.id ? 'Selected ✓' : 'Choose Plan >'}
                                            </Text>
                                        </View>

                                        <View style={styles.paywallPriceBox}>
                                            <Text style={styles.paywallPriceValue}>${plan.price}</Text>
                                            <Text style={styles.paywallPricePeriod}>{plan.period}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}

                                <TouchableOpacity 
                                    style={styles.paywallUpgradeBtn} 
                                    onPress={handleUpgrade}
                                >
                                    <LinearGradient colors={['#3b82f6', '#2dd4bf']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.paywallUpgradeGradient}>
                                        <Text style={styles.paywallUpgradeText}>Make Payment</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                                
                                <Text style={styles.paywallFooterNote}>You can cancel the subscription anytime</Text>
                                <View style={{ height: 40 }} />
                            </ScrollView>
                        </View>
                    </SafeAreaView>
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

function SettingItem({ icon, label, value, danger, onPress }: any) {
    return (
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
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
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 24, 
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: '#faf9fe'
    },
    backButton: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: Colors.light.onSurface },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
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
    
    // PAYWALL-STYLED UPGRADE MODAL
    modalOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 2000 },
    paywallHeader: { height: SCREEN_HEIGHT * 0.28, paddingHorizontal: 20, paddingTop: 20, justifyContent: 'space-between', paddingBottom: 60 },
    paywallTopGreetings: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    paywallBackBtnSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    paywallUserSection: { alignItems: 'center' },
    paywallGreeting: { color: 'rgba(255,255,255,0.9)', fontSize: 18, fontFamily: 'Inter_700Bold' },
    paywallTitle: { color: 'white', fontSize: 22, fontFamily: 'Inter_700Bold' },
    
    paywallContentCard: { flex: 1, backgroundColor: 'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 20, marginTop: -40 },
    paywallScroll: { paddingTop: 24 },
    paywallPlanItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: 'white', 
        borderRadius: 24, 
        padding: 16, 
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
        borderWidth: 2,
        borderColor: 'transparent'
    },
    paywallPlanItemActive: { borderColor: '#3b82f6', backgroundColor: '#f0f9ff' },
    paywallIconBox: { width: 70, height: 120, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    paywallPlanInfo: { flex: 1, paddingHorizontal: 16 },
    paywallPlanName: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#111', marginBottom: 8 },
    paywallPlanFeature: { fontSize: 12, color: '#888', marginBottom: 4, fontFamily: 'Inter_400Regular' },
    paywallChooseLink: { fontSize: 12, marginTop: 8, fontFamily: 'Inter_700Bold', alignSelf: 'flex-end' },
    paywallPriceBox: { alignItems: 'flex-end' },
    paywallPriceValue: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#111' },
    paywallPricePeriod: { fontSize: 12, color: '#888' },
    
    paywallUpgradeBtn: { width: '100%', height: 64, borderRadius: 32, overflow: 'hidden', marginTop: 10, marginBottom: 15 },
    paywallUpgradeGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    paywallUpgradeText: { color: 'white', fontFamily: 'Inter_700Bold', fontSize: 18 },
    paywallFooterNote: { color: '#888', textAlign: 'center', fontSize: 12, marginBottom: 20 },
    
    tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 75, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    tabItem: { alignItems: 'center' },
    tabLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 4, color: '#aaa' },
    activeTabLabel: { fontFamily: 'Inter_700Bold', color: Colors.light.primary },
    creditBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: 'white', 
        paddingHorizontal: 10, 
        paddingVertical: 5, 
        borderRadius: 12, 
        shadowColor: '#fbbf24', 
        shadowOpacity: 0.1, 
        shadowRadius: 8, 
        elevation: 2, 
        borderWidth: 1, 
        borderColor: 'rgba(251, 191, 36, 0.2)' 
    },
    creditText: { 
        fontFamily: 'Inter_700Bold', 
        fontSize: 12, 
        color: Colors.light.onSurface 
    },
});
