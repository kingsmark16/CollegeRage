import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteMedia, getAdminMediaPage, updateMedia, uploadMediaFiles } from '@/services/media.service';
import type { MediaFilter, MediaItem, UpdateMediaInput } from '../media.types';

export const adminMediaQueryKey = ['media', 'admin'] as const;
const variantPreferenceOrder = ['720p', '1080p', '480p'] as const;
const ADMIN_MEDIA_PAGE_SIZE = 15;

export const useAdminMedia = () => {
  const queryClient = useQueryClient();
  const [filter, setFilterState] = useState<MediaFilter>('all');
  const [page, setPage] = useState(1);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [selectedVariantLabel, setSelectedVariantLabel] = useState<'480p' | '720p' | '1080p' | null>(null);

  const mediaQuery = useQuery({
    queryKey: [...adminMediaQueryKey, filter, page, ADMIN_MEDIA_PAGE_SIZE],
    queryFn: () => getAdminMediaPage(page, ADMIN_MEDIA_PAGE_SIZE, filter),
    placeholderData: (previousData) => previousData,
  });

  const invalidateMedia = () => queryClient.invalidateQueries({ queryKey: adminMediaQueryKey });

  const uploadMutation = useMutation({
    mutationFn: uploadMediaFiles,
    onSuccess: async () => {
      setPage(1);
      await invalidateMedia();
    },
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

      const currentItems = mediaQuery.data?.items ?? [];

      if (currentItems.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      }

      await invalidateMedia();
    },
  });

  const items = useMemo(() => mediaQuery.data?.items ?? [], [mediaQuery.data]);

  const selectedMedia: MediaItem | null = useMemo(
    () => items.find((item) => item.id === selectedMediaId) ?? items[0] ?? null,
    [items, selectedMediaId]
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

  const setFilter = (nextFilter: MediaFilter) => {
    setFilterState(nextFilter);
    setPage(1);
    setSelectedMediaId(null);
    setSelectedVariantLabel(null);
  };

  return {
    ADMIN_MEDIA_PAGE_SIZE,
    activeVariantLabel,
    activeVariantUrl,
    deleteMutation,
    filter,
    items,
    mediaQuery,
    page,
    selectedMedia,
    selectedMediaVariantEntries,
    selectedMediaId,
    setFilter,
    setPage,
    setSelectedMediaId,
    setSelectedVariantLabel,
    updateMutation,
    uploadMutation,
  };
};
