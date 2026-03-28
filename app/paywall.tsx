import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Platform, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { supabase } from '../services/supabase';
import { ActivityIndicator, Alert } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PaywallScreen() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [fullName, setFullName] = useState('User');

    React.useEffect(() => {
        const initialize = async () => {
            await Promise.all([fetchPlans(), fetchUser()]);
            setLoading(false);
        };
        initialize();
    }, []);

    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
            if (data?.full_name) setFullName(data.full_name);
        }
    };

    const fetchPlans = async () => {
        try {
            const { data } = await supabase.from('subscription_plans').select('*').order('price', { ascending: true });
            if (data) setPlans(data);
        } catch (e) {
            console.error('Fetch Plans Error:', e);
        }
    };

    const handleSubscribe = async (planId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            Alert.alert('Error', 'Please log in again');
            return;
        }

        try {
            const { error } = await supabase
                .from('user_subscriptions')
                .upsert({ 
                    user_id: user.id, 
                    plan_id: planId, 
                    status: 'active',
                    start_date: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (error) throw error;
            router.replace('/');
        } catch (error: any) {
            Alert.alert('Subscription Error', error.message);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.replace('/auth');
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            <View style={styles.headerBackground}>
                <SafeAreaView>
                        <View style={styles.topGreetingContainer}>
                            <Text style={styles.greetingText}>Hello, {fullName}</Text>
                        </View>
                        <View style={styles.headerCenteredContent}>
                            <Text style={styles.choosePlanTitle}>CHOOSE YOUR PLAN</Text>
                        </View>
                </SafeAreaView>
            </View>

            <View style={styles.contentCard}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.plansList}>
                    {plans.map((plan) => (
                        <TouchableOpacity 
                            key={plan.id} 
                            style={styles.planItem} 
                            activeOpacity={0.9}
                            onPress={() => handleSubscribe(plan.id)}
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
                                {plan.features && plan.features.map((f: string, i: number) => (
                                    <Text key={i} style={styles.planFeatureText}>{f}</Text>
                                ))}
                                <Text style={styles.choosePlanLink}>Choose Plan {'>'}</Text>
                            </View>

                            <View style={styles.priceContainer}>
                                <Text style={styles.priceValue}>${plan.price}</Text>
                                <Text style={styles.periodLabel}>{plan.period}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity style={styles.signoutBtn} onPress={handleSignOut}>
                        <Ionicons name="log-out-outline" size={20} color="#FF6347" />
                        <Text style={styles.signoutText}>Sign Out</Text>
                    </TouchableOpacity>
                    
                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#103E5B' },
    headerBackground: { height: SCREEN_HEIGHT * 0.28, backgroundColor: '#103E5B' },
    topGreetingContainer: { paddingHorizontal: 30, paddingTop: 20 },
    headerCenteredContent: { alignItems: 'center', justifyContent: 'center', marginTop: 15 },
    greetingText: { color: 'rgba(255,255,255,0.9)', fontSize: 18, fontFamily: 'Inter_700Bold' },
    choosePlanTitle: { color: 'white', fontSize: 22, fontFamily: 'Inter_700Bold' },
    
    contentCard: { flex: 1, backgroundColor: 'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 20, marginTop: -40 },
    plansList: { paddingTop: 15 },
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
