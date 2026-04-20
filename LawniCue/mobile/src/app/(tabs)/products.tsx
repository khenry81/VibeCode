import React, { useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Image,
  Linking,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Beaker, Clock, Droplets, ExternalLink } from 'lucide-react-native';
import { api } from '@/lib/api/api';
import useLawnStore from '@/lib/state/lawn-store';
import { getSeason, PRODUCT_CATEGORIES } from '@/lib/constants';
import type { ProductRecommendation } from '@/lib/types';

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

function ProductCard({ product, index }: { product: ProductRecommendation; index: number }) {
  const isPriorityHigh = product.priority === 'high';
  const priorityColor = isPriorityHigh ? '#E85454' : product.priority === 'medium' ? '#E8A854' : COLORS.muted;
  const thumbnailUri = product.imageUrl;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(product.purchaseUrl);
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)} style={styles.productCardWrap}>
      <Pressable
        testID={`product-card-${product.id}`}
        onPress={handlePress}
        style={styles.productCard}
      >
        <View style={styles.productHeader}>
          <Image
            source={{ uri: thumbnailUri }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.productHeaderText}>
            <View style={styles.productNameRow}>
              <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
              <ExternalLink size={13} color={COLORS.muted} style={styles.externalLinkIcon} />
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '18' }]}>
              <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
              <Text style={[styles.priorityLabel, { color: priorityColor }]}>{product.priority}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tagsRow}>
          <Text style={styles.tagCategory}>{product.category}</Text>
          <Text style={styles.tagType}>{product.type}</Text>
        </View>

        <Text style={styles.productDesc}>{product.description}</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Droplets size={14} color={COLORS.muted} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Application</Text>
              <Text style={styles.infoValue} numberOfLines={3}>{product.applicationRate}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Clock size={14} color={COLORS.muted} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Best Time</Text>
              <Text style={styles.infoValue} numberOfLines={3}>{product.bestTimeToApply}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function ProductsScreen() {
  const location = useLawnStore((s) => s.location);
  const grassType = useLawnStore((s) => s.grassType);
  const issues = useLawnStore((s) => s.issues);

  const [activeFilter, setActiveFilter] = useState<string>('All');

  const season = location ? getSeason(location.lat) : 'Spring';

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['recommendations', grassType, season, issues],
    queryFn: async () => {
      const result = await api.post<{ recommendations: ProductRecommendation[] }>(
        '/api/recommendations',
        {
          soilTemp: 65,
          season,
          grassType,
          issues: issues.length > 0 ? issues : ['General maintenance'],
        }
      );
      return result.recommendations;
    },
  });

  const filteredProducts = (data ?? []).filter((p) => {
    if (activeFilter === 'All') return true;
    return p.category.toLowerCase().includes(activeFilter.toLowerCase());
  });

  return (
    <ScrollView
      testID="products-screen"
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.accent}
          colors={[COLORS.accent]}
        />
      }
    >
      {/* Filter tabs */}
      <Animated.View entering={FadeIn.duration(400)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
          style={{ flexGrow: 0 }}
        >
          {PRODUCT_CATEGORIES.map((cat) => {
            const isActive = cat === activeFilter;
            return (
              <Pressable
                key={cat}
                testID={`filter-${cat.toLowerCase()}`}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveFilter(cat);
                }}
                style={[styles.filterBtn, isActive && styles.filterBtnActive]}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>

      <View style={styles.productsSection}>
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator testID="products-loading" color={COLORS.accent} size="large" />
            <Text style={styles.loadingText}>Getting AI recommendations...</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <Animated.View entering={FadeIn.duration(300)} style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Beaker size={28} color={COLORS.muted} />
            </View>
            <Text style={styles.emptyText}>No products match this filter</Text>
          </Animated.View>
        ) : (
          filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))
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
    paddingBottom: 100,
  },
  filtersRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  filterBtn: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterBtnActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.bg,
  },
  productsSection: {
    paddingHorizontal: 20,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.muted,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
  },
  productCardWrap: {
    marginBottom: 12,
  },
  productCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...CARD_SHADOW,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    flexShrink: 0,
  },
  productHeaderText: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 6,
  },
  productNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  productName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  externalLinkIcon: {
    marginTop: 2,
    flexShrink: 0,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  priorityDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  priorityLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 6,
  },
  tagCategory: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.bg,
    color: COLORS.textSecondary,
  },
  tagType: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.accent + '15',
    color: COLORS.accent,
  },
  productDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    marginLeft: 8,
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: COLORS.muted,
  },
  infoValue: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
    lineHeight: 14,
  },
});
