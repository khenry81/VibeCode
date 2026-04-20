import React, { useState, useMemo, useCallback } from 'react';
import { Text, View, ScrollView, Pressable, ActivityIndicator, StyleSheet, Image, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Calendar } from 'react-native-calendars';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AlertCircle, CheckCircle2, Package, Clock, ExternalLink } from 'lucide-react-native';
import { api } from '@/lib/api/api';
import useLawnStore from '@/lib/state/lawn-store';
import { getSeason, CATEGORY_COLORS, formatDate } from '@/lib/constants';
import type { CalendarTask } from '@/lib/types';

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

function TaskCard({ task, index }: { task: CalendarTask; index: number }) {
  const catColor = CATEGORY_COLORS[task.category] ?? COLORS.muted;
  const isPriorityHigh = task.priority === 'high';

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(400)} style={styles.taskCardWrap}>
      <Pressable
        testID={`task-card-${task.id}`}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        style={styles.taskCard}
      >
        <View style={styles.taskHeader}>
          <View style={[styles.taskDot, { backgroundColor: catColor }]} />
          <Text style={[styles.taskBadge, { backgroundColor: catColor + '18', color: catColor }]}>
            {task.category}
          </Text>
          {isPriorityHigh ? (
            <View style={styles.priorityRow}>
              <AlertCircle size={12} color="#E85454" />
              <Text style={[styles.priorityText, { color: '#E85454' }]}>High</Text>
            </View>
          ) : (
            <View style={styles.priorityRow}>
              <CheckCircle2 size={12} color={COLORS.muted} />
              <Text style={[styles.priorityText, { color: COLORS.muted }]}>{task.priority}</Text>
            </View>
          )}
        </View>

        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskDesc}>{task.description}</Text>

        {task.productName ? (
          task.purchaseUrl ? (
            <Pressable
              style={styles.productRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Linking.openURL(task.purchaseUrl!);
              }}
            >
              {task.imageUrl ? (
                <Image
                  source={{ uri: task.imageUrl }}
                  style={styles.productThumbnail}
                  resizeMode="cover"
                />
              ) : null}
              <Package size={14} color={COLORS.accent} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{task.productName}</Text>
                {task.productBrand ? (
                  <Text style={styles.productBrand}>{task.productBrand}</Text>
                ) : null}
              </View>
              <ExternalLink size={12} color={COLORS.muted} />
            </Pressable>
          ) : (
            <View style={styles.productRow}>
              {task.imageUrl ? (
                <Image
                  source={{ uri: task.imageUrl }}
                  style={styles.productThumbnail}
                  resizeMode="cover"
                />
              ) : null}
              <Package size={14} color={COLORS.accent} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{task.productName}</Text>
                {task.productBrand ? (
                  <Text style={styles.productBrand}>{task.productBrand}</Text>
                ) : null}
              </View>
            </View>
          )
        ) : null}

        <View style={styles.taskFooter}>
          <Clock size={12} color={COLORS.muted} />
          <Text style={styles.taskDate}>{formatDate(task.suggestedDate)}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function CalendarScreen() {
  const location = useLawnStore((s) => s.location);
  const grassType = useLawnStore((s) => s.grassType);
  const calendarTasks = useLawnStore((s) => s.calendarTasks);
  const setCalendarTasks = useLawnStore((s) => s.setCalendarTasks);

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const season = location ? getSeason(location.lat) : 'Spring';

  const { isLoading } = useQuery({
    queryKey: ['calendar-tasks', location?.lat, location?.lng, location?.zipCode, grassType, season],
    queryFn: async () => {
      const result = await api.post<{ tasks: CalendarTask[] }>('/api/calendar-suggestions', {
        soilTemp: 65,
        season,
        grassType,
        zipCode: location?.zipCode || '00000',
      });
      setCalendarTasks(result.tasks);
      return result;
    },
    enabled: !!location,
  });

  const markedDates = useMemo(() => {
    const marks: Record<string, { dots: Array<{ key: string; color: string }>; selected?: boolean; selectedColor?: string }> = {};
    calendarTasks.forEach((task) => {
      const d = task.suggestedDate;
      if (!marks[d]) {
        marks[d] = { dots: [] };
      }
      const color = CATEGORY_COLORS[task.category] ?? COLORS.muted;
      if (marks[d].dots.length < 3) {
        marks[d].dots.push({ key: task.id, color });
      }
    });
    if (marks[selectedDate]) {
      marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: COLORS.cardElevated };
    } else {
      marks[selectedDate] = { dots: [], selected: true, selectedColor: COLORS.cardElevated };
    }
    return marks;
  }, [calendarTasks, selectedDate]);

  const tasksForDate = useMemo(() => {
    return calendarTasks.filter((t) => t.suggestedDate === selectedDate);
  }, [calendarTasks, selectedDate]);

  const onDayPress = useCallback((day: { dateString: string }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(day.dateString);
  }, []);

  return (
    <ScrollView
      testID="calendar-screen"
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn.duration(500)} style={[styles.calendarWrap, CARD_SHADOW]}>
        <Calendar
          current={selectedDate}
          onDayPress={onDayPress}
          markingType="multi-dot"
          markedDates={markedDates}
          theme={{
            calendarBackground: COLORS.card,
            textSectionTitleColor: COLORS.muted,
            selectedDayBackgroundColor: COLORS.cardElevated,
            selectedDayTextColor: COLORS.accent,
            todayTextColor: COLORS.accent,
            dayTextColor: COLORS.text,
            textDisabledColor: COLORS.subtle,
            monthTextColor: COLORS.text,
            arrowColor: COLORS.accent,
            textDayFontWeight: '500',
            textMonthFontWeight: '700',
            textDayHeaderFontWeight: '600',
          }}
        />
      </Animated.View>

      <View style={styles.tasksSection}>
        <Text style={styles.dateTitle}>{formatDate(selectedDate)}</Text>

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator testID="calendar-loading" color={COLORS.accent} size="large" />
            <Text style={styles.loadingText}>Loading tasks...</Text>
          </View>
        ) : tasksForDate.length === 0 ? (
          <Animated.View entering={FadeIn.duration(300)}>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No tasks scheduled for this day</Text>
            </View>
          </Animated.View>
        ) : (
          tasksForDate.map((task, index) => <TaskCard key={task.id} task={task} index={index} />)
        )}
      </View>
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
  calendarWrap: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  tasksSection: {
    marginTop: 24,
  },
  dateTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.muted,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...CARD_SHADOW,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
  },
  taskCardWrap: {
    marginBottom: 12,
  },
  taskCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...CARD_SHADOW,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  taskBadge: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '500',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  taskDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 19,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    padding: 12,
  },
  productInfo: {
    marginLeft: 10,
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
  },
  productBrand: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 6,
  },
  taskDate: {
    fontSize: 11,
    color: COLORS.muted,
  },
  productThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: 10,
  },
});
