import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../services/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BuyCreditsScreen() {
    const [packs, setPacks] = useState<any[]>([]);
    const [loadingPacks, setLoadingPacks] = useState(true);
    const [loadingPack, setLoadingPack] = useState<string | null>(null);

    useEffect(() => {
        fetchPacks();
    }, []);

    const fetchPacks = async () => {
        try {
            const { data, error } = await supabase
                .from('credit_packs')
                .select('*')
                .order('credits', { ascending: true });
            
            if (error) throw error;
            if (data) setPacks(data);
        } catch (error) {
            console.error('Fetch Packs Error:', error);
        } finally {
            setLoadingPacks(false);
        }
    };

    const handlePurchase = async (pack: any) => {
        setLoadingPack(pack.id);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            Alert.alert('Error', 'Please log in to continue');
            setLoadingPack(null);
            return;
        }

        try {
            // Priority: Native In-App Purchase
            if (pack.iap_sku) {
                const { IAPService } = require('../services/iap_service');
                await IAPService.requestPurchase(pack.iap_sku, false);
                setLoadingPack(null);
                return;
            }

            // Fallback: Mocking payment success (for development)
            console.log(`📡 Processing mock purchase for ${pack.name}...`);
            
            // 1. Fetch current credits
            const { data: sub } = await supabase
                .from('user_subscriptions')
                .select('remaining_credits')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .maybeSingle();
            
            if (!sub) {
                Alert.alert('Error', 'No active subscription account found. Please subscribe to a plan first.');
                setLoadingPack(null);
                return;
            }

            // 2. Add credits to current balance
            const newTotal = (sub.remaining_credits || 0) + pack.credits;
            const { error: finalUpdateErr } = await supabase
                .from('user_subscriptions')
                .update({ remaining_credits: newTotal })
                .eq('user_id', user.id)
                .eq('status', 'active');

            if (finalUpdateErr) throw finalUpdateErr;

            Alert.alert(
                'Success!', 
                `Successfully added ${pack.credits} credits to your account. Your new balance is ${newTotal}.`,
                [{ text: 'Awesome', onPress: () => router.back() }]
            );
        } catch (error: any) {
            console.error('Purchase Error:', error);
            Alert.alert('Purchase Failed', error.message || 'Unknown error');
        } finally {
            setLoadingPack(null);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.onSurface} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Buy Credits</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.heroSection}>
                    <View style={styles.starCircle}>
                        <Ionicons name="star" size={40} color="#fbbf24" />
                    </View>
                    <Text style={styles.heroTitle}>Need More Generations?</Text>
                    <Text style={styles.heroSubtitle}>Choose a credit pack that fits your needs.</Text>
                    <View style={styles.disclaimerBox}>
                        <Ionicons name="alert-circle" size={16} color="#ef4444" style={{ marginRight: 8 }} />
                        <Text style={styles.disclaimerText}>Important: Purchased credits are valid until your current subscription expires and will NOT be forwarded to the next month.</Text>
                    </View>
                </View>

                <View style={styles.packsContainer}>
                    {loadingPacks ? (
                        <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 40 }} />
                    ) : (
                        packs.map((pack) => (
                        <TouchableOpacity 
                            key={pack.id} 
                            style={[styles.packCard, pack.isPopular && styles.popularCard]}
                            onPress={() => handlePurchase(pack)}
                            disabled={loadingPack !== null}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={pack.gradient}
                                style={styles.packGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.packHeader}>
                                    <View style={styles.packIconContainer}>
                                        <Ionicons name={pack.icon as any} size={24} color="white" />
                                    </View>
                                    {pack.isPopular && (
                                        <View style={styles.popularBadge}>
                                            <Text style={styles.popularText}>BEST VALUE</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.packBody}>
                                    <Text style={styles.packName}>{pack.name}</Text>
                                    <Text style={styles.packCredits}>{pack.credits} Credits</Text>
                                    <Text style={styles.packDesc}>{pack.description}</Text>
                                </View>

                                <View style={styles.packFooter}>
                                    <View style={styles.priceContainer}>
                                        <Text style={styles.packPrice}>{pack.price}</Text>
                                    </View>
                                    <View style={styles.buyButton}>
                                        {loadingPack === pack.id ? (
                                            <ActivityIndicator size="small" color="#333" />
                                        ) : (
                                            <Text style={styles.buyButtonText}>Buy Now</Text>
                                        )}
                                    </View>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                        ))
                    )}
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color={Colors.light.onSurfaceVariant} />
                    <Text style={styles.infoText}>Purchased credits are added immediately to your current balance.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#faf9fe' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    backButton: { padding: 8 },
    headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.light.onSurface },
    scrollContent: { paddingBottom: 40 },
    heroSection: { alignItems: 'center', paddingHorizontal: 32, marginTop: 20, marginBottom: 30 },
    starCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', shadowColor: '#fbbf24', shadowOpacity: 0.2, shadowRadius: 15, elevation: 5, marginBottom: 20 },
    heroTitle: { fontFamily: 'Inter_700Bold', fontSize: 24, color: Colors.light.onSurface, textAlign: 'center', marginBottom: 12 },
    heroSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.light.onSurfaceVariant, textAlign: 'center', lineHeight: 22 },
    disclaimerBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.08)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, marginTop: 16 },
    disclaimerText: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 11, color: '#ef4444', lineHeight: 16 },
    packsContainer: { paddingHorizontal: 20, gap: 20 },
    packCard: { borderRadius: 24, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    popularCard: { transform: [{ scale: 1.02 }], borderWidth: 2, borderColor: '#fbbf24' },
    packGradient: { padding: 24 },
    packHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    packIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    popularBadge: { backgroundColor: '#fbbf24', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    popularText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#92400e' },
    packBody: { marginBottom: 24 },
    packName: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
    packCredits: { fontFamily: 'Inter_700Bold', fontSize: 32, color: 'white', marginBottom: 8 },
    packDesc: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 18 },
    packFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    priceContainer: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    packPrice: { fontFamily: 'Inter_700Bold', fontSize: 20, color: 'white' },
    buyButton: { backgroundColor: 'white', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, minWidth: 100, alignItems: 'center' },
    buyButtonText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#333' },
    infoBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(0,0,0,0.03)', margin: 24, padding: 16, borderRadius: 16 },
    infoText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.light.onSurfaceVariant, lineHeight: 18 },
}); 
