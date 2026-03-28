import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Platform, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PAYWALL_PLANS = [
    {
        id: 'basic',
        name: 'Basic',
        price: '$20',
        period: '/Mon',
        icon: 'bicycle-outline',
        gradient: ['#4ade80', '#2dd4bf'],
        features: ['5 AI Podcast Generations', '30 Days Library History']
    },
    {
        id: 'premium',
        name: 'Premium',
        price: '$40',
        period: '/Mon',
        icon: 'car-outline',
        gradient: ['#fbbf24', '#f59e0b'],
        features: ['20 AI Podcast Generations', 'Full Library History Access']
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: '$100',
        period: '/Mon',
        icon: 'rocket-outline',
        gradient: ['#f87171', '#ef4444'],
        features: ['Unlimited Podcast Generations', 'Dedicated Support', 'Custom Voice ID']
    }
];

export default function PaywallScreen() {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Header with Background Color matched to Image */}
            <View style={styles.headerBackground}>
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <TouchableOpacity style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        
                        <View style={styles.userContainer}>
                            <View style={styles.profileImageContainer}>
                                <Image 
                                    source="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" 
                                    style={styles.profileImage}
                                />
                            </View>
                            <Text style={styles.greetingText}>Hello, Vinu Patidar</Text>
                            <Text style={styles.choosePlanTitle}>CHOOSE YOUR PLAN</Text>
                        </View>

                        <TouchableOpacity style={styles.notificationBtn}>
                            <Ionicons name="notifications" size={24} color="white" />
                            <View style={styles.notifBadge} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>

            {/* Content Card */}
            <View style={styles.contentCard}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.plansList}>
                    {PAYWALL_PLANS.map((plan) => (
                        <TouchableOpacity 
                            key={plan.id} 
                            style={styles.planItem} 
                            activeOpacity={0.9}
                            onPress={() => router.replace('/')} // Simulate subscription success
                        >
                            <LinearGradient
                                colors={plan.gradient as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.planIconBox}
                            >
                                <Ionicons name={plan.icon as any} size={28} color="white" />
                            </LinearGradient>
                            
                            <View style={styles.planInfo}>
                                <Text style={styles.planItemName}>{plan.name}</Text>
                                <Text style={styles.planFeatureText}>{plan.features[0]}</Text>
                                <Text style={styles.planFeatureText}>{plan.features[1]}</Text>
                                <Text style={styles.choosePlanLink}>Choose Plan {'>'}</Text>
                            </View>

                            <View style={styles.priceContainer}>
                                <Text style={styles.priceValue}>{plan.price}</Text>
                                <Text style={styles.periodLabel}>{plan.period}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity style={styles.termsLink}>
                        <Text style={styles.termsText}>* Terms and Conditions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.signoutBtn} onPress={() => console.log('Sign Out')}>
                        <Ionicons name="log-out-outline" size={20} color="#FF6347" />
                        <Text style={styles.signoutText}>Log Out from App</Text>
                    </TouchableOpacity>
                    
                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#103E5B' },
    headerBackground: { height: SCREEN_HEIGHT * 0.4, backgroundColor: '#103E5B' },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    notificationBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    notifBadge: { position: 'absolute', top: 5, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFD700', borderWidth: 1, borderColor: '#103E5B' },
    userContainer: { alignItems: 'center', marginTop: 10 },
    profileImageContainer: { width: 70, height: 70, borderRadius: 35, overflow: 'hidden', borderWidth: 3, borderColor: '#FF9494', marginBottom: 16 },
    profileImage: { width: '100%', height: '100%' },
    greetingText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontFamily: 'Inter_400Regular' },
    choosePlanTitle: { color: 'white', fontSize: 24, fontFamily: 'Inter_700Bold', marginTop: 8 },
    
    contentCard: { flex: 1, backgroundColor: 'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 20 },
    plansList: { paddingTop: 30 },
    planItem: { 
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
        elevation: 4
    },
    planIconBox: { width: 70, height: 120, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    planInfo: { flex: 1, paddingHorizontal: 16 },
    planItemName: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#111', marginBottom: 8 },
    planFeatureText: { fontSize: 12, color: '#888', marginBottom: 4, fontFamily: 'Inter_400Regular' },
    choosePlanLink: { color: '#888', fontSize: 12, marginTop: 8, fontFamily: 'Inter_400Regular', alignSelf: 'flex-end' },
    
    priceContainer: { alignItems: 'flex-end' },
    priceValue: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#111' },
    periodLabel: { fontSize: 12, color: '#888' },
    
    termsLink: { marginVertical: 10 },
    termsText: { color: '#888', fontSize: 12, textAlign: 'center' },
    
    signoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, padding: 16 },
    signoutText: { color: '#FF6347', fontFamily: 'Inter_700Bold', fontSize: 16, marginLeft: 8 },
});
