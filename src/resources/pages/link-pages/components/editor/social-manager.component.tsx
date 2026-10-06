import { type FormEvent } from 'react';
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

          return (
            <div
              key={socialLink.id}
              className='bg-background flex items-center justify-between rounded-md border p-2 text-sm shadow-xs'
            >
              <span className='flex min-w-0 items-center gap-2'>
                <Icon
                  className='size-4 shrink-0'
                  aria-hidden='true'
                />
                <span className='truncate'>{label}</span>
              </span>
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={() => mutations.deleteSocialLink.mutate(socialLink.id)}
              >
                Remover
              </Button>
            </div>
          );
        })}
      </div>
    </EditorSection>
  );
}
