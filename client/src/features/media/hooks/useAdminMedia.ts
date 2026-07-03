import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteMedia, getAdminMedia, updateMedia, uploadMediaFiles } from '@/services/media.service';
import type { MediaItem, UpdateMediaInput } from '../media.types';

export const adminMediaQueryKey = ['media', 'admin'] as const;
const variantPreferenceOrder = ['720p', '1080p', '480p'] as const;

export const useAdminMedia = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [selectedVariantLabel, setSelectedVariantLabel] = useState<'480p' | '720p' | '1080p' | null>(null);

  const mediaQuery = useQuery({
    queryKey: adminMediaQueryKey,
    queryFn: getAdminMedia,
  });

  const invalidateMedia = () => queryClient.invalidateQueries({ queryKey: adminMediaQueryKey });

  const uploadMutation = useMutation({
    mutationFn: uploadMediaFiles,
    onSuccess: invalidateMedia,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMediaInput }) => updateMedia(id, input),
    onSuccess: invalidateMedia,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMedia,
    onSuccess: async (_, deletedId) => {
      if (selectedMediaId === deletedId) {
        setSelectedMediaId(null);
      }

      await invalidateMedia();
    },
  });

  const items = useMemo(() => mediaQuery.data ?? [], [mediaQuery.data]);

  const filteredItems = useMemo(() => {
    if (filter === 'all') {
      return items;
    }

    return items.filter((item) => item.type === filter);
  }, [filter, items]);

  const selectedMedia: MediaItem | null = useMemo(
    () => items.find((item) => item.id === selectedMediaId) ?? filteredItems[0] ?? items[0] ?? null,
    [filteredItems, items, selectedMediaId]
  );

  const selectedMediaVariantEntries = useMemo(() => {
    if (!selectedMedia || selectedMedia.type !== 'video') {
      return [];
    }

    return Object.entries(selectedMedia.variants ?? {})
      .map(([label, url]) => ({ label: label as '480p' | '720p' | '1080p', url }))
      .sort(
        (left, right) =>
          variantPreferenceOrder.indexOf(left.label) - variantPreferenceOrder.indexOf(right.label)
      );
  }, [selectedMedia]);

  const activeVariantLabel = useMemo(() => {
    if (selectedMediaVariantEntries.length === 0) {
      return null;
    }

    const hasSelectedVariant = selectedVariantLabel
      ? selectedMediaVariantEntries.some((variant) => variant.label === selectedVariantLabel)
      : false;

    if (hasSelectedVariant) {
      return selectedVariantLabel;
    }

    return selectedMediaVariantEntries[0]?.label ?? null;
  }, [selectedMediaVariantEntries, selectedVariantLabel]);

  const activeVariantUrl = useMemo(() => {
    if (!activeVariantLabel) {
      return null;
    }

    return selectedMediaVariantEntries.find((variant) => variant.label === activeVariantLabel)?.url ?? null;
  }, [activeVariantLabel, selectedMediaVariantEntries]);

  return {
    activeVariantLabel,
    activeVariantUrl,
    deleteMutation,
    filter,
    filteredItems,
    mediaQuery,
    selectedMedia,
    selectedMediaVariantEntries,
    selectedMediaId,
    setFilter,
    setSelectedMediaId,
    setSelectedVariantLabel,
    updateMutation,
    uploadMutation,
  };
};
