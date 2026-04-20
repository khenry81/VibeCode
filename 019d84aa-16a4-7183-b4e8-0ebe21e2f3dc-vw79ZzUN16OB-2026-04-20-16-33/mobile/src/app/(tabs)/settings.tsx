import React, { useCallback } from 'react';
import {
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
} from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MapPin, RefreshCw, Leaf, Bug, Info } from 'lucide-react-native';
import { api } from '@/lib/api/api';
import useLawnStore from '@/lib/state/lawn-store';
import { GRASS_TYPES, COMMON_ISSUES } from '@/lib/constants';

const COLORS = {
  bg: '#0B1F1A',
  card: '#122B25',
  cardElevated: '#183D34',
  accent: '#4FAF7A',
  accentBlue: '#4C9AFF',
  text: '#FFFFFF',
  textSecondary: '#A7B3AF',
  muted: '#6B7C76',
  subtle: '#3A4A45',
  border: 'rgba(255,255,255,0.04)',
};

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.35,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 8 },
  elevation: 12,
};

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconWrap}>{icon}</View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const location = useLawnStore((s) => s.location);
  const setLocation = useLawnStore((s) => s.setLocation);
  const grassType = useLawnStore((s) => s.grassType);
  const setGrassType = useLawnStore((s) => s.setGrassType);
  const lawnSize = useLawnStore((s) => s.lawnSize);
  const setLawnSize = useLawnStore((s) => s.setLawnSize);
  const issues = useLawnStore((s) => s.issues);
  const setIssues = useLawnStore((s) => s.setIssues);

  const updateLocation = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // silently fail
    }
  }, [setLocation]);

  const toggleIssue = useCallback(
    (issue: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (issues.includes(issue)) {
        setIssues(issues.filter((i) => i !== issue));
      } else {
        setIssues([...issues, issue]);
      }
    },
    [issues, setIssues]
  );

  const selectGrass = useCallback(
    (type: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setGrassType(type);
    },
    [setGrassType]
  );

  return (
    <ScrollView
      testID="settings-screen"
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Location */}
      <Animated.View entering={FadeInDown.delay(0).duration(400)}>
        <View style={styles.card}>
          <SectionHeader icon={<MapPin size={16} color={COLORS.accent} />} title="Location" />
          {location ? (
            <View style={styles.locationInfo}>
              <Text style={styles.locationCity}>
                {location.city}{location.state ? `, ${location.state}` : null}
              </Text>
              <Text style={styles.locationCoords}>
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </Text>
              {location.zipCode ? (
                <Text style={styles.locationZip}>ZIP: {location.zipCode}</Text>
              ) : null}
            </View>
          ) : (
            <Text style={styles.noLocation}>Location not set</Text>
          )}

          <Pressable testID="update-location-btn" onPress={updateLocation} style={styles.updateBtn}>
            <RefreshCw size={16} color={COLORS.bg} />
            <Text style={styles.updateBtnText}>Update Location</Text>
          </Pressable>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ZIP Code</Text>
            <TextInput
              testID="zip-code-input"
              value={location?.zipCode ?? ''}
              onChangeText={(text) => {
                if (location) {
                  setLocation({ ...location, zipCode: text });
                }
              }}
              placeholder="Enter ZIP code"
              placeholderTextColor={COLORS.subtle}
              keyboardType="number-pad"
              maxLength={10}
              style={styles.textInput}
            />
          </View>
        </View>
      </Animated.View>

      {/* Lawn Profile */}
      <Animated.View entering={FadeInDown.delay(80).duration(400)}>
        <View style={styles.card}>
          <SectionHeader icon={<Leaf size={16} color={COLORS.accent} />} title="Lawn Profile" />

          <Text style={styles.inputLabel}>Grass Type</Text>
          <View style={styles.chipsRow}>
            {GRASS_TYPES.map((type) => {
              const isSelected = type === grassType;
              return (
                <Pressable
                  key={type}
                  testID={`grass-type-${type.toLowerCase().replace(/\s/g, '-')}`}
                  onPress={() => selectGrass(type)}
                  style={[styles.chip, isSelected && styles.chipActive]}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{type}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Lawn Size (sq ft)</Text>
            <TextInput
              testID="lawn-size-input"
              value={lawnSize}
              onChangeText={setLawnSize}
              placeholder="e.g. 5000"
              placeholderTextColor={COLORS.subtle}
              keyboardType="number-pad"
              style={styles.textInput}
            />
          </View>

          <Text style={[styles.inputLabel, { marginTop: 16 }]}>Common Issues</Text>
          <View style={styles.chipsRow}>
            {COMMON_ISSUES.map((issue) => {
              const isSelected = issues.includes(issue);
              return (
                <Pressable
                  key={issue}
                  testID={`issue-${issue.toLowerCase().replace(/\s/g, '-')}`}
                  onPress={() => toggleIssue(issue)}
                  style={[styles.chip, isSelected && styles.chipActive]}
                >
                  <Bug size={12} color={isSelected ? COLORS.bg : COLORS.textSecondary} />
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive, { marginLeft: 6 }]}>
                    {issue}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Animated.View>

      {/* About */}
      <Animated.View entering={FadeInDown.delay(160).duration(400)}>
        <View style={styles.card}>
          <SectionHeader icon={<Info size={16} color={COLORS.accent} />} title="About" />
          <Text style={styles.brandName}>LawniCue</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.aboutText}>
            AI-powered lawn care assistant. Get personalized soil temperature data,
            product recommendations, and a maintenance calendar tailored to your lawn.
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

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
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...CARD_SHADOW,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  locationInfo: {
    marginBottom: 16,
  },
  locationCity: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  locationCoords: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 3,
  },
  locationZip: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 1,
  },
  noLocation: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 16,
  },
  updateBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  updateBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.bg,
  },
  inputGroup: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 11,
    color: COLORS.muted,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.bg,
  },
  brandName: {
    fontFamily: 'Raleway_800ExtraBold',
    fontSize: 20,
    color: COLORS.text,
  },
  versionText: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 4,
  },
  aboutText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 12,
    lineHeight: 20,
  },
});
