import React, { useEffect, useCallback } from 'react';
import { Text, View, ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Leaf, Thermometer, Wind, ChevronRight, CloudSun, CloudRain, Sun, Sparkles } from 'lucide-react-native';
import { api } from '@/lib/api/api';
import useLawnStore from '@/lib/state/lawn-store';
import { getDayName, getSeason, getWeatherIcon } from '@/lib/constants';
import type { SoilTemperatureData } from '@/lib/types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ============================================
// TEMPERATURE COLOR SYSTEM
// ============================================
const TEMP_COLORS = {
  cold: '#4C9AFF',      // Blue - below growth threshold
  optimal: '#4FAF7A',   // Green - optimal growth range
  warm: '#E8A854',      // Orange - stress zone
  hot: '#E85454',       // Red - danger
};

function getTempColor(temp: number): string {
  if (temp < 50) return TEMP_COLORS.cold;
  if (temp <= 70) return TEMP_COLORS.optimal;
  if (temp <= 85) return TEMP_COLORS.warm;
  return TEMP_COLORS.hot;
}

function getSoilStatus(temp: number): { label: string; color: string } {
  if (temp < 40) return { label: 'Too Cold for Seeding', color: TEMP_COLORS.cold };
  if (temp < 50) return { label: 'Pre-Germination Zone', color: TEMP_COLORS.cold };
  if (temp <= 55) return { label: 'Early Growth Zone', color: TEMP_COLORS.optimal };
  if (temp <= 70) return { label: 'Optimal Growth', color: TEMP_COLORS.optimal };
  if (temp <= 85) return { label: 'Heat Stress Zone', color: TEMP_COLORS.warm };
  return { label: 'Too Hot - Avoid Activity', color: TEMP_COLORS.hot };
}

function isOptimalRange(temp: number): boolean {
  return temp >= 50 && temp <= 70;
}

// ============================================
// DESIGN TOKENS
// ============================================
const COLORS = {
  bg: '#0B1F1A',
  card: '#122B25',
  cardElevated: '#183D34',
  accent: '#4FAF7A',
  primary: '#FFFFFF',
  secondary: '#A7B3AF',
  tertiary: '#6B7C76',
  border: 'rgba(255,255,255,0.04)',
};

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.35,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 8 },
  elevation: 12,
};

// ============================================
// TEMPERATURE RING COMPONENT
// ============================================
function TemperatureRing({ temp, isLoading }: { temp: number; isLoading: boolean }) {
  const color = getTempColor(temp);
  const status = getSoilStatus(temp);
  const isOptimal = isOptimalRange(temp);

  // Animation values
  const progress = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const pulseGlow = useSharedValue(0);
  const numberScale = useSharedValue(0.8);
  const numberOpacity = useSharedValue(0);

  // Ring dimensions (220-260px outer diameter)
  const size = 240;
  const strokeWidth = 5; // 4-6px ring thickness
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  // Map temperature to progress (30°F-100°F range → 0-1)
  const tempProgress = Math.min(Math.max((temp - 30) / 70, 0.05), 0.95);

  useEffect(() => {
    if (!isLoading && temp > 0) {
      // Reset animations
      progress.value = 0;
      glowOpacity.value = 0;
      numberScale.value = 0.8;
      numberOpacity.value = 0;

      // Animate ring: 0 → current value (800-1200ms, ease-out)
      progress.value = withTiming(tempProgress, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      });

      // Animate number appearance
      numberOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
      numberScale.value = withDelay(200, withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.2)) }));

      // Subtle glow on active arc
      glowOpacity.value = withDelay(
        600,
        withTiming(0.4, { duration: 400 })
      );

      // Pulsing glow when in optimal range
      if (isOptimal) {
        pulseGlow.value = withDelay(
          1200,
          withRepeat(
            withSequence(
              withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
              withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1, // infinite
            true
          )
        );
      } else {
        pulseGlow.value = withTiming(0, { duration: 300 });
      }
    }

    return () => {
      cancelAnimation(pulseGlow);
    };
  }, [isLoading, temp, tempProgress, isOptimal, progress, glowOpacity, pulseGlow, numberScale, numberOpacity]);

  // Animated ring stroke
  const animatedRingProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  // Container fade
  const containerStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isLoading ? 0.4 : 1, { duration: 300 }),
  }));

  // Glow layer style (only on active arc area)
  const glowStyle = useAnimatedStyle(() => ({
    opacity: isOptimal ? pulseGlow.value : glowOpacity.value,
  }));

  // Number animation
  const numberStyle = useAnimatedStyle(() => ({
    opacity: numberOpacity.value,
    transform: [{ scale: numberScale.value }],
  }));

  return (
    <Animated.View style={[styles.ringContainer, containerStyle]}>
      {/* Glow effect - subtle, behind the ring */}
      <Animated.View
        style={[
          styles.glowLayer,
          glowStyle,
          {
            width: size + 40,
            height: size + 40,
            borderRadius: (size + 40) / 2,
            backgroundColor: 'transparent',
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 40,
          },
        ]}
      />

      {/* SVG Ring */}
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <G transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {/* Background ring - very subtle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={COLORS.tertiary}
              strokeWidth={strokeWidth}
              strokeOpacity={0.15}
              fill="transparent"
            />

            {/* Active progress ring */}
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              animatedProps={animatedRingProps}
              strokeLinecap="round"
            />
          </G>
        </Svg>

        {/* Center content - HERO NUMBER */}
        <View style={styles.ringCenterContent}>
          <Animated.View style={numberStyle}>
            {/* Temperature - THE HERO */}
            <Text
              style={[
                styles.heroTemperature,
                {
                  color,
                  textShadowColor: color,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: isOptimal ? 15 : 8,
                },
              ]}
            >
              {Math.round(temp)}°
            </Text>

            {/* Depth label - subtle */}
            <Text style={styles.depthLabel}>6in depth</Text>
          </Animated.View>
        </View>
      </View>

      {/* Status label - below circle, centered, medium emphasis */}
      <Animated.View
        entering={FadeIn.delay(800).duration(400)}
        style={styles.statusLabelContainer}
      >
        <View style={[styles.statusBadge, { backgroundColor: status.color + '15' }]}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusLabel, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

// ============================================
// SUPPORTING COMPONENTS
// ============================================
function StatPill({ label, value, highlighted }: { label: string; value: number; highlighted?: boolean }) {
  const color = getTempColor(value);
  return (
    <View style={[styles.statPill, highlighted && styles.statPillActive]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: highlighted ? COLORS.accent : color }]}>
        {Math.round(value)}°
      </Text>
    </View>
  );
}

function ForecastIcon({ type }: { type: 'sunny' | 'cloudsun' | 'rain' }) {
  switch (type) {
    case 'cloudsun':
      return <CloudSun size={22} color={COLORS.secondary} strokeWidth={1.8} />;
    case 'rain':
      return <CloudRain size={22} color="#4C9AFF" strokeWidth={1.8} />;
    default:
      return <Sun size={22} color="#E8A854" strokeWidth={1.8} />;
  }
}

function ForecastCard({ date, high, low, index, isFirst }: { date: string; high: number; low: number; index: number; isFirst: boolean }) {
  const iconType = getWeatherIcon(high, low);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(300 + index * 40).duration(400)} style={animatedStyle}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.96);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        style={[styles.forecastCard, isFirst && styles.forecastCardActive]}
      >
        <Text style={styles.forecastDay}>{getDayName(date)}</Text>
        <View style={styles.forecastIcon}>
          <ForecastIcon type={iconType} />
        </View>
        <Text style={[styles.forecastHigh, isFirst && { color: COLORS.accent }]}>
          {Math.round(high)}°
        </Text>
        <Text style={styles.forecastLow}>{Math.round(low)}°</Text>
      </Pressable>
    </Animated.View>
  );
}

// ============================================
// MAIN DASHBOARD
// ============================================
export default function DashboardScreen() {
  const router = useRouter();
  const location = useLawnStore((s) => s.location);
  const setLocation = useLawnStore((s) => s.setLocation);
  const calendarTasks = useLawnStore((s) => s.calendarTasks);

  const requestLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });

      // Use backend geocode API for reliable city/state data
      try {
        const geocodeData = await api.get<{ city: string; state: string; zipCode: string }>(
          `/api/geocode?lat=${loc.coords.latitude}&lng=${loc.coords.longitude}`
        );
        setLocation({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          city: geocodeData.city,
          state: geocodeData.state,
          zipCode: geocodeData.zipCode || '00000',
        });
      } catch {
        // Fallback to expo-location if backend fails
        const geocode = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        const place = geocode[0];
        setLocation({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          city: place?.city ?? place?.subregion ?? place?.district ?? 'Unknown',
          state: place?.region ?? '',
          zipCode: place?.postalCode || '00000',
        });
      }
    } catch {
      // silently fail
    }
  }, [setLocation]);

  useEffect(() => {
    if (!location) {
      requestLocation();
    }
  }, [location, requestLocation]);

  const { data: soilData, isLoading } = useQuery({
    queryKey: ['soil-temperature', location?.lat, location?.lng],
    queryFn: () =>
      api.get<SoilTemperatureData>(
        `/api/soil-temperature?lat=${location!.lat}&lng=${location!.lng}`
      ),
    enabled: !!location,
  });

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const season = location ? getSeason(location.lat) : 'Spring';
  const deepTemp = soilData?.soilTemps.deep ?? 0;

  const nextTask = calendarTasks.find((t) => {
    const taskDate = new Date(t.suggestedDate + 'T00:00:00');
    return taskDate >= today;
  });

  const getInsightText = (temp: number) => {
    if (temp < 50) return 'Soil nearing optimal temp for seeding';
    if (temp <= 55) return 'Cool-season grass seeding window open';
    if (temp <= 70) return 'Perfect conditions for lawn care';
    if (temp <= 85) return 'Water deeply in early morning';
    return 'Reduce mowing to prevent stress';
  };

  return (
    <ScrollView
      testID="dashboard-screen"
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header - Clean, minimal */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
        <View style={styles.brandRow}>
          <Leaf size={22} color={COLORS.accent} strokeWidth={2.2} />
          <Text style={styles.brandText}>LawniCue</Text>
        </View>
        <Text style={styles.dateText}>{dateString}</Text>
        {location?.city ? (
          <Text style={styles.locationText}>
            {location.city}{location.state ? `, ${location.state}` : null}
          </Text>
        ) : null}
        <Text style={styles.seasonText}>{season}</Text>
      </Animated.View>

      {/* Soil Temperature Card - Hero Section */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <View style={styles.heroCard}>
          <View style={styles.cardHeaderRow}>
            <Thermometer size={18} color={COLORS.accent} strokeWidth={2} />
            <Text style={styles.cardTitle}>Soil Temperature</Text>
          </View>

          {isLoading || !soilData ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator testID="loading-indicator" color={COLORS.accent} size="large" />
              <Text style={styles.loadingText}>
                {!location ? 'Getting your location...' : 'Loading soil data...'}
              </Text>
            </View>
          ) : (
            <>
              {/* THE HERO - Temperature Ring */}
              <TemperatureRing temp={deepTemp} isLoading={isLoading} />

              {/* Depth readings - secondary info */}
              <View style={styles.statsRow}>
                <StatPill label="Surface" value={soilData.soilTemps.surface} />
                <StatPill label="2 in" value={soilData.soilTemps.shallow} highlighted />
                <StatPill label="7 in" value={soilData.soilTemps.mid} />
                <StatPill label="21 in" value={soilData.soilTemps.deep} />
              </View>

              <View style={styles.divider} />

              {/* Air temp - tertiary info */}
              <View style={styles.airRow}>
                <Wind size={16} color={COLORS.tertiary} strokeWidth={2} />
                <Text style={styles.airText}>{Math.round(soilData.airTemp)}° Air Temp</Text>
              </View>
            </>
          )}
        </View>
      </Animated.View>

      {/* AI Insight Card */}
      {soilData && !isLoading ? (
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(tabs)/calendar');
            }}
            style={styles.insightCard}
          >
            <View style={styles.insightLeft}>
              <View style={styles.insightIconWrap}>
                <Sparkles size={16} color={COLORS.accent} strokeWidth={2} />
              </View>
              <Text style={styles.insightText}>{getInsightText(deepTemp)}</Text>
            </View>
            <ChevronRight size={18} color={COLORS.tertiary} strokeWidth={2} />
          </Pressable>
        </Animated.View>
      ) : null}

      {/* 7-Day Forecast */}
      {soilData?.forecast && soilData.forecast.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.sectionTitle}>7-Day Forecast</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.forecastRow}
            style={{ flexGrow: 0 }}
            decelerationRate="fast"
          >
            {soilData.forecast.map((day, index) => (
              <ForecastCard
                key={day.date}
                date={day.date}
                high={day.high}
                low={day.low}
                index={index}
                isFirst={index === 0}
              />
            ))}
          </ScrollView>
        </Animated.View>
      ) : null}

      {/* Next Task */}
      {nextTask ? (
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Pressable
            testID="next-task-card"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(tabs)/calendar');
            }}
            style={styles.taskCard}
          >
            <Text style={styles.taskLabel}>UPCOMING TASK</Text>
            <Text style={styles.taskTitle}>{nextTask.title}</Text>
            <Text style={styles.taskDesc} numberOfLines={1}>
              {nextTask.description}
            </Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </ScrollView>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  brandText: {
    fontFamily: 'Raleway_800ExtraBold',
    fontSize: 24,
    color: COLORS.primary,
    letterSpacing: -0.3,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.tertiary,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.secondary,
    marginBottom: 2,
  },
  seasonText: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.tertiary,
  },
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...CARD_SHADOW,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: COLORS.primary,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.tertiary,
  },

  // Temperature Ring Styles
  ringContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  glowLayer: {
    position: 'absolute',
    top: -20,
    left: '50%',
    marginLeft: -140,
  },
  ringCenterContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTemperature: {
    fontSize: 56,
    fontWeight: '700',
    letterSpacing: -3,
    textAlign: 'center',
  },
  depthLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.tertiary,
    textAlign: 'center',
    marginTop: 4,
  },
  statusLabelContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  statPill: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
  },
  statPillActive: {
    backgroundColor: COLORS.cardElevated,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.tertiary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  airRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  airText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.tertiary,
  },

  // Insight Card
  insightCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    ...CARD_SHADOW,
  },
  insightLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  insightIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.secondary,
    lineHeight: 20,
  },

  // Section Title
  sectionTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: COLORS.primary,
    marginBottom: 14,
  },

  // Forecast
  forecastRow: {
    gap: 10,
    paddingRight: 20,
    paddingBottom: 4,
  },
  forecastCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    minWidth: 76,
    ...CARD_SHADOW,
  },
  forecastCardActive: {
    backgroundColor: COLORS.cardElevated,
  },
  forecastDay: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.tertiary,
    marginBottom: 10,
  },
  forecastIcon: {
    marginBottom: 10,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forecastHigh: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: -0.5,
  },
  forecastLow: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.tertiary,
  },

  // Task Card
  taskCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 24,
    ...CARD_SHADOW,
  },
  taskLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.tertiary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  taskDesc: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.secondary,
    marginTop: 4,
  },
});
