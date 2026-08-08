import { useTheme } from "@context/ThemeContext";
import React, { useState, useEffect } from "react";
import { Colors } from "../../constants/colors";
import { RefreshControl, StyleSheet, View, useWindowDimensions, Image } from "react-native";
import { CurvedArrow } from "../../components/dashboard";
import { FontAwesome5 } from "@expo/vector-icons";
import { SvgXml } from "react-native-svg";
import { doctorSvg } from "../../constants/avatars";
import { router } from "expo-router";
import { Snackbar } from "react-native-snackbar";
import { useCurrentPatient } from "@context/PatientContext";
import { useShares } from "../../hooks/useShares";
import { useNetwork } from "../../context/NetworkContext";
import { useDeviceOnlySetting } from "../../hooks/useDeviceOnlySetting";
// import { DeviceOnlyBanner } from "../../components/common/DeviceOnlyBanner";
import { Spacer, ThemedText, ThemedView } from "../../components";
import { ScalePressable } from "../../components/ScalePressable";
import { QRCodeButton } from "../../components/share/QRCodeButton";

export function CountdownTimer({ expiresAt, style }: { expiresAt: string | Date, style?: any }) {
    const calculateTimeLeft = () => {
        const difference = new Date(expiresAt).getTime() - new Date().getTime();
        if (difference <= 0) return 'Expired';
        const days = Math.floor((difference / (1000 * 60 * 60 * 24)));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        return `${days}D ${hours}H ${minutes}M`;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 10000);
        return () => clearInterval(timer);
    }, [expiresAt]);

    return <ThemedText style={style}>{timeLeft}</ThemedText>;
}

export default function Share() {
    const { theme, mode } = useTheme();
    const { currentPatient } = useCurrentPatient();
    const { isOnline } = useNetwork();
    const { isDeviceOnly } = useDeviceOnlySetting(currentPatient?.id);
    const { height: windowHeight } = useWindowDimensions();

    const styles = StylesFunc(theme);

    const { shares: currentAccessGrants, isSyncing, refresh } = useShares(currentPatient?.id);

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
    };

    const activeGrants = currentAccessGrants.filter(
        (item) => item.expires_at && new Date(item.expires_at).getTime() - new Date().getTime() > 0
    );

    return (
        <ThemedView
            safe
            scroll
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing || isSyncing}
                    onRefresh={onRefresh}
                    colors={[theme.primary]}
                    tintColor={theme.primary}
                    progressBackgroundColor={theme.backgroundLight}
                />
            }
        >
            {/* <DeviceOnlyBanner isDeviceOnly={isDeviceOnly} /> */}
            <View style={{ flex: 1, paddingHorizontal: 20 }}>

                {(!isOnline || isDeviceOnly) && (
                    <View style={{ height: windowHeight * 0.7, justifyContent: 'center', alignItems: 'center' }}>
                        <Spacer height={180} />
                        <FontAwesome5 name={isDeviceOnly ? 'mobile-alt' : 'wifi'} color={theme.textGray} size={24} />
                        <ThemedText type={'h3'} style={{ textAlign: 'center', paddingTop: 15 }}>
                            {isDeviceOnly ? "Sharing isn't available in Device Only mode" : "Sharing isn't available offline"}
                        </ThemedText>
                        <ThemedText style={{ fontSize: 14, color: theme.textGray, paddingHorizontal: 30, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
                            {isDeviceOnly
                                ? 'Turn off Device Only mode in Settings to view and manage your shared records.'
                                : 'Reconnect to the internet to view and manage your shared records.'}
                        </ThemedText>
                    </View>
                )}

                {isOnline && !isDeviceOnly}

                {isOnline && !isDeviceOnly && (<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <ThemedText type={'h1'} style={styles.title}>
                            Shared Records
                        </ThemedText>

                        <ThemedText style={{ color: theme.textGray, marginBottom: 24, marginTop: -5, fontSize: 14, lineHeight: 20 }}>
                            Here are your shared health records.
                        </ThemedText>
                    </View>
                    {isOnline && <QRCodeButton />}
                </View>)}

                {isOnline && !isDeviceOnly && activeGrants.length === 0 && (
                    <View style={{ height: windowHeight * 0.55, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            <Image
                                source={
                                    mode === 'dark'
                                        ? require('../../../assets/dark/share_01.png')
                                        : require('../../../assets/light/share_01.png')
                                }
                                style={{ width: '75%', height: 180, resizeMode: 'contain', marginBottom: 15 }}
                            />
                            <ThemedText type={'h3'} style={{ paddingHorizontal: 30, textAlign: 'center' }}>
                                {'Share your first report!'}
                            </ThemedText>

                            <CurvedArrow />
                        </View>
                    </View>
                )}

                {isOnline && !isDeviceOnly && activeGrants.map((item) => (
                    <ScalePressable
                        key={item.id}
                        style={styles.accessView}
                        onPress={() => router.navigate({ pathname: 'share/SharedDetail', params: { data: JSON.stringify(item) } })}
                    >
                        <View style={styles.accessDoctorInfoRow}>
                            <View style={[styles.doctorIconContainer, !item.doctor && { backgroundColor: theme.card }]}>
                                {item.doctor ? (
                                    <SvgXml xml={doctorSvg} />
                                ) : (
                                    <FontAwesome5 name="globe" color={theme.primary} size={27} />
                                )}
                            </View>
                            <View style={{ flex: 1, paddingRight: 20 }}>
                                <ThemedText type={'h3'} numberOfLines={1} ellipsizeMode="tail">
                                    {item.doctor ? item.doctor.name : 'Anyone With Access'}
                                </ThemedText>
                                {item.doctor && (item.doctor.specialization || item.doctor.associated_hospital) &&
                                    <ThemedText style={styles.doctorInfo} numberOfLines={1} ellipsizeMode="tail">
                                        {item.doctor.specialization && `${item.doctor.specialization} • `}{item.doctor.associated_hospital}
                                    </ThemedText>
                                }
                                <View style={styles.timeRow}>
                                    <FontAwesome5 name="hourglass-half" color={theme.primary} size={11} />
                                    {item.expires_at && new Date(item.expires_at).getFullYear() - new Date().getFullYear() > 50 ?
                                        <ThemedText style={styles.timeLeft}>Unlimited Access</ThemedText> :
                                        item.expires_at ? <CountdownTimer expiresAt={item.expires_at} style={styles.timeLeft} /> : null
                                    }
                                </View>
                            </View>
                        </View>
                    </ScalePressable>
                ))}
                <Spacer height={180} />
            </View>
        </ThemedView>
    );
}

const StylesFunc = (theme: typeof Colors.dark) => StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 0
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        paddingTop: 20,
        paddingBottom: 10,
    },
    accessView: {
        backgroundColor: theme.backgroundLight,
        marginBottom: 10,
        padding: 24,
        borderRadius: 30,
        elevation: 1
    },
    doctorIconContainer: {
        backgroundColor: '#73B8BA',
        borderRadius: 16,
        height: 55,
        width: 55,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    doctorInfo: {
        fontSize: 12.5,
        color: theme.textLight,
        fontFamily: 'PublicSans_300Light',
        overflow: 'hidden',
    },
    accessDoctorInfoRow: {
        flexDirection: 'row',
        gap: 15
    },
    timeRow: {
        flexDirection: 'row',
        marginTop: 5,
        alignItems: 'center',
        gap: 7,
    },
    timeLeft: {
        fontSize: 11,
        color: theme.primary,
        fontFamily: 'Lexend_700Bold',
        marginTop: -2
    },
    revokeButtonContainer: {
        flexDirection: 'row',
        backgroundColor: '#BA1A1A',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        marginTop: 15,
        gap: 7
    },
});
