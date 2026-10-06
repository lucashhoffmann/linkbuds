import { useQueryClient } from '@tanstack/react-query';
import { useMutationCache } from '@/app/cache/use-mutation-cache';
import { useQueryCache } from '@/app/cache/use-query-cache';
import linkPagesService from '../service/link-pages.service';
import { LinkPagesQueryKeys } from '../keys/link-pages.keys';
import type {
  FooterSettings,
  LinkPageDetail,
  LinkPageImage,
  LinkPageVideo,
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

export function useLinkPagesOverviewUseCase() {
  return useQueryCache({
    queryKey: [LinkPagesQueryKeys.OVERVIEW],
    queryFn: () => linkPagesService.overview(),
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

/** OG data (title/description/image) for a "Link com prévia" card. */
export function useLinkPreviewUseCase() {
  return useMutationCache({
    mutationFn: (url: string) => linkPagesService.getLinkPreview(url),
  });
}

export function useLinkPageMutations(id?: string) {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [LinkPagesQueryKeys.LIST] }),
      queryClient.invalidateQueries({
        queryKey: [LinkPagesQueryKeys.DETAIL, id],
      }),
    ]);
  };

  const create = useMutationCache({
    mutationFn: (payload: { name: string; slug: string; layout: string }) =>
      linkPagesService.create(payload),
    onSuccess: invalidate,
  });
  const createPost = useMutationCache({
    mutationFn: ({
      parentId,
      ...payload
    }: Parameters<typeof linkPagesService.createPost>[1] & {
      parentId: string;
    }) => linkPagesService.createPost(parentId, payload),
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
    mutationFn: (linkId: string) =>
      linkPagesService.deleteLink(id ?? '', linkId),
    onSuccess: invalidate,
  });
  const reorderContent = useMutationCache({
    mutationFn: (
      payload: Parameters<typeof linkPagesService.reorderContent>[1],
    ) => linkPagesService.reorderContent(id ?? '', payload),
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
  const deleteImage = useMutationCache({
    mutationFn: (imageId: string) =>
      linkPagesService.deleteImage(id ?? '', imageId),
    onSuccess: invalidate,
  });
  const createVideo = useMutationCache({
    mutationFn: (payload: Omit<LinkPageVideo, 'id'>) =>
      linkPagesService.createVideo(id ?? '', payload),
    onSuccess: invalidate,
  });
  const updateVideo = useMutationCache({
    mutationFn: ({
      videoId,
      payload,
    }: {
      videoId: string;
      payload: Partial<Omit<LinkPageVideo, 'id'>>;
    }) => linkPagesService.updateVideo(id ?? '', videoId, payload),
    onSuccess: invalidate,
  });
  const deleteVideo = useMutationCache({
    mutationFn: (videoId: string) =>
      linkPagesService.deleteVideo(id ?? '', videoId),
    onSuccess: invalidate,
  });

  return {
    create,
    createPost,
    update,
    remove,
    updateFooter,
    createLink,
    updateLink,
    deleteLink,
    reorderContent,
    createSocialLink,
    updateSocialLink,
    deleteSocialLink,
    createImage,
    deleteImage,
    createVideo,
    updateVideo,
    deleteVideo,
  };
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

/** Countries for the globe; realtime polls while the modal is open. */
export function useLinkPageAnalyticsGeoUseCase(
  id: string,
  params: { realtime: boolean; from?: string; to?: string },
  enabled = true,
) {
  return useQueryCache({
    queryKey: [
      LinkPagesQueryKeys.ANALYTICS_GEO,
      id,
      params.realtime,
      params.from ?? null,
      params.to ?? null,
    ],
    queryFn: () => linkPagesService.analyticsGeo(id, params),
    enabled,
    retry: false,
    refetchInterval: params.realtime ? 10_000 : false,
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
    await queryClient.invalidateQueries({
      queryKey: [LinkPagesQueryKeys.DOMAIN],
    });
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

/** Origin of public pages: the company's ACTIVE custom domain, else this app. */
export function usePublicOrigin() {
  const { data } = useQueryCache({
    queryKey: [LinkPagesQueryKeys.DOMAIN],
    queryFn: () => linkPagesService.getDomain(),
    retry: false,
  });

  return data?.status === 'ACTIVE'
    ? `https://${data.hostname}`
    : window.location.origin;
}

export function useFooterDefaultUseCase() {
  const queryClient = useQueryClient();
  const query = useQueryCache({
    queryKey: [LinkPagesQueryKeys.FOOTER_DEFAULT],
    queryFn: () => linkPagesService.getFooterDefault(),
  });
  const update = useMutationCache({
    mutationFn: (payload: FooterSettings & { applyToExisting: boolean }) =>
      linkPagesService.updateFooterDefault(payload),
    onSuccess: async (_data, { applyToExisting }) => {
      await queryClient.invalidateQueries({
        queryKey: [LinkPagesQueryKeys.FOOTER_DEFAULT],
      });
      if (applyToExisting) {
        await Promise.all(
          [LinkPagesQueryKeys.DETAIL, LinkPagesQueryKeys.PUBLIC].map((key) =>
            queryClient.invalidateQueries({ queryKey: [key] }),
          ),
        );
      }
    },
  });

  return { ...query, update };
}
