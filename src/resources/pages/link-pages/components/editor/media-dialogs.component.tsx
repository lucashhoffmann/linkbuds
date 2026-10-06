import { useState, type FormEvent, type ReactNode } from 'react';
import type {
  LinkPageFooterStyle,
  LinkPageImage,
  LinkPageMediaSize,
  LinkPageText,
  LinkPageTextAlign,
  LinkPageVideo,
} from '@/app/modules/link-pages/types/link-pages.types';
import { videoEmbed } from '@/app/modules/link-pages/utils/media.util';
import { Button } from '@/resources/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/resources/components/ui/dialog';
import { Input } from '@/resources/components/ui/input';
import { Label } from '@/resources/components/ui/label';
import { Select } from '@/resources/components/ui/select';
import {
  BorderEnabledField,
  ColorField,
  Field,
  MediaSizeField,
} from './editor-fields.component';
import { RichTextEditor } from './rich-text-editor.component';

export type VideoPayload = Pick<
  LinkPageVideo,
  'url' | 'title' | 'autoplay' | 'controls' | 'size' | 'customHeight'
>;
export type TextPayload = Pick<
  LinkPageText,
  | 'content'
  | 'style'
  | 'align'
  | 'backgroundColor'
  | 'borderColor'
  | 'fullWidth'
>;
export type ImagePayload = Pick<
  LinkPageImage,
  'imageUrl' | 'altText' | 'targetUrl'
>;

/** Same shell as the link modal: title, scrollable body, sticky actions. */
function MediaDialog({
  children,
  onClose,
  onSubmit,
  submitLabel,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  submitLabel: string;
  title: string;
}) {
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit();
      onClose();
    } catch {
      // Mutation hook shows the error; keep the modal open to retry.
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className='max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          className='grid gap-4'
          onSubmit={submit}
        >
          {children}
          <DialogFooter className='bg-background sticky -bottom-6 -mx-6 -mb-6 border-t px-6 py-4'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              disabled={saving}
            >
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function VideoDialog({
  onClose,
  onSave,
  video,
}: {
  onClose: () => void;
  onSave: (payload: VideoPayload) => Promise<void>;
  video: LinkPageVideo | null;
}) {
  const [url, setUrl] = useState(video?.url ?? '');
  const [title, setTitle] = useState(video?.title ?? '');
  const [autoplay, setAutoplay] = useState(video?.autoplay ?? false);
  const [controls, setControls] = useState(video?.controls ?? true);
  const [size, setSize] = useState<LinkPageMediaSize>(video?.size ?? 'MEDIUM');
  const [customHeight, setCustomHeight] = useState(video?.customHeight ?? null);
  const urlInvalid = Boolean(url.trim()) && !videoEmbed(url, false);

  return (
    <MediaDialog
      title={video ? 'Editar vídeo' : 'Adicionar vídeo'}
      submitLabel={video ? 'Salvar alterações' : 'Adicionar vídeo'}
      onClose={onClose}
      onSubmit={async () => {
        if (urlInvalid) throw new Error('invalid video url');
        await onSave({
          url: url.trim(),
          title: title.trim() || null,
          autoplay,
          controls,
          size,
          customHeight,
        });
      }}
    >
      <div className='grid gap-2'>
        <Label htmlFor='video-url'>URL do vídeo</Label>
        <Input
          id='video-url'
          placeholder='YouTube, Vimeo ou link .mp4'
          value={url}
          aria-invalid={urlInvalid}
          onChange={(event) => setUrl(event.target.value)}
          required
        />
        {urlInvalid && (
          <p className='text-destructive text-xs'>
            Use um link do YouTube, do Vimeo ou de um arquivo .mp4/.webm.
          </p>
        )}
      </div>
      <div className='grid gap-2'>
        <Label htmlFor='video-title'>Título (opcional)</Label>
        <Input
          id='video-title'
          maxLength={120}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <div className='bg-muted/20 grid gap-4 rounded-md border p-3'>
        <p className='text-sm font-medium'>Exibição</p>
        <MediaSizeField
          id='video'
          size={size}
          customHeight={customHeight}
          onChange={(value) => {
            setSize(value.size);
            setCustomHeight(value.customHeight);
          }}
        />
        <div className='grid gap-3 sm:grid-cols-2'>
          <BorderEnabledField
            label='Tocar automaticamente (sem som)'
            checked={autoplay}
            onChange={setAutoplay}
          />
          <BorderEnabledField
            label='Mostrar controles'
            checked={controls}
            onChange={setControls}
          />
        </div>
      </div>
    </MediaDialog>
  );
}

export function ImageDialog({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (payload: ImagePayload) => Promise<void>;
}) {
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [targetUrl, setTargetUrl] = useState('');

  return (
    <MediaDialog
      title='Adicionar imagem'
      submitLabel='Adicionar imagem'
      onClose={onClose}
      onSubmit={() =>
        onSave({
          imageUrl: imageUrl.trim(),
          altText: altText.trim() || null,
          targetUrl: targetUrl.trim() || null,
        })
      }
    >
      <div className='grid gap-2'>
        <Label htmlFor='image-url'>URL da imagem</Label>
        <div className='flex items-center gap-2'>
          {imageUrl.trim() && (
            <img
              src={imageUrl.trim()}
              alt=''
              className='size-12 shrink-0 rounded-md border object-cover'
            />
          )}
          <Input
            id='image-url'
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            required
          />
        </div>
      </div>
      <div className='grid gap-2'>
        <Label htmlFor='image-alt'>Texto alternativo</Label>
        <Input
          id='image-alt'
          maxLength={180}
          value={altText}
          onChange={(event) => setAltText(event.target.value)}
        />
      </div>
      <div className='grid gap-2'>
        <Label htmlFor='image-target'>URL de destino (opcional)</Label>
        <Input
          id='image-target'
          value={targetUrl}
          onChange={(event) => setTargetUrl(event.target.value)}
        />
      </div>
    </MediaDialog>
  );
}

export function TextDialog({
  onClose,
  onSave,
  text,
}: {
  onClose: () => void;
  onSave: (payload: TextPayload) => Promise<void>;
  /** null = new text block. */
  text: LinkPageText | null;
}) {
  const [content, setContent] = useState(text?.content ?? []);
  const length = content.reduce((total, run) => total + run.text.length, 0);
  const tooLong = length > 5000;
  const empty = !content.some((run) => run.text.trim());
  const [triedEmpty, setTriedEmpty] = useState(false);
  const [style, setStyle] = useState<LinkPageFooterStyle>(
    text?.style ?? 'TEXT',
  );
  const [align, setAlign] = useState<LinkPageTextAlign>(text?.align ?? 'LEFT');
  const [backgroundColor, setBackgroundColor] = useState(
    text?.backgroundColor ?? null,
  );
  const [borderColor, setBorderColor] = useState(text?.borderColor ?? null);
  const [fullWidth, setFullWidth] = useState(text?.fullWidth ?? false);
  const boxed = style !== 'TEXT';

  return (
    <MediaDialog
      title={text ? 'Editar texto' : 'Adicionar texto'}
      submitLabel={text ? 'Salvar alterações' : 'Adicionar texto'}
      onClose={onClose}
      onSubmit={async () => {
        if (empty || tooLong) {
          setTriedEmpty(empty);
          throw new Error('invalid text');
        }
        await onSave({
          content,
          style,
          align,
          backgroundColor,
          borderColor,
          fullWidth,
        });
      }}
    >
      <div className='grid gap-4 sm:grid-cols-2'>
        <Field label='Estilo'>
          <Select
            value={style}
            onChange={(event) =>
              setStyle(event.target.value as LinkPageFooterStyle)
            }
          >
            <option value='TEXT'>Só texto</option>
            <option value='PILL'>Pílula</option>
            <option value='BOX'>Caixa</option>
          </Select>
        </Field>
        <Field label='Alinhamento'>
          <Select
            value={align}
            onChange={(event) =>
              setAlign(event.target.value as LinkPageTextAlign)
            }
          >
            <option value='LEFT'>Esquerda</option>
            <option value='CENTER'>Centro</option>
            <option value='RIGHT'>Direita</option>
          </Select>
        </Field>
        {boxed && (
          <>
            <ColorField
              label='Fundo'
              value={backgroundColor ?? '#FFFFFF'}
              onChange={setBackgroundColor}
            />
            <ColorField
              label='Borda'
              value={borderColor ?? '#E2E8F0'}
              onChange={setBorderColor}
            />
            <Field label='Largura'>
              <BorderEnabledField
                label='Preencher toda a largura'
                checked={fullWidth}
                onChange={setFullWidth}
              />
            </Field>
          </>
        )}
      </div>
      <RichTextEditor
        initialContent={content}
        onChange={setContent}
        editorStyle={{
          textAlign: align.toLowerCase() as 'left' | 'center' | 'right',
          backgroundColor: boxed ? (backgroundColor ?? '#FFFFFF') : undefined,
        }}
      />
      {triedEmpty && empty && (
        <p className='text-destructive text-xs'>Digite um texto.</p>
      )}
      {tooLong && (
        <p className='text-destructive text-xs'>
          Máximo de 5000 caracteres ({length}).
        </p>
      )}
    </MediaDialog>
  );
}
