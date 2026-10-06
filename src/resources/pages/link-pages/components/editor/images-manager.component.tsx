import { type FormEvent } from 'react';
import { useLinkPageMutations } from '@/app/modules/link-pages/use-cases/use-link-pages.use-case';
import type { LinkPageDetail } from '@/app/modules/link-pages/types/link-pages.types';
import { Button } from '@/resources/components/ui/button';
import { Input } from '@/resources/components/ui/input';
import { EditorSection } from './editor-fields.component';

export function ImagesManager({
  draft,
  mutations,
}: {
  draft: LinkPageDetail;
  mutations: ReturnType<typeof useLinkPageMutations>;
}) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    mutations.createImage.mutate({
      imageUrl: String(formData.get('imageUrl') ?? ''),
      altText: String(formData.get('altText') ?? '') || null,
      targetUrl: String(formData.get('targetUrl') ?? '') || null,
      sortOrder: draft.images.length,
      active: true,
    });
    event.currentTarget.reset();
  };

  return (
    <EditorSection title='Imagens'>
      <form
        className='grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]'
        onSubmit={submit}
      >
        <Input
          name='imageUrl'
          placeholder='URL da imagem'
          required
        />
        <Input
          name='altText'
          placeholder='Texto alternativo'
        />
        <Input
          name='targetUrl'
          placeholder='URL destino'
        />
        <Button
          type='submit'
          className='h-12'
        >
          Adicionar
        </Button>
      </form>
      <div className='grid gap-2'>
        {draft.images.map((image) => (
          <div
            key={image.id}
            className='bg-background flex items-center justify-between gap-3 rounded-md border p-2 text-sm shadow-xs'
          >
            <span className='truncate'>{image.imageUrl}</span>
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={() => mutations.deleteImage.mutate(image.id)}
            >
              Remover
            </Button>
          </div>
        ))}
      </div>
    </EditorSection>
  );
}
