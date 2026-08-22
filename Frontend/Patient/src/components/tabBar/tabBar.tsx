import { useTheme } from "@context/ThemeContext";
import { MaterialIcons, Octicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View, Text, StyleSheet, Dimensions } from "react-native"
import { ScalePressable } from "src/components/ScalePressable";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const TAB_WIDTH = width / 3;

function CustomTabBar({ state, descriptors, navigation, theme }: BottomTabBarProps & { theme: any }) {
    const insets = useSafeAreaInsets();

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: withSpring((state.index - 1) * TAB_WIDTH, { duration: 100 }) }]
        };
    });

    return (
        <View style={[styles.tabBar, { backgroundColor: theme.backgroundDark, marginBottom: insets.bottom + 10 }]}>
            {/* The Animated Sliding Pill Background */}
            <Animated.View style={[styles.pillContainer, animatedStyle]}>
                <View style={[styles.pill, { backgroundColor: theme.primarySoft }]} />
            </Animated.View>

            {/* The Tab Buttons */}
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                // Determine active colors
                const color = isFocused ? theme.primary : theme.textLight;
                const Icon = options.tabBarIcon;
                const label = options.title !== undefined ? options.title : route.name;

                return (
                    <ScalePressable
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        onPress={onPress}
                        style={styles.tabItem}
                    >
                        {Icon && Icon({ focused: isFocused, color, size: 24 })}
                        <Text style={[styles.tabLabel, { color }]}>
                            {label as string}
                        </Text>
                    </ScalePressable>
                );
            })}
        </View>
    );
}

export default function TabBar() {
    const { theme } = useTheme();

    return (
        <Tabs
            initialRouteName="Dashboard"
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'relative',
                    backgroundColor: theme.backgroundLight,
                    borderTopWidth: 0,
                    borderTopRightRadius: 10,
                    borderTopLeftRadius: 10,
                }
            }}
            tabBar={(props) => <CustomTabBar {...props} theme={theme} />}
            detachInactiveScreens={false}
        >
            <Tabs.Screen name="Dashboard" options={{
                title: 'Home',
                tabBarIcon: ({ color }) => <Octicons name="home-fill" size={20} color={color} style={{ marginBottom: 0 }} />,
            }} />
            <Tabs.Screen name="Scan" options={{
                title: 'Scan',
                tabBarIcon: ({ color }) => <MaterialIcons name="document-scanner" size={20} color={color} />,
            }} />
            <Tabs.Screen name="Share" options={{
                title: 'Share',
                tabBarIcon: ({ color }) => <Octicons name="share" size={20} color={color} />,
            }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        paddingTop: 9,
        flexDirection: 'row',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    pillContainer: {
        marginTop: 9,
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: TAB_WIDTH - 15,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
    },
    pill: {
        width: '65%', // How much of the tab the pill takes up
        height: '100%',
        borderRadius: 16,
    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        zIndex: 1,
        height: 45,
        marginTop: 2,
        marginBottom: 2,
    },
    tabLabel: {
        margin: -5,
        fontSize: 12,
        fontFamily: 'Lexend_800ExtraBold',
    }
});