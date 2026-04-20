import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Leaf, CalendarDays, Package, Settings } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const COLORS = {
  bg: '#0B1F1A',
  card: '#122B25',
  accent: '#4FAF7A',
  muted: '#6B7C76',
  text: '#FFFFFF',
};

function TabIcon({ Icon, color, focused }: { Icon: typeof Leaf; color: string; focused: boolean }) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  React.useEffect(() => {
    // Slight scale animation (1.05x as requested)
    scale.value = withSpring(focused ? 1.05 : 1, { damping: 15, stiffness: 180 });
    // Soft glow animation
    glowOpacity.value = withTiming(focused ? 1 : 0, { duration: 200 });
  }, [focused, scale, glowOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.iconContainer}>
      {/* Soft glow layer */}
      <Animated.View
        style={[
          styles.glowLayer,
          glowStyle,
          {
            shadowColor: COLORS.accent,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 12,
          },
        ]}
      />
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <Animated.View style={animatedStyle}>
          {/* Reduced icon weight: 1.5 active, 1.2 inactive */}
          <Icon size={22} color={color} strokeWidth={focused ? 1.5 : 1.2} />
        </Animated.View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: COLORS.bg },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        headerShadowVisible: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          height: Platform.OS === 'ios' ? 88 : 68,
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={Platform.OS === 'ios' ? 80 : 100}
            tint="dark"
            style={styles.blurBackground}
          />
        ),
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
      }}
      screenListeners={{
        tabPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Lawn',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={Leaf} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={CalendarDays} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={Package} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={Settings} color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.bg + 'CC', // Semi-transparent overlay
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowLayer: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent + '20',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: COLORS.accent + '18',
  },
});
