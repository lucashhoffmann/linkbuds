import { type FormEvent, useState } from 'react';
import { useLinkPageMutations } from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import type {
  LinkPageDetail,
  SocialPlatform,
} from '@/app/modules/link-pages/types/link-pages.types';
import { Button } from '@/resources/components/ui/button';
import { Input } from '@/resources/components/ui/input';
import { Select } from '@/resources/components/ui/select';
import {
  socialPlatformIcons,
  socialPlatformLabels,
} from '../../renderer/social-platform-icons';
import { EditorSection } from './editor-fields.component';

export function SocialManager({
  draft,
  mutations,
}: {
  draft: LinkPageDetail;
  mutations: ReturnType<typeof useLinkPageMutations>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const submitEdit = (
    event: FormEvent<HTMLFormElement>,
    socialLinkId: string,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    mutations.updateSocialLink.mutate(
      {
        socialLinkId,
        payload: {
          platform: String(formData.get('platform')) as SocialPlatform,
          url: String(formData.get('url') ?? ''),
        },
      },
      { onSuccess: () => setEditingId(null) },
    );
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    mutations.createSocialLink.mutate({
      platform: String(formData.get('platform')) as SocialPlatform,
      url: String(formData.get('url') ?? ''),
      sortOrder: draft.socialLinks.length,
      active: true,
    });
    event.currentTarget.reset();
  };

  return (
    <EditorSection title='Redes sociais'>
      <form
        className='grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]'
        onSubmit={submit}
      >
        <Select name='platform'>
          {Object.entries(socialPlatformLabels).map(([platform, label]) => (
            <option
              key={platform}
              value={platform}
            >
              {label}
            </option>
          ))}
        </Select>
        <Input
          name='url'
          placeholder='https://...'
          required
        />
        <Button
          type='submit'
          className='h-12'
        >
          Adicionar
        </Button>
      </form>
      <div className='grid gap-2'>
        {draft.socialLinks.map((socialLink) => {
          const Icon = socialPlatformIcons[socialLink.platform];
          const label = socialPlatformLabels[socialLink.platform];

          if (editingId === socialLink.id) {
            return (
              <form
                key={socialLink.id}
                className='bg-background grid gap-2 rounded-md border p-2 shadow-xs md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto_auto]'
                onSubmit={(event) => submitEdit(event, socialLink.id)}
              >
                <Select
                  name='platform'
                  defaultValue={socialLink.platform}
                >
                  {Object.entries(socialPlatformLabels).map(
                    ([platform, platformLabel]) => (
                      <option
                        key={platform}
                        value={platform}
                      >
                        {platformLabel}
                      </option>
                    ),
                  )}
                </Select>
                <Input
                  name='url'
                  defaultValue={socialLink.url}
                  placeholder='https://...'
                  required
                  autoFocus
                />
                <Button
                  type='submit'
                  className='h-12'
                  disabled={mutations.updateSocialLink.isPending}
                >
                  Salvar
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  className='h-12'
                  onClick={() => setEditingId(null)}
                >
                  Cancelar
                </Button>
              </form>
            );
          }

          return (
            <div
              key={socialLink.id}
              className='bg-background flex items-center justify-between gap-2 rounded-md border p-2 text-sm shadow-xs'
            >
              <span className='flex min-w-0 items-center gap-2'>
                <Icon
                  className='size-4 shrink-0'
                  aria-hidden='true'
                />
                <span className='shrink-0'>{label}</span>
                <span
                  className='text-muted-foreground truncate'
                  title={socialLink.url}
                >
                  {socialLink.url}
                </span>
              </span>
              <span className='flex shrink-0 gap-2'>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={() => setEditingId(socialLink.id)}
                >
                  Editar
                </Button>
                <Button
                  type='button'
                  size='sm'
                  variant='destructive'
                  onClick={() =>
                    mutations.deleteSocialLink.mutate(socialLink.id)
                  }
                >
                  Remover
                </Button>
              </span>
            </div>
          );
        })}
      </div>
    </EditorSection>
  );
}
