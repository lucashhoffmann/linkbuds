import { useQueryClient } from '@tanstack/react-query';
import { useMutationCache } from '@/app/cache/use-mutation-cache';
import { useQueryCache } from '@/app/cache/use-query-cache';
import linkPagesService from '../service/link-pages.service';
import { LinkPagesQueryKeys } from '../keys/link-pages.keys';
import type {
  LinkPageDetail,
  LinkPageImage,
  LinkPageLink,
  LinkPageSocialLink,
} from '../types/link-pages.types';

export const publicLinkPageQueryOptions = {
  gcTime: 30 * 60 * 1000,
  refetchOnWindowFocus: false,
  staleTime: 5 * 60 * 1000,
} as const;

export function useListLinkPagesUseCase() {
  return useQueryCache({
    queryKey: [LinkPagesQueryKeys.LIST],
    queryFn: () => linkPagesService.list(),
  });
}

export function useGetLinkPageUseCase(id?: string) {
  return useQueryCache({
    queryKey: [LinkPagesQueryKeys.DETAIL, id],
    queryFn: () => linkPagesService.get(id ?? ''),
    enabled: Boolean(id),
  });
}

export function useGetPublicLinkPageUseCase(slug?: string) {
  return useQueryCache({
    queryKey: [LinkPagesQueryKeys.PUBLIC, slug],
    queryFn: () => linkPagesService.getPublic(slug ?? ''),
    enabled: Boolean(slug),
    retry: false,
    ...publicLinkPageQueryOptions,
  });
}

export function useLinkPageMutations(id?: string) {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [LinkPagesQueryKeys.LIST] }),
      queryClient.invalidateQueries({ queryKey: [LinkPagesQueryKeys.DETAIL, id] }),
    ]);
  };

  const create = useMutationCache({
    mutationFn: (payload: { name: string; slug: string; layout: string }) =>
      linkPagesService.create(payload),
    onSuccess: invalidate,
  });
  const update = useMutationCache({
    mutationFn: (payload: Partial<LinkPageDetail>) =>
      linkPagesService.update(id ?? '', payload),
    onSuccess: invalidate,
  });
  const remove = useMutationCache({
    mutationFn: (linkPageId: string) => linkPagesService.delete(linkPageId),
    onSuccess: invalidate,
  });
  const updateFooter = useMutationCache({
    mutationFn: (payload: Partial<LinkPageDetail>) =>
      linkPagesService.updateFooter(id ?? '', payload),
    onSuccess: invalidate,
  });
  const createLink = useMutationCache({
    mutationFn: (payload: Omit<LinkPageLink, 'id'>) =>
      linkPagesService.createLink(id ?? '', payload),
    onSuccess: invalidate,
  });
  const updateLink = useMutationCache({
    mutationFn: ({
      linkId,
      payload,
    }: {
      linkId: string;
      payload: Partial<LinkPageLink>;
    }) => linkPagesService.updateLink(id ?? '', linkId, payload),
    onSuccess: invalidate,
  });
  const deleteLink = useMutationCache({
    mutationFn: (linkId: string) => linkPagesService.deleteLink(id ?? '', linkId),
    onSuccess: invalidate,
  });
  const reorderLinks = useMutationCache({
    mutationFn: (payload: Array<{ id: string; sortOrder: number }>) =>
      linkPagesService.reorderLinks(id ?? '', payload),
    onError: invalidate,
    onSuccess: invalidate,
  });
  const createSocialLink = useMutationCache({
    mutationFn: (payload: Omit<LinkPageSocialLink, 'id'>) =>
      linkPagesService.createSocialLink(id ?? '', payload),
    onSuccess: invalidate,
  });
  const updateSocialLink = useMutationCache({
    mutationFn: ({
      socialLinkId,
      payload,
    }: {
      socialLinkId: string;
      payload: Partial<LinkPageSocialLink>;
    }) => linkPagesService.updateSocialLink(id ?? '', socialLinkId, payload),
    onSuccess: invalidate,
  });
  const deleteSocialLink = useMutationCache({
    mutationFn: (socialLinkId: string) =>
      linkPagesService.deleteSocialLink(id ?? '', socialLinkId),
    onSuccess: invalidate,
  });
  const createImage = useMutationCache({
    mutationFn: (payload: Omit<LinkPageImage, 'id'>) =>
      linkPagesService.createImage(id ?? '', payload),
    onSuccess: invalidate,
  });
  const updateImage = useMutationCache({
    mutationFn: ({
      imageId,
      payload,
    }: {
      imageId: string;
      payload: Partial<LinkPageImage>;
    }) => linkPagesService.updateImage(id ?? '', imageId, payload),
    onSuccess: invalidate,
  });
  const deleteImage = useMutationCache({
    mutationFn: (imageId: string) => linkPagesService.deleteImage(id ?? '', imageId),
    onSuccess: invalidate,
  });

  return {
    create,
    update,
    remove,
    updateFooter,
    createLink,
    updateLink,
    deleteLink,
    reorderLinks,
    createSocialLink,
    updateSocialLink,
    deleteSocialLink,
    createImage,
    updateImage,
    deleteImage,
  };
}

export function useLinkPageAnalyticsSummaryUseCase(id?: string, enabled = true) {
  return useQueryCache({
    queryKey: [LinkPagesQueryKeys.ANALYTICS_SUMMARY, id],
    queryFn: () => linkPagesService.analyticsSummary(id ?? ''),
    enabled: Boolean(id) && enabled,
    retry: false,
  });
}

export function useLinkPageAnalyticsInsightsUseCase(
  id?: string,
  params?: { from?: string; to?: string },
  enabled = true,
) {
  return useQueryCache({
    queryKey: [
      LinkPagesQueryKeys.ANALYTICS_INSIGHTS,
      id,
      params?.from ?? null,
      params?.to ?? null,
    ],
    queryFn: () => linkPagesService.analyticsInsights(id ?? '', params),
    enabled: Boolean(id) && enabled,
    retry: false,
  });
}

export function useLinkPageLinkClicksUseCase(id?: string, enabled = true) {
  return useQueryCache({
    queryKey: [LinkPagesQueryKeys.ANALYTICS_LINK_CLICKS, id],
    queryFn: () => linkPagesService.analyticsLinkClicks(id ?? ''),
    enabled: Boolean(id) && enabled,
    retry: false,
  });
}

export function useCompanyDomainUseCase(enabled = true) {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: [LinkPagesQueryKeys.DOMAIN] });
  };
  const query = useQueryCache({
    queryKey: [LinkPagesQueryKeys.DOMAIN],
    queryFn: () => linkPagesService.getDomain(),
    enabled,
    retry: false,
  });
  const create = useMutationCache({
    mutationFn: (hostname: string) => linkPagesService.createDomain(hostname),
    onSuccess: invalidate,
  });
  const verify = useMutationCache({
    mutationFn: (id: string) => linkPagesService.verifyDomain(id),
    onSuccess: invalidate,
  });
  const remove = useMutationCache({
    mutationFn: (id: string) => linkPagesService.deleteDomain(id),
    onSuccess: invalidate,
  });

  return { ...query, create, verify, remove };
}
